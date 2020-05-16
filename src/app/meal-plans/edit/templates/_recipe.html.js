// @ts-check
import html from "../../../layouts/html.js"

/**
 * @typedef MealPlanTemplateId
 * @type {"_recipe-template"}
 */

/**
 * @typedef {Object} RecipeTemplate
 * @property {HTMLButtonElement} cancel-meal
 * @property {Text} name
 * @property {Text} recipe-location
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
   <aside #root>
      <header>
         <p>#recipe-date</p>
         <h2 class="text-2xl">#name</h2>
      </header>
      <p><small><span>#recipe-location</span><a #recipe-url></a></small></p>
      <p>#description</p>
      <div>
         <button #cancel-meal>Cancel</button>&nbsp;
         <a #search-meal>Search</a>&nbsp;
         <button #previous-meal>&laquo; Back</button>&nbsp;
         <button #next-meal>Next &raquo;</button>
      </div>
   </aside>
</template>`
