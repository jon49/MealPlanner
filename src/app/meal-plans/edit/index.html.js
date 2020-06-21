// @ts-check
import html from '../../layouts/html.js'
import { recipeTemplate } from './templates/_recipe.html.js'
import { cancelledRecipeTemplate } from './templates/_cancelled-recipe.html.js'

/**
 * @typedef Page
 * @property {"_meal-selections"} mealSelectionsId
 * @property {"start-date"} startDateFormId
 */

var $head = html`
<script async src="/app/utils/utils.js" type="module"></script>
<script async src="/app/utils/database.js" type="module"></script>
<style>.meal-edit { min-width: 22em; } .meal-edit h2, .meal-edit p { height: 1.25em; overflow: hidden; } main { width: 100%; } @media (max-width: 481px) { .meal-edit h2, .meal-edit p { height: auto; overflow: none; } .meal-edit { min-width: auto; } }</style>
`

var $main = html`
   <form>
      <label for="start-date">Start Date:&nbsp;</label>
      <input id="start-date" name="start-date" type="date" required />
   </form>
   <section id=_meal-selections class=cards></section>`

var $afterMain = html`
${recipeTemplate}
${cancelledRecipeTemplate}
<script src="/app/meal-plans/edit/index.js" async type="module"></script>
<template id=add-new-meal><div><a href="/app/meals/add">Add New Meal</a></div></template>`

/** @type {Partial<import("../../layouts/_default.builder.html.js").DefaultTemplate>} */
const page = {
   $head,
   $header: "<h1>Meal Planner</h1>",
   $title: "Plan Meals",
   $main,
   $afterMain,
}

export default page
