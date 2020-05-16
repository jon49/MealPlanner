import { DBSchema, IDBPObjectStore, IDBPTransaction, IDBPDatabase } from "idb"
import { openDB as OPEND_DB } from "idb/build/esm/entry"
import openDB from "./idb.js"
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
   export interface MealTimeData {
      // int
      id: number
      /** name of meal time */
      name: string 
   }

   export interface RecipeDateData {
      date: string
      mealTimeId: number
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

interface MealTimeSchema { key: number; value: DatabaseType.MealTimeData }
interface RecipeDateSchema { key: number; value: DatabaseType.RecipeDateData }
interface RecipeSchema { key: number; value: DatabaseType.RecipeData }
type SettingsKey = keyof DatabaseType.SettingsData
interface SettingsSchema { key: SettingsKey; value: DatabaseType.SettingsData[SettingsKey]  }
interface ChangeLogSchema { key: number, value: DatabaseType.ChangeLog }

export interface MealPlanner_ {
   recipe: RecipeSchema
   "meal-time": MealTimeSchema
   "recipe-date": RecipeDateSchema
   settings: SettingsSchema
}
interface MealPlanner__ extends MealPlanner_ {
   "change-log": ChangeLogSchema
}
export interface MealPlanner extends DBSchema, MealPlanner__ {
}
type MealPlannerTable = keyof MealPlanner_
type AllTableNames = keyof MealPlanner__
type MealPlannerTransaction = IDBPTransaction<MealPlanner, AllTableNames[]>
type ChangeLogObjectStore = IDBPObjectStore<MealPlanner, AllTableNames[], "change-log">

class RecipeStore {
   private changeLog: ChangeLogObjectStore
   private recipeStore: IDBPObjectStore<MealPlanner, AllTableNames[], "recipe">
   constructor(tx: MealPlannerTransaction, changeLog: ChangeLogObjectStore) {
      this.changeLog = changeLog
      this.recipeStore = tx.objectStore("recipe")
   }
   async get(id: number) { return await this.recipeStore.get(id) }
   async getAll() { return await this.recipeStore.getAll() }
   put(o: DatabaseType.RecipeData) {
      this.changeLog.put({tableName: "recipe", recordId: [o.id]})
      return this.recipeStore.put(o)
   }
}

class MealTimeStore {
   private changeLog: ChangeLogObjectStore
   private store: IDBPObjectStore<MealPlanner, AllTableNames[], "meal-time">
   constructor(tx: MealPlannerTransaction, changeLog: ChangeLogObjectStore) {
      this.changeLog = changeLog
      this.store = tx.objectStore("meal-time")
   }
   async get(id: number) { return await this.store.get(id) }
   put(o: DatabaseType.MealTimeData) {
      this.changeLog.put({tableName: "meal-time", recordId: [o.id]})
      return this.store.put(o)
   }
}

class RecipeDateStore {
   private changeLog: ChangeLogObjectStore
   private recipeDateStore: IDBPObjectStore<MealPlanner, AllTableNames[], "recipe-date">
   constructor(tx: MealPlannerTransaction, changeLog: ChangeLogObjectStore) {
      this.changeLog = changeLog
      this.recipeDateStore = tx.objectStore("recipe-date")
   }
   async get(id: number) { return await this.recipeDateStore.get(id) }
   async getAll(range: IDBKeyRange) { return await this.recipeDateStore.getAll(range) }
   put(o: DatabaseType.RecipeDateData) {
      this.changeLog.put({tableName: "recipe-date", recordId: [o.date, o.mealTimeId]})
      return this.recipeDateStore.put(o)
   }
}

class SettingsStore {
   private changeLog: ChangeLogObjectStore
   private store: IDBPObjectStore<MealPlanner, AllTableNames[], "settings">
   constructor(tx: MealPlannerTransaction, changeLog: ChangeLogObjectStore) {
      this.changeLog = changeLog
      this.store = tx.objectStore("settings")
   }
   async get(id: SettingsKey) { return await this.store.get(id) }
   put(o: Partial<DatabaseType.SettingsData>) {
      for (const key of Object.keys(o)) {
         const value = o[<SettingsKey>key]
         if (value) {
            this.store.put(value, <SettingsKey>key)
            this.changeLog.put({tableName: "settings", recordId: [key]})
         }
      }
   }
}

type PickClassFactory<T extends {[K: string]: new (...args: any) => any}, S extends keyof T> = { [K in S]: InstanceType<T[K]> }
export default async function getDB<T extends MealPlannerTable>(tables: T[]) {
   const db = await getDB_()
   const tableWithChangeLog = (<AllTableNames[]>tables).concat("change-log")
   const tx = db.transaction(tableWithChangeLog, "readwrite")
   const changeLog = tx.objectStore("change-log")
   const update = {
      recipe: RecipeStore,
      "meal-time": MealTimeStore,
      "recipe-date": RecipeDateStore,
      settings: SettingsStore
   }
   const result : PickClassFactory<typeof update, T> = tables.reduce((acc, value) => {
      acc[value] = new update[value](tx, changeLog)
      return acc
   }, <any>{})
   return { ...result, get done() { return tx.done } }
}

class RecipeRead {
   db: IDBPDatabase<MealPlanner>
   constructor(db: IDBPDatabase<MealPlanner>) {
      this.db = db
   }
   get(id: number) { return this.db.get("recipe", id) }
   getAll() { return this.db.getAll("recipe") }
}

class MealTimeRead {
   db: IDBPDatabase<MealPlanner>
   constructor(db: IDBPDatabase<MealPlanner>) {
      this.db = db
   }
   get(id: number) { return this.db.get("meal-time", id) }
   getAll() { return this.db.getAll("meal-time") }
}

class RecipeDateRead {
   db: IDBPDatabase<MealPlanner>
   constructor(db: IDBPDatabase<MealPlanner>) {
      this.db = db
   }
   getRange(start: string, end: string, mealTimeId: number) { return this.db.getAll("recipe-date", IDBKeyRange.bound([start, mealTimeId], [end, mealTimeId])) }
}

class SettingsRead {
   db: IDBPDatabase<MealPlanner>
   constructor(db: IDBPDatabase<MealPlanner>) {
      this.db = db
   }
   get(id: SettingsKey) { return this.db.get("settings", id) }
   getAll() { return this.db.getAll("settings") }
}

class ChangeLogRead {
   db: IDBPDatabase<MealPlanner>
   constructor(db: IDBPDatabase<MealPlanner>) {
      this.db = db
   }
   getAll() { return this.db.getAll("change-log") }
}

export async function getReadOnlyDb<T extends AllTableNames>(tables: T[]) {
   const db = await getDB_()
   const readOnly = {
      recipe: RecipeRead,
      "meal-time": MealTimeRead,
      "recipe-date": RecipeDateRead,
      settings: SettingsRead,
      "change-log": ChangeLogRead,
   }
   const result : PickClassFactory<typeof readOnly, T> = tables.reduce((acc, value) => {
      acc[value] = new readOnly[value](db)
      return acc
   }, <any>{})
   return result
}

async function getDB_() {
   return (<typeof OPEND_DB>openDB)<MealPlanner>("meal-planner", 18, {
      async upgrade(db, _, __, tx) {
         var stores = db.objectStoreNames
         if (!stores.contains("meal-time")) {
            db.createObjectStore("meal-time", { keyPath: "id" })
            tx.objectStore("meal-time").put({ id: 1, name: "Dinner" })
         }

         if (!stores.contains("settings")) {
            db.createObjectStore("settings")
            tx.objectStore("settings")
            .put({ startDate: new ISODate(new Date()).toString() }, "mealPlanner")
         }

         if (!stores.contains("recipe-date")) {
            db.createObjectStore("recipe-date", { keyPath: ["date", "mealTimeId"] })
         }

         if (!stores.contains("recipe")) {
            db.createObjectStore("recipe", { keyPath: "id" })
         }

         if (!stores.contains("change-log")) {
            db.createObjectStore("change-log", { keyPath: ["tableName", "recordId"] })
         }

      }
   })
}
