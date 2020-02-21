import html from "../../layouts/util.js"

export type MealPlanTemplateId = "_recipe-template"

export interface RecipeTemplate {
   "cancel-meal": HTMLButtonElement
   name: Text
   "recipe-location": HTMLElement
   "recipe-date": Text
   description: Text
   "change-meal": HTMLButtonElement
   root: HTMLDivElement
}

export const recipeTemplate = html`
<template id="_recipe-template">
   <div #root>
      <div><small>#recipe-date</small></div>
      <div>
         <button #cancel-meal>Cancel Meal</button>
         <button #change-meal>Change Meal</button>
      </div>
      <h2>#name</h2>
      <p><small #recipe-location></small></p>
      <p>#description</p>
   </div>
</template>`
