import { CancelledRecipeTemplate, CancelledRecipeTemplateId } from "./cancelled-recipe.html.js"
import { getTemplate } from "../../utils/utils.js"

interface CancelledRecipeOptions {
   date: Date
}

export interface CancelledRecipe {
   nodes: CancelledRecipeTemplate
   date: Date
}

var cancelledRecipeView = getTemplate<CancelledRecipeTemplateId>("_cancelled-recipe-template")
export var addRecipe = new WeakMap<HTMLButtonElement, CancelledRecipe>()

export function CreateCancelledRecipe({ date } : CancelledRecipeOptions) : CancelledRecipe {
   var root = cancelledRecipeView.cloneNode(true)
   var nodes = <CancelledRecipeTemplate>cancelledRecipeView.collect(root)
   nodes.date.nodeValue = date.toLocaleDateString()
   var cancelRecipe : CancelledRecipe = { nodes, date }
   addRecipe.set(nodes["add-recipe"], cancelRecipe)

   return cancelRecipe
}
