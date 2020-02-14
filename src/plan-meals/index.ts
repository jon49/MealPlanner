import { Page } from "./index.html"
import { Recipe, recipeCancelMeal, recipeChangeMeal, CreateRecipe } from "./templates/recipe.js"
import { addRecipe, CancelledRecipe, CreateCancelledRecipe } from "./templates/cancelled-recipe.js"
import { random, range, anchor } from "./util/util.js"
import { getRecipes, setRecipeDate } from "./repository/get-recipes.js"
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

async function run<T, E extends Error, R>(
   f : () => Generator<Promise<T> | E, R, T>) {
   var iterator = f()
   var result = iterator.next()
   var value : T | E | undefined

   while(!result.done) {
      var newValue = result.value
      if (newValue instanceof Promise) {
         value = await newValue
         if (value instanceof Error) {
            break
         }
         result = iterator.next(value)
      } else {
         value = newValue
         break
      }
   }

   if (!value) {
      return result.value instanceof Promise
         ? result.value
      : result.value instanceof Error
         ? Promise.reject(result.value)
      : Promise.resolve(result.value)
   }

   return (value instanceof Error)
      ? Promise.reject(value)
   : Promise.resolve(value)
}

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
         run<RecipeData[] | void, Error, string>(function* () {
            var recipes = <RecipeData[]>(yield getRecipes())
            if ($button instanceof HTMLButtonElement
            && (action = actions.recipeChangeMeal.get($button)) || (action = actions.addRecipe.get(<HTMLButtonElement>$button))) {

               var newRecipe = getRecipe(action.date, recipes[random(0, recipes.length - 1)])
               var date = action.date
               var recipeId = newRecipe.id.value
               action.nodes.root.replaceWith(newRecipe.nodes.root)
               newRecipe.nodes["change-meal"].focus()
               yield setRecipeDate([{ date, recipeId }])

            }
            return "Yellow!"
         })
         .finally(() => { handlingMealSelectionAction = false })
      }
   }
})

function getRecipe(date : Date, recipe : RecipeData) {
   var location: string | HTMLAnchorElement;
   if (typeof recipe.location === "string") {
      location = recipe.location
   } else if ("book" in recipe.location) {
      location = `${recipe.location.book} (${recipe.location.page})`
   } else {
      location = anchor(recipe.location.url, recipe.location.title)
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
   .then(async (xs) => {
      var startDate = new Date()
      var date = new Date(startDate.setDate(startDate.getDate() - 1))
      var recipes =
         range(0, 7)
         .map(_ => xs[random(0, xs.length - 1)])
         .map(recipe => getRecipe(new Date(date.setDate(date.getDate() + 1)), recipe))
      await setRecipeDate(recipes.map(x => ({ recipeId: x.id.value, date: x.date })))
      recipes.forEach(x => {
         mealSelections?.appendChild(x.nodes.root)
      })
   })
}

init()
