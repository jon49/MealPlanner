import getDb from "../../utils/database.js"
import { RecipeDateData, RecipeData, Deleted } from "../../utils/database.js";

var isRecipeData = (x: RecipeData | Deleted<RecipeData>) : x is RecipeData => !("deleted" in x)

export async function getRecipes() : Promise<RecipeData[]> {
   var db = await getDb();
   var recipes = await db.getAll("recipe")
   return recipes.filter(isRecipeData)
}

export async function setRecipeDate(data: { recipeId: number, date: Date }[]) {
   var db = await getDb()
   var tx = db.transaction("recipe-date", "readwrite")
   var lastUpdated = +(new Date())
   for (var { recipeId, date } of data) {
      var o : RecipeDateData = {
         categoryId: 1,
         date: date.toISOString().substr(0, 10),
         quantity: 1,
         recipeId,
         lastUpdated
      }
      tx.store.put(o)
   }
   await tx.done
}
