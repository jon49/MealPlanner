import html from "../../../layouts/util.js"

export type CancelledRecipeTemplateId = "_cancelled-recipe-template"
export interface CancelledRecipeTemplate {
   root: HTMLDivElement
   "add-recipe": HTMLButtonElement
   date: Text
}

export const cancelledRecipeTemplate = html`
<template id="_cancelled-recipe-template">
   <aside #root>
      <p>#date</p>
      <h2 class="text-2xl">No Recipe Chosen</h2>
      <button #add-recipe>Add Recipe</button>
   </aside>
</template>
`

