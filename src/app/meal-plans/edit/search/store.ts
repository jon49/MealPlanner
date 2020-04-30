import getDb, { DatabaseType } from "../../../utils/database.js"
import { RecipeDomain, RecipeDateDomain } from "../Domain/DomainTypes.js";

export async function getActiveRecipes() : Promise<RecipeDomain[]> {
   var db = await getDb()
   var recipes = await db.getAll("recipe")
   return recipes.map(x => (
      { location: x.location
      , id: { _id: "recipe", value: x.id }
      , name: x.name
      }))
}

export async function setRecipeDate(data: RecipeDateDomain[]) {
   var db = await getDb()
   var tx = db.transaction("recipe-date", "readwrite")
   for (var d of data) {
      var o : DatabaseType.RecipeDateData = {
         categoryId: d.categoryId.value,
         date: d.date.toString(),
         quantity: d.quantity,
         recipeId: d.recipeId.value,
      }
      tx.store.put(o)
   }
   await tx.done
}
