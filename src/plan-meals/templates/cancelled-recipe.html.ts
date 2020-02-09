import html from "../../layouts/util.js"

export type CancelledRecipeTemplateId = "_cancelled-recipe-template"
export interface CancelledRecipeTemplate {
   root: HTMLDivElement
   "add-recipe": HTMLButtonElement
   date: Text
}

export const cancelledRecipeTemplate = html`
<template id="_cancelled-recipe-template">
   <div #root>
      <p><small>#date</small></p>
      <button #add-recipe>Add Recipe</button>
      <h2>No Recipe Chosen</h2>
   </div>
</template>
`

