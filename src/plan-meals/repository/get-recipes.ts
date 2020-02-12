import { getDb } from "../../utils/utils.js"

export async function getRecipes() {
   var db = await getDb();
   return await db.getAll("recipe")
}
