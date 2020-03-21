import getDb, { isDeleted, RecipeDateData } from "../../../utils/database.js"
import { RecipeDomain, RecipeDateDomain } from "../Domain/DomainTypes.js";

export async function getActiveRecipes() : Promise<RecipeDomain[]> {
   var db = await getDb()
   var recipes = await db.getAll("recipe")
   return recipes.filter(x => !isDeleted(x)).map(x => (
      { location: x.location
      , id: { isRecipeId: true, value: x.id }
      , name: x.name
      , lastUpdated: x.lastUpdated
      }))
}

export async function setRecipeDate(data: RecipeDateDomain[]) {
   var db = await getDb()
   var tx = db.transaction("recipe-date", "readwrite")
   var lastUpdated = Date.now()
   for (var d of data) {
      var o : RecipeDateData = {
         categoryId: d.categoryId.value,
         date: d.date.toString(),
         quantity: d.quantity,
         recipeId: d.recipeId.value,
         lastUpdated: d.lastUpdated || lastUpdated
      }
      tx.store.put(o)
   }
   await tx.done
}
