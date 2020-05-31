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
   <article #root>
      <p>#date</p>
      <h2>No Recipe Chosen</h2>
      <button #add-recipe>Add Recipe</button>
   </article>
</template>
`

