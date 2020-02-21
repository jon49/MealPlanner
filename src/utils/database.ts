import { openDB, DBSchema } from "idb"

interface Tracking {
   lastUpdated: number
}

export interface Deleted {
   isDeleted: true
}

export type TypeOrDeleted<T> = T | T & Deleted

export var isDeleted = <T>(x: TypeOrDeleted<T>) => "isDeleted" in x && x.isDeleted

type LocationBook = { book: string, page: number } 
type LocationUrl = { title: string, url: string }
type LocationOther = string
export type Location = LocationBook | LocationUrl | LocationOther

interface CategoryStore { key: number; value: TypeOrDeleted<CategoryData> }
/** E.g., Dinner, Lunch, etc */
export interface CategoryData extends Tracking {
   // int
   id: number
   /** name of category */
   name: string 
}

interface RecipeDateStore { key: number; value: TypeOrDeleted<RecipeDateData> }
export interface RecipeDateData extends Tracking {
   date: string
   categoryId: number
   recipeId: number
   /** Number of meals */
   quantity: number
}

interface RecipeStore { key: number; value: TypeOrDeleted<RecipeData> }
export interface RecipeData extends Tracking {
   id: number
   name: string
   location: Location
}

export interface MealPlanner extends DBSchema {
   recipe: RecipeStore
   category: CategoryStore
   "recipe-date": RecipeDateStore
}

export default async function getDB() {
   return openDB<MealPlanner>("meal-planner", 10, {
      async upgrade(db, oldVersion, newVersion, tx) {
         var stores = db.objectStoreNames
         if (!stores.contains("category")) {
            db.createObjectStore("category", { keyPath: "id" })
         }

         if (!stores.contains("recipe-date")) {
            db.createObjectStore("recipe-date", { keyPath: ["date", "categoryId"] })
         }

         if (!stores.contains("recipe")) {
            db.createObjectStore("recipe", { keyPath: "id" })
         }

         if (oldVersion !== newVersion && newVersion === 10) {
            let lastUpdated = +(new Date())
            {
               let cursor = await tx.objectStore("recipe").openCursor()
               while(cursor) {
                  let newValue = { ...cursor.value, lastUpdated }
                  await cursor.update(newValue)
                  cursor = await cursor.continue()
               }
            }
            {
               let cursor = await tx.objectStore("category").openCursor()
               if (!cursor) {
                  let newValue : CategoryData = {
                     id: 1,
                     lastUpdated,
                     name: "Dinner"
                  }
                  tx.objectStore("category").put(newValue)
               }
               while (cursor) {
                  let newValue = { ...cursor.value, lastUpdated }
                  await cursor.update(newValue)
                  cursor = await cursor.continue()
               }
            }
            {
               let cursor = await tx.objectStore("recipe-date").openCursor()
               while (cursor) {
                  let newValue = { ...cursor.value, lastUpdated }
                  await cursor.update(newValue)
                  cursor = await cursor.continue()
               }
            }
         }
      }
   })
}
