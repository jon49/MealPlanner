import getDb, { RecipeDateData, TypeOrDeleted, isDeleted } from "../../utils/database.js"
import { ISODate } from "../../utils/utils.js";
import { RecipeDomain, RecipeDateDomain } from "../Domain/DomainTypes.js";

const not = <T>(f: (val: T) => boolean) => (val: T) => !f(val)

export async function getRecipes() : Promise<TypeOrDeleted<RecipeDomain>[]> {
   var db = await getDb()
   var recipes = await db.getAll("recipe")
   return recipes.map(x => (
      { location: x.location
      , id: { isRecipeId: true, value: x.id }
      , name: x.name
      , lastUpdated: x.lastUpdated
      , isDeleted: isDeleted(x)
      }))
}

export const getActiveRecipes = async () : Promise<RecipeDomain[]> =>
   (await getRecipes()).filter(not(isDeleted))

export async function getRecipeDates(startDate: ISODate, categoryId: number) : Promise<TypeOrDeleted<RecipeDateDomain>[]> {
   var db = await getDb()
   var start = startDate.toString()
   var end = startDate.addDays(7).toString()
   var recipeDates = await db.getAll("recipe-date", IDBKeyRange.bound([start, categoryId], [end, categoryId]))
   return recipeDates.map(x => (
      { date: new ISODate(x.date)
      , categoryId: { isCategoryId: true, value: x.categoryId }
      , recipeId: { isRecipeId: true, value: x.recipeId }
      , quantity: x.quantity
      , lastUpdated: x.lastUpdated
      , isDeleted: isDeleted(x)
      }))
}

export async function setRecipeDate(data: TypeOrDeleted<RecipeDateDomain>[]) {
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
