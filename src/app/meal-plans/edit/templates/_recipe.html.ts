import html from "../../../layouts/util.js"

export type MealPlanTemplateId = "_recipe-template"

export interface RecipeTemplate {
   "cancel-meal": HTMLButtonElement
   name: Text
   "recipe-location": HTMLElement
   "recipe-date": Text
   description: Text
   "next-meal": HTMLButtonElement
   "previous-meal": HTMLButtonElement
   "search-meal": HTMLAnchorElement
   root: HTMLDivElement
}

export const recipeTemplate = html`
<template id="_recipe-template">
   <div #root>
      <div><small>#recipe-date</small></div>
      <h2>#name</h2>
      <p><small #recipe-location></small></p>
      <p>#description</p>
      <div>
         <button #cancel-meal>Cancel</button>
         <a #search-meal>Search</a>
         <button #previous-meal><<</button>
         <button #next-meal>Next >></button>
      </div>
   </div>
</template>`
