import { Page } from "./index.html"
import { Recipe, recipeCancelMeal, recipeChangeMeal, CreateRecipe } from "./templates/recipe.js"
import { addRecipe, CancelledRecipe, CreateCancelledRecipe } from "./templates/cancelled-recipe.js"
import { random, range } from "./util/util.js"
import recipeInfo  from "./temp-meal-store.js"

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

mealSelections?.addEventListener("click", function(e : Event) {
   e.preventDefault()
   var $button = e.target
   if ($button instanceof HTMLButtonElement) {
      var action : CancelledRecipe | Recipe | undefined
      if (action = actions.recipeCancelMeal.get($button)) {
         var cancelledRecipe = CreateCancelledRecipe({ date: action.date })
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

function getRecipe(date : Date) {
   var recipe = recipeInfo[random(0, recipeInfo.length - 7)]
   return CreateRecipe({
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
   range(0, 7)
   .map(_ => getRecipe(new Date(date.setDate(date.getDate() + 1))))
   .forEach(x => {
      mealSelections?.appendChild(x.nodes.root)
   })
}

init()
