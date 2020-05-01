import { RecipeDomain, RecipeDateDomain } from "../Domain/DomainTypes.js";
import getDB, { ISODate, DatabaseType, getReadOnlyDb } from "../../../utils/database.js";

export async function getRecipes() : Promise<RecipeDomain[]> {
   var db = await getReadOnlyDb(["recipe"])
   var recipes = await db.recipe.getAll()
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
   var db = await getReadOnlyDb(["settings"])
   var settings = await db.settings.get("mealPlanner")
   return {
      startDate: new ISODate((settings && settings.startDate) || new Date())
   }
}

export async function setMealPlannerSettings(mealPlannerSettings: MealPlannerStoreSettings) {
   var db = await getDB(["settings"])
   var settings = await db.settings.get("mealPlanner")
   if (settings) {
      settings.startDate = mealPlannerSettings.startDate.toString()
      await db.settings.put({ mealPlanner: settings })
   }
   await db.done
}

export async function getRecipeDates(startDate: ISODate, mealTimeId: number) : Promise<RecipeDateDomain[]> {
   var db = await getReadOnlyDb(["recipe-date"])
   var start = startDate.toString()
   var end = startDate.addDays(7).toString()
   var recipeDates = await db["recipe-date"].getRange(start, end, mealTimeId)
   return recipeDates.map(x => (
      { date: new ISODate(x.date)
      , mealTimeId: { _id: "meal-time", value: x.mealTimeId }
      , recipeId: { _id: "recipe", value: x.recipeId }
      , quantity: x.quantity
      }))
}

export async function setRecipeDate(data: RecipeDateDomain[]) {
   var db = await getDB(["recipe-date"])
   for (var d of data) {
      var o : DatabaseType.RecipeDateData = {
         mealTimeId: d.mealTimeId.value,
         date: d.date.toString(),
         quantity: d.quantity,
         recipeId: d.recipeId.value
      }
      await db["recipe-date"].put(o)
   }
   await db.done
}
