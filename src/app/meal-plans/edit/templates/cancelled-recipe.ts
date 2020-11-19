// import { CancelledRecipeTemplate, CancelledRecipeTemplateActions } from "./_cancelled-recipe.html.js"
// import template, { Template } from "../../../utils/hash-template.js"
// import { ISODate } from "../../../utils/utils.js"

// interface CancelledRecipeOptions {
//    date: ISODate
// }

// export interface CancelledRecipe {
//    cancel: Template<CancelledRecipeTemplate, CancelledRecipeTemplateActions>
//    date: ISODate
//    actions: { addRecipe: HTMLButtonElement }
// }

// var generator = template<CancelledRecipeTemplate, CancelledRecipeTemplateActions>(<HTMLTemplateElement>document.getElementById("_cancelled-recipe-template"))
// export var addRecipe = new WeakMap<HTMLButtonElement, CancelledRecipe>()

// export function CreateCancelledRecipe({ date } : CancelledRecipeOptions) : Promise<CancelledRecipe> {
//    try {
//       const cancel = generator({
//          date: date.getDate().toLocaleDateString()
//       })
//       var cancelRecipe : CancelledRecipe = { cancel, date, actions: { addRecipe: cancel.getNodes(["addRecipe"]).addRecipe }}
//       addRecipe.set(cancelRecipe.actions.addRecipe, cancelRecipe)
//    } catch (ex) {
//       return Promise.reject(ex)
//    }

//    return Promise.resolve(cancelRecipe)
// }
