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
   <aside #root>
      <header>
         <p>#recipe-date</p>
         <h2 class="text-2xl">#name</h2>
      </header>
      <p><small #recipe-location></small></p>
      <p>#description</p>
      <div>
         <button #cancel-meal>Cancel</button>&nbsp;
         <a #search-meal>Search</a>&nbsp;
         <button #previous-meal>&laquo;</button>&nbsp;
         <button #next-meal>Next &raquo;</button>
      </div>
   </aside>
</template>`
