import { openDB, DBSchema, IDBPObjectStore, IDBPTransaction } from "idb"
import ISODate from "./ISODate.js"

export { ISODate }

export namespace DatabaseType {
   type LocationKinds = "book" | "url" | "other"
   interface LocationKind<T extends LocationKinds> { _kind: T }
   interface LocationBook extends LocationKind<"book"> {  book: string, page: number } 
   interface LocationUrl extends LocationKind<"url"> { title: string, url: string }
   interface LocationOther extends LocationKind<"other"> { other: string }
   export type Location = LocationBook | LocationUrl | LocationOther

   /** E.g., Dinner, Lunch, etc */
   export interface CategoryData {
      // int
      id: number
      /** name of category */
      name: string 
   }

   export interface RecipeDateData {
      date: string
      categoryId: number
      recipeId: number
      /** Number of meals */
      quantity: number
   }

   export interface RecipeData {
      id: number
      name: string
      location: Location
      categories: number[]
   }

   export interface MealPlannerSettings {
      /** ISODate E.g., 2020-02-20 */
      startDate: string
   }
   export interface SettingsData {
      mealPlanner: MealPlannerSettings
   }

   export interface ChangeLog {
      tableName: keyof MealPlanner_
      recordId: (string|number)[]
      deleted?: boolean
   }
}

interface CategoryStore { key: number; value: DatabaseType.CategoryData }
interface RecipeDateStore { key: number; value: DatabaseType.RecipeDateData }
interface RecipeStore { key: number; value: DatabaseType.RecipeData }
type SettingsKey = keyof DatabaseType.SettingsData
interface SettingsStore { key: SettingsKey; value: DatabaseType.SettingsData[SettingsKey]  }
// interface SettingsStore { key: SettingsKey; value: Partial<DatabaseType.SettingsData> }
interface ChangeLogStore { key: number, value: DatabaseType.ChangeLog }

export interface MealPlanner_ {
   recipe: RecipeStore
   category: CategoryStore
   "recipe-date": RecipeDateStore
   settings: SettingsStore
}
interface MealPlanner__ extends MealPlanner_ {
   "change-log": ChangeLogStore
}
export interface MealPlanner extends DBSchema, MealPlanner__ {
}
type MealPlannerTable = keyof MealPlanner_
type AllTableNames = keyof MealPlanner__
type MealPlannerTransaction = IDBPTransaction<MealPlanner, AllTableNames[]>
type ChangeLogObjectStore = IDBPObjectStore<MealPlanner, AllTableNames[], "change-log">

const createRecipePut = (tx: MealPlannerTransaction, changeLog: ChangeLogObjectStore) => {
   const recipeStore = tx.objectStore("recipe")
   return async (o: DatabaseType.RecipeData) => {
      await Promise.all([recipeStore.put(o), changeLog.put({tableName: "recipe", recordId: [o.id]})])
} }

const createCategoryPut = (tx: MealPlannerTransaction, changeLog: ChangeLogObjectStore) => {
   const categoryStore = tx.objectStore("category")
   return async (o: DatabaseType.CategoryData) => {
      await Promise.all([categoryStore.put(o), changeLog.put({tableName: "category", recordId: [o.id]})])
} }

const createRecipeDatePut = (tx: MealPlannerTransaction, changeLog: ChangeLogObjectStore) => {
   const recipeDateStore = tx.objectStore("recipe-date")
   return async (o: DatabaseType.RecipeDateData) => {
      await Promise.all([recipeDateStore.put(o), changeLog.put({tableName: "recipe-date", recordId: [o.date, o.categoryId]})])
} }

const createSettingsPut = (tx: MealPlannerTransaction, changeLog: ChangeLogObjectStore) => {
   const settingsStore = tx.objectStore("settings")
   return async (o: Partial<DatabaseType.SettingsData>) => {
      for (const key of Object.keys(o)) {
         const value = o[<SettingsKey>key]
         if (value) {
            await Promise.all([settingsStore.put(value, <SettingsKey>key), changeLog.put({tableName: "settings", recordId: [key]})])
         }
      }
} }

type PickFactory<T extends {[K: string]:(...args: any) => any}, S extends keyof T> = { [K in S]: ReturnType<T[K]> }
export async function upsert<T extends MealPlannerTable>(tables: T[]) {
   const db = await getDB()
   const tableWithChangeLog : AllTableNames[] = tables
   tableWithChangeLog.push("change-log")
   const tx = db.transaction(tableWithChangeLog, "readwrite")
   const changeLog = tx.objectStore("change-log")
   const update = {
      recipe: createRecipePut,
      category: createCategoryPut,
      "recipe-date": createRecipeDatePut,
      settings: createSettingsPut
   }
   const result : PickFactory<typeof update, T> = tables.reduce((acc, value) => {
      acc[value] = update[value](tx, changeLog)
      return acc
   }, <any>{})
   return result
}

export default async function getDB() {
   return openDB<MealPlanner>("meal-planner", 14, {
      async upgrade(db, oldVersion, newVersion, tx) {
         var stores = db.objectStoreNames
         if (!stores.contains("category")) {
            db.createObjectStore("category", { keyPath: "id" })
         }

         if (!stores.contains("settings")) {
            db.createObjectStore("settings")
            tx.objectStore("settings")
            .put({ startDate: new ISODate(new Date()).toString() }, "mealPlanner")
         }

         if (!stores.contains("recipe-date")) {
            db.createObjectStore("recipe-date", { keyPath: ["date", "categoryId"] })
         }

         if (!stores.contains("recipe")) {
            db.createObjectStore("recipe", { keyPath: "id" })
         }

         if (!stores.contains("change-log")) {
            db.createObjectStore("change-log", { keyPath: ["tableName", "recordId"] })
         }

         if (oldVersion !== newVersion && newVersion === 10) {
            {
               let cursor = await tx.objectStore("recipe").openCursor()
               while(cursor) {
                  let newValue = { ...cursor.value }
                  await cursor.update(newValue)
                  cursor = await cursor.continue()
               }
            }
            {
               let cursor = await tx.objectStore("category").openCursor()
               if (!cursor) {
                  let newValue: DatabaseType.CategoryData = {
                     id: 1,
                     name: "Dinner"
                  }
                  tx.objectStore("category").put(newValue)
               }
               while (cursor) {
                  let newValue = { ...cursor.value }
                  await cursor.update(newValue)
                  cursor = await cursor.continue()
               }
            }
            {
               let cursor = await tx.objectStore("recipe-date").openCursor()
               while (cursor) {
                  let newValue = { ...cursor.value }
                  await cursor.update(newValue)
                  cursor = await cursor.continue()
               }
            }
         }
      }
   })
}
