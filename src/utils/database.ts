import { openDB, DBSchema } from "idb"

type LocationBook = { book: string, page: number } 
type LocationUrl = { title: string, url: string }
type LocationOther = string
export type Location = LocationBook | LocationUrl | LocationOther

export interface RecipeData {
   id: number
   name: string
   location: Location
}

interface RecipeStore {
   key: number
   value: RecipeData
}

interface MealPlanner extends DBSchema {
   recipe: RecipeStore
}

export default async function getDB() {
   return openDB<MealPlanner>("meal-planner", 1, {
      upgrade(db) {
         db.createObjectStore("recipe", {
            keyPath: "id"
         })
      }
   })
}
