import html from '../layouts/util.js'
import _default from "../layouts/_default.html.js"

export interface Page {
   mealSelectionsId: "_meal-selections"
   mealPlannerDetails: {
      startDateFormId: "_start-date"
   }
}

var main = html`
   <form id="_start-date">
      <label for="start-date"> Start Date: </label>
      <input name="start-date" type="date" required />
   </form>
   <div id="_meal-selections"></div>`

export type MealPlanTemplateId = "_recipe-template"

export interface RecipeTemplate {
   "cancel-meal": HTMLButtonElement
   name: Text
   "recipe-location": Text
   "recipe-date": Text
   description: Text
   "change-meal": HTMLButtonElement
   root: HTMLDivElement
}

var recipeTemplate = html`
<template id="_recipe-template">
   <div #root>
      <div><small>#recipe-date</small></div>
      <div>
         <button #cancel-meal>Cancel Meal</button>
         <button #change-meal>Change Meal</button>
      </div>
      <h2>#name</h2>
      <p><small>#recipe-location</small></p>
      <p>#description</p>
   </div>
</template>`

export type CancelledRecipeTemplateId = "_cancelled-recipe-template"
export interface CancelledRecipeTemplate {
   root: HTMLDivElement
   "add-recipe": HTMLButtonElement
   date: Text
}

var cancelledRecipeTemplate = html`
<template id="_cancelled-recipe-template">
   <div #root>
      <p><small>#date</small></p>
      <button #add-recipe>Add Recipe</button>
      <h2>No Recipe Chosen</h2>
   </div>
</template>
`

var afterMain = html`
${recipeTemplate}
${cancelledRecipeTemplate}
<script src="/plan-meals/index.js" async type="module"></script>`

const page = _default({
   head: "",
   header: "Meal Planner",
   currentPage: "Plan Meals",
   main,
   afterMain,
})

console.log(page)
