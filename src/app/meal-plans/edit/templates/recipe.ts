import template from "../../../utils/template.js"
import { RecipeTemplate, MealPlanTemplateId } from "./_recipe.html.js"
import { RecipeId, RecipeAndDateDomain } from "../Domain/DomainTypes.js"
import { ISODate } from "../../../utils/database.js"

var recipeView = template.get<MealPlanTemplateId>("_recipe-template")

export var
   recipeCancelMeal = new WeakMap<HTMLButtonElement, Recipe>(),
   recipeNextMeal = new WeakMap<HTMLButtonElement, Recipe>(),
   recipePreviousMeal = new WeakMap<HTMLButtonElement, Recipe>()

export class Recipe {
   nodes: RecipeTemplate
   id!: RecipeId
   date!: ISODate
   recipeIndex = 0
   recipes: RecipeAndDateDomain[] = []
   stopUpdate = false
   constructor(nodes: RecipeTemplate, o: RecipeAndDateDomain) {
      this.nodes = nodes
      this.recipes.push(o)
      this._update(o)
      nodes["search-meal"].href = `/app/meal-plans/edit/search/?recipeDate=${this.date.toString()}`
      nodes.root.setAttribute("id", this.date.toString())
   }

   _update(o: RecipeAndDateDomain) {
      this.id = o.id
      this.date = o.date
      this.nodes.name.nodeValue = o.name

      this.nodes["recipe-url"].href = ""
      this.nodes["recipe-url"].textContent = ""
      if (typeof o.location === "string") {
         this.nodes["recipe-location"].nodeValue = o.location || "Unknown"
      } else if ("book" in o.location) {
         this.nodes["recipe-location"].nodeValue = `${o.location.book} (${o.location.page})`
      } else {
         this.nodes["recipe-location"].nodeValue = ""
         this.nodes["recipe-url"].href = o.location.url
         this.nodes["recipe-url"].textContent = o.location.title
      }

      this.nodes["recipe-date"].nodeValue = o.date.getDate().toLocaleDateString()
      this.nodes.description.nodeValue = ""
   }

   previous() {
      if (this.stopUpdate || this.recipeIndex === 0) {
         return
      }
      this.recipeIndex--
      const recipe = this.recipes[this.recipeIndex]
      this._update(recipe)
      return recipe
   }

   peek(): RecipeAndDateDomain | undefined {
      return this.recipes[this.recipeIndex + 1]
   }

   next(recipe: RecipeAndDateDomain) {
      this.recipeIndex++
      if (this.recipeIndex === this.recipes.length) {
         this.recipes.push(recipe)
      }
      this._update(recipe)
   }
}

export function CreateRecipe(options : RecipeAndDateDomain) {
   var root = recipeView.cloneNode(true)
   var nodes = <RecipeTemplate>recipeView.collect(root)

   var recipe = new Recipe(nodes, options)

   recipeCancelMeal.set(nodes["cancel-meal"], recipe)
   recipeNextMeal.set(nodes["next-meal"], recipe)
   recipePreviousMeal.set(nodes["previous-meal"], recipe)

   return recipe
}
