import getDB, { DatabaseType, getReadOnlyDb } from "../../../utils/database.js"
import { RecipeDomain, RecipeDateDomain } from "../Domain/DomainTypes.js";
import { tryCatch, tryCatchArgs } from "../../../utils/fp.js"

async function _getActiveRecipes() : Promise<RecipeDomain[]> {
   var db = await getReadOnlyDb(["recipe"])
   var recipes = await db.recipe.getAll()
   return recipes.map(x => (
      { location: x.location
      , id: { _id: "recipe", value: x.id }
      , name: x.name
      }))
}

export const getActiveRecipes = tryCatch(_getActiveRecipes)

async function _setRecipeDate(data: RecipeDateDomain[]) {
   var db = await getDB(["recipe-date"])
   for (var d of data) {
      var o : DatabaseType.RecipeDateData = {
         mealTimeId: d.mealTimeId.value,
         date: d.date.toString(),
         quantity: d.quantity,
         recipeId: d.recipeId.value,
      }
      db["recipe-date"].put(o)
   }
   await db.done
}

export const setRecipeDate = tryCatchArgs(_setRecipeDate)
