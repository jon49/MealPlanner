// @ts-check
import html from "../../../layouts/html.js"

/**
 * @typedef CancelledRecipeTemplateId
 * @type {"_cancelled-recipe-template"}
 */

/**
 * @typedef {Object} CancelledRecipeTemplate
 * @property {string} date
 */

/**
 * @typedef {Object} CancelledRecipeTemplateActions
 * @property {HTMLButtonElement} addRecipe
 */

export const cancelledRecipeTemplate = html`
<template id="_cancelled-recipe-template">
   <article>
      <p>#date</p>
      <h2>No Recipe Chosen</h2>
      <button #=addRecipe>Add Recipe</button>
   </article>
</template>
`

