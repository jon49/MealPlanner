import { getDb } from "../../utils/utils.js"
import { RecipeDateData } from "../../utils/database.js";

export async function getRecipes() {
   var db = await getDb();
   return await db.getAll("recipe")
}

export async function setRecipeDate(data: { recipeId: number, date: Date }[]) {
   var db = await getDb()
   var tx = db.transaction("recipe-date", "readwrite")
   for (var { recipeId, date } of data) {
      var o : RecipeDateData = {
         categoryId: 1,
         date: date.toISOString().substr(0, 10),
         quantity: 1,
         recipeId
      }
      tx.store.put(o)
   }
   await tx.done
}
