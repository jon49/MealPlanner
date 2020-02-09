import { MealPlanTemplateId, RecipeTemplate, Page, CancelledRecipeTemplateId, CancelledRecipeTemplate } from "./index.html"
import { getTemplate, random, range } from "../utils/utils.js"
import recipeInfo  from "./temp-meal-store.js"
import { Yes } from "./test.js"

Yes()

var page : Page = {
   mealSelectionsId: "_meal-selections",
   mealPlannerDetails: {
      startDateFormId: "_start-date"
   }
}

var actions = {
   recipeCancelMeal: new WeakMap<HTMLButtonElement, Recipe>(),
   recipeChangeMeal: new WeakMap<HTMLButtonElement, Recipe>(),
   addRecipe: new WeakMap<HTMLButtonElement, CancelledRecipe>()
}

var mealSelections = document.getElementById(page.mealSelectionsId)

mealSelections?.addEventListener("click", function(e : Event) {
   e.preventDefault()
   var $button = e.target
   if ($button instanceof HTMLButtonElement) {
      var action : CancelledRecipe | Recipe | undefined
      if (action = actions.recipeCancelMeal.get($button)) {
         var cancelledRecipe = createCancelledRecipe({ date: action.date })
         action.nodes.root.replaceWith(cancelledRecipe.nodes.root)
         cancelledRecipe.nodes["add-recipe"].focus()
      } else if (action = actions.recipeChangeMeal.get($button)) {
         var newRecipe = getRecipe(action.date)
         action.nodes.root.replaceWith(newRecipe.nodes.root)
         newRecipe.nodes["change-meal"].focus()
      } else if (action = actions.addRecipe.get($button)) {
         var newRecipe = getRecipe(action.date)
         action.nodes.root.replaceWith(newRecipe.nodes.root)
         newRecipe.nodes["change-meal"].focus()
      }
   }
})

interface CancelledRecipeOptions {
   date: Date
}

interface CancelledRecipe {
   nodes: CancelledRecipeTemplate
   date: Date
}

var createCancelledRecipe = (() => {
   var cancelledRecipeView = getTemplate<CancelledRecipeTemplateId>("_cancelled-recipe-template")

   function CancelledRecipe({ date } : CancelledRecipeOptions) : CancelledRecipe {
      var root = cancelledRecipeView.cloneNode(true)
      var nodes = <CancelledRecipeTemplate>cancelledRecipeView.collect(root)
      nodes.date.nodeValue = date.toLocaleDateString()
      var cancelRecipe = { nodes, date }
      actions.addRecipe.set(nodes["add-recipe"], cancelRecipe)

      return cancelRecipe
   }

   return CancelledRecipe
})()

interface RecipeOptions {
   name : string
   location : string
   id : number
   description?: string
   date: Date
}

interface RecipeId {
   kind : "RecipeId"
   value : number
}

interface Recipe {
   nodes : RecipeTemplate
   id : RecipeId
   date : Date
}

var createRecipe = (() => {

   var recipeView = getTemplate<MealPlanTemplateId>("_recipe-template")

   function Recipe({name, location, id, description = "", date} : RecipeOptions) {
      var root = recipeView.cloneNode(true)
      var nodes = <RecipeTemplate>recipeView.collect(root)

      nodes.name.nodeValue = name
      nodes["recipe-location"].nodeValue = location || "Unknown"
      nodes["recipe-date"].nodeValue = date.toLocaleDateString()
      nodes.description.nodeValue = description

      var recipe : Recipe = {
         nodes,
         id: { kind: "RecipeId", value: id },
         date
      }

      actions.recipeCancelMeal.set(nodes["cancel-meal"], recipe)
      actions.recipeChangeMeal.set(nodes["change-meal"], recipe)

      return recipe
   }

   return Recipe
})()

function getRecipe(date : Date) {
   var recipe = recipeInfo[random(0, recipeInfo.length - 7)]
   return createRecipe({
      name: recipe.recipe,
      location: recipe.location,
      description: "",
      id: recipeInfo.findIndex(y => recipe === y),
      date
   })
}

var init = () => {
   var startDate = new Date()
   var date = new Date(startDate.setDate(startDate.getDate() - 1))
   range(1, 7)
   .map(_ => getRecipe(new Date(date.setDate(date.getDate() + 1))))
   .forEach(x => {
      mealSelections?.appendChild(x.nodes.root)
   })
}

init()
