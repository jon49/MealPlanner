import getDB, { DatabaseType, getReadOnlyDb } from "../../../utils/database.js"
import { RecipeDomain, RecipeDateDomain } from "../Domain/DomainTypes.js";

export async function getActiveRecipes() : Promise<RecipeDomain[]> {
   var db = await getReadOnlyDb(["recipe"])
   var recipes = await db.recipe.getAll()
   return recipes.map(x => (
      { location: x.location
      , id: { _id: "recipe", value: x.id }
      , name: x.name
      }))
}

export async function setRecipeDate(data: RecipeDateDomain[]) {
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
