// @ts-check
import html from "../../../layouts/html.js"

/**
 * @typedef MealPlanTemplateId
 * @type {"_recipe-template"}
 */

/**
 * @typedef {Object} RecipeTemplate
 * @property {HTMLButtonElement} cancel-meal
 * @property {HTMLH2Element} name
 * @property {HTMLSpanElement} recipe-location
 * @property {HTMLAnchorElement} recipe-url 
 * @property {Text} recipe-date 
 * @property {Text} description 
 * @property {HTMLButtonElement} next-meal 
 * @property {HTMLButtonElement} previous-meal 
 * @property {HTMLAnchorElement} search-meal 
 * @property {HTMLDivElement} root 
 */

export const recipeTemplate = html`
<template id="_recipe-template">
   <article class="meal-edit" #root>
      <p>#recipe-date</p>
      <h2 #name></h2>
      <p><small><span #recipe-location></span><a #recipe-url></a></small></p>
      <p>#description</p>
      <div>
         <button #cancel-meal>Cancel</button>&nbsp;
         <a #search-meal><button>Search</button></a>&nbsp;
         <button #previous-meal>&laquo; Back</button>&nbsp;
         <button #next-meal>Next &raquo;</button>
      </div>
   </article>
</template>`
