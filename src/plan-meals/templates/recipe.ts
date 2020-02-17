import template from "../../utils/template.js"
import { RecipeTemplate, MealPlanTemplateId } from "./recipe.html.js"

interface RecipeOptions {
   name : string
   location : string | HTMLAnchorElement
   id : number
   description?: string
   date: Date
}

interface RecipeId {
   kind : "RecipeId"
   value : number
}

export interface Recipe {
   nodes : RecipeTemplate
   id : RecipeId
   date : Date
}

var recipeView = template.get<MealPlanTemplateId>("_recipe-template")

export var
   recipeCancelMeal = new WeakMap<HTMLButtonElement, Recipe>(),
   recipeChangeMeal = new WeakMap<HTMLButtonElement, Recipe>()

export function CreateRecipe({name, location, id, description = "", date} : RecipeOptions) {
   var root = recipeView.cloneNode(true)
   var nodes = <RecipeTemplate>recipeView.collect(root)

   nodes.name.nodeValue = name
   if (location instanceof HTMLAnchorElement) {
      nodes["recipe-location"].append(location)
   } else {
      nodes["recipe-location"].textContent = location || "Unknown"
   }
   nodes["recipe-date"].nodeValue = date.toLocaleDateString()
   nodes.description.nodeValue = description

   var recipe : Recipe = {
      nodes,
      id: { kind: "RecipeId", value: id },
      date
   }

   recipeCancelMeal.set(nodes["cancel-meal"], recipe)
   recipeChangeMeal.set(nodes["change-meal"], recipe)

   return recipe
}
