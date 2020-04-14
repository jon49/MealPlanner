import html from "../../../layouts/util.js"

export type MealPlanTemplateId = "_recipe-template"

export interface RecipeTemplate {
   "cancel-meal": HTMLButtonElement
   name: Text
   "recipe-location": Text
   "recipe-url": HTMLAnchorElement
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
