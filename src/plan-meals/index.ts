import { Page } from "./index.html"
import { Recipe, recipeCancelMeal, recipeChangeMeal, CreateRecipe } from "./templates/recipe.js"
import { addRecipe, CancelledRecipe, CreateCancelledRecipe } from "./templates/cancelled-recipe.js"
import { random, range } from "./util/util.js"
import { getRecipes } from "./repository/get-recipes.js"
import { RecipeData } from "../utils/database"

var page : Page = {
   mealSelectionsId: "_meal-selections",
   mealPlannerDetails: {
      startDateFormId: "_start-date"
   }
}

var actions = {
   recipeCancelMeal,
   recipeChangeMeal,
   addRecipe
}

var mealSelections = document.getElementById(page.mealSelectionsId)

var handlingMealSelectionAction = false
mealSelections?.addEventListener("click", function(e : Event) {
   e.preventDefault()
   var $button = e.target
   if ($button instanceof HTMLButtonElement && !handlingMealSelectionAction) {
      handlingMealSelectionAction = true
      var action : CancelledRecipe | Recipe | undefined
      if (action = actions.recipeCancelMeal.get($button)) {
         var cancelledRecipe = CreateCancelledRecipe({ date: action.date })
         action.nodes.root.replaceWith(cancelledRecipe.nodes.root)
         cancelledRecipe.nodes["add-recipe"].focus()
         handlingMealSelectionAction = false
      } else {
         getRecipes()
         .then(recipes => {
            if ($button instanceof HTMLButtonElement) {
               if (action = actions.recipeChangeMeal.get($button)) {
                  var newRecipe = getRecipe(action.date, recipes[random(0, recipes.length - 1)])
                  action.nodes.root.replaceWith(newRecipe.nodes.root)
                  newRecipe.nodes["change-meal"].focus()
               } else if (action = actions.addRecipe.get($button)) {
                  var newRecipe = getRecipe(action.date, recipes[random(0, recipes.length - 1)])
                  action.nodes.root.replaceWith(newRecipe.nodes.root)
                  newRecipe.nodes["change-meal"].focus()
               }
               handlingMealSelectionAction = false
            }
         })
      }
   }
})

function getRecipe(date : Date, recipe : RecipeData) {
   var location: string;
   if (typeof recipe.location === "string") {
      location = recipe.location
   } else if ("book" in recipe.location) {
      location = `${recipe.location.book} (${recipe.location.page})`
   } else {
      var url = recipe.location.url
      if (!url.startsWith("http") && url[0] !== "/") {
         url = `//${url}`
      }
      location = `<a href="${url}">${recipe.location.title}</a>`
   }

   return CreateRecipe({
      name: recipe.name,
      location,
      description: "",
      id: recipe.id,
      date
   })
}

var init = () => {
   getRecipes()
   .then(xs => {
      var startDate = new Date()
      var date = new Date(startDate.setDate(startDate.getDate() - 1))
      range(0, 7)
      .map(_ => xs[random(0, xs.length - 1)])
      .map(recipe => getRecipe(new Date(date.setDate(date.getDate() + 1)), recipe))
      .forEach(x => {
         mealSelections?.appendChild(x.nodes.root)
      })
   })
}

init()
