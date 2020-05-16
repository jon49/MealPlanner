// @ts-check
import html from "../../../layouts/html.js"

/**
 * @typedef CancelledRecipeTemplateId
 * @type {"_cancelled-recipe-template"}
 */

/**
 * @typedef {Object} CancelledRecipeTemplate
 * @property {HTMLDivElement} root
 * @property {HTMLButtonElement} add-recipe
 * @property {Text} date
 */

export const cancelledRecipeTemplate = html`
<template id="_cancelled-recipe-template">
   <aside #root>
      <p>#date</p>
      <h2 class="text-2xl">No Recipe Chosen</h2>
      <button #add-recipe>Add Recipe</button>
   </aside>
</template>
`

