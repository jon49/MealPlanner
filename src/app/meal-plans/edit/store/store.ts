import { RecipeDomain, RecipeDateDomain } from "../Domain/DomainTypes.js";
import getDB, { ISODate, DatabaseType } from "../../../utils/database.js";

export async function getRecipes() : Promise<RecipeDomain[]> {
   var db = await getDB()
   var recipes = await db.getAll("recipe")
   return recipes.map(x => (
      { location: x.location
      , id: { _id: "recipe", value: x.id }
      , name: x.name
      }))
}

export const getActiveRecipes = async () : Promise<RecipeDomain[]> =>
   await getRecipes()

interface MealPlannerStoreSettings { startDate: ISODate }
export async function getMealPlannerSettings() : Promise<MealPlannerStoreSettings> {
   var db = await getDB()
   var settings = await db.get("settings", "mealPlanner")
   return {
      startDate: new ISODate((settings && settings.startDate) || new Date())
   }
}

export async function setMealPlannerSettings(mealPlannerSettings: MealPlannerStoreSettings) {
   var db = await getDB()
   var settings = await db.get("settings", "mealPlanner")
   if (settings) {
      settings.startDate = mealPlannerSettings.startDate.toString()
      await db.put("settings", settings, "mealPlanner")
   }
}

export async function getRecipeDates(startDate: ISODate, categoryId: number) : Promise<RecipeDateDomain[]> {
   var db = await getDB()
   var start = startDate.toString()
   var end = startDate.addDays(7).toString()
   var recipeDates = await db.getAll("recipe-date", IDBKeyRange.bound([start, categoryId], [end, categoryId]))
   return recipeDates.map(x => (
      { date: new ISODate(x.date)
      , categoryId: { _id: "category", value: x.categoryId }
      , recipeId: { _id: "recipe", value: x.recipeId }
      , quantity: x.quantity
      }))
}

export async function setRecipeDate(data: RecipeDateDomain[]) {
   var db = await getDB()
   var tx = db.transaction("recipe-date", "readwrite")
   for (var d of data) {
      var o : DatabaseType.RecipeDateData = {
         categoryId: d.categoryId.value,
         date: d.date.toString(),
         quantity: d.quantity,
         recipeId: d.recipeId.value
      }
      tx.store.put(o)
   }
   await tx.done
}
