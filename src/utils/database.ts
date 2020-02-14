import { openDB, DBSchema } from "idb"

type LocationBook = { book: string, page: number } 
type LocationUrl = { title: string, url: string }
type LocationOther = string
export type Location = LocationBook | LocationUrl | LocationOther

interface CategoryStore { key: number; value: CategoryData }
/** E.g., Dinner, Lunch, etc */
export interface CategoryData {
   // int
   id: number
   /** name of category */
   name: string 
}

interface RecipeDateStore { key: number; value: RecipeDateData }
export interface RecipeDateData {
   date: string
   categoryId: number
   recipeId: number
   /** Number of meals */
   quantity: number
}

interface RecipeStore { key: number; value: RecipeData }
export interface RecipeData {
   id: number
   name: string
   location: Location
}

interface MealPlanner extends DBSchema {
   recipe: RecipeStore
   category: CategoryStore
   "recipe-date": RecipeDateStore
}

export default async function getDB() {
   return openDB<MealPlanner>("meal-planner", 9, {
      upgrade(db) {
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
      }
   })
}
