import template from "../../../utils/template.js"
import { RecipeTemplate, MealPlanTemplateId } from "./_recipe.html.js"
import { RecipeId, RecipeAndDateDomain } from "../Domain/DomainTypes.js"
import { Location, ISODate } from "../../../utils/database.js"
import { anchor } from "../util/util.js"

var recipeView = template.get<MealPlanTemplateId>("_recipe-template")

export var
   recipeCancelMeal = new WeakMap<HTMLButtonElement, Recipe>(),
   recipeNextMeal = new WeakMap<HTMLButtonElement, Recipe>(),
   recipePreviousMeal = new WeakMap<HTMLButtonElement, Recipe>()

function getLocationElement(location: Location) : string | HTMLAnchorElement {
   return (typeof location === "string")
         ? location
      : ("book" in location)
         ? `${location.book} (${location.page})`
      : anchor(location.url, location.title)
}

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
      nodes["search-meal"].href = `/app/meal-plans/edit/search?recipeDate=${this.date.toString()}`
   }

   _update(o: RecipeAndDateDomain) {
      this.id = o.id
      this.date = o.date
      this.nodes.name.nodeValue = o.name

      var location = getLocationElement(o.location)
      var locationNode = this.nodes["recipe-location"]
      locationNode.textContent = ""
      if (location instanceof HTMLAnchorElement) {
         locationNode.append(location)
      } else {
         locationNode.textContent = location || "Unknown"
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

   async next(f: () => Promise<RecipeAndDateDomain>) {
      if (this.stopUpdate) {
         return
      }

      this.recipeIndex++
      if (this.recipeIndex === this.recipes.length) {
         this.stopUpdate = true
         const newRecipe = await f()
         this.recipes.push(newRecipe)
         this.stopUpdate = false
      }

      const newRecipe = this.recipes[this.recipeIndex]
      this._update(newRecipe)
      return newRecipe
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
