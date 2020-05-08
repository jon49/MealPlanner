import { CancelledRecipeTemplate, CancelledRecipeTemplateId } from "./_cancelled-recipe.html.js"
import template from "../../../utils/template.js"
import { ISODate } from "../../../utils/database.js"

interface CancelledRecipeOptions {
   date: ISODate
}

export interface CancelledRecipe {
   nodes: CancelledRecipeTemplate
   date: ISODate
}

var cancelledRecipeView = template.get<CancelledRecipeTemplateId>("_cancelled-recipe-template")
export var addRecipe = new WeakMap<HTMLButtonElement, CancelledRecipe>()

export function CreateCancelledRecipe({ date } : CancelledRecipeOptions) : Promise<CancelledRecipe> {
   var root = cancelledRecipeView.cloneNode(true)
   var nodes = <CancelledRecipeTemplate>cancelledRecipeView.collect(root)
   nodes.date.nodeValue = date.getDate().toLocaleDateString()
   var cancelRecipe : CancelledRecipe = { nodes, date }
   addRecipe.set(nodes["add-recipe"], cancelRecipe)

   return Promise.resolve(cancelRecipe)
}
