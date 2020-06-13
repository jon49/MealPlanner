// @ts-check
import html from "../../../layouts/html.js"

/**
 * @typedef {Object} RecipeTemplate
 * @property {string} name
 * @property {string} recipeLocation
 * @property {string} url
 * @property {string} urlTitle
 * @property {string} recipeDate 
 * @property {string} date 
 * @property {string} description
 * @property {string} searchMeal 
 */

/**
 * @typedef {Object} RecipeTemplateActions
 * @property {HTMLButtonElement} nextMeal 
 * @property {HTMLButtonElement} previousMeal 
 * @property {HTMLButtonElement} cancelMeal
 */

export const recipeTemplate = html`
<template id="_recipe-template">
   <div class="meal-edit" #id=date>
      <p>#recipeDate</p>
      <h2 #title,text=name></h2>
      <p><small><span #title,text=recipeLocation></span><a #href=url #title,text=urlTitle></a></small></p>
      <p>#description</p>
      <div>
         <button #=cancelMeal>Cancel</button>&nbsp;
         <a #href=searchMeal><button>Search</button></a>&nbsp;
         <button #=previousMeal>&laquo; Back</button>&nbsp;
         <button #=nextMeal>Next &raquo;</button>
      </div>
   </div>
</template>`
