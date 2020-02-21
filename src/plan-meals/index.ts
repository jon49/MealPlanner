import { Page } from "./index.html"
import { recipeCancelMeal, recipeChangeMeal, CreateRecipe, Recipe } from "./templates/recipe.js"
import { addRecipe, CancelledRecipe, CreateCancelledRecipe } from "./templates/cancelled-recipe.js"
import { random, range } from "./util/util.js"
import { getRecipes, setRecipeDate, getRecipeDates, getActiveRecipes } from "./store/store.js"
import getDB, { TypeOrDeleted, isDeleted } from "../utils/database.js"
import { run, ISODate, debounce } from "../utils/utils.js"
import { RecipeDomain, RecipeDateDomain } from "./Domain/DomainTypes"

var page : Page = {
   mealSelectionsId: "_meal-selections",
   startDateFormId: "_start-date"
}

var actions = {
   recipeCancelMeal,
   recipeChangeMeal,
   addRecipe
}

var mealSelections = document.getElementById(page.mealSelectionsId)
var startDate = <HTMLInputElement>document.getElementById(page.startDateFormId)

type RecipeAndRecipeDate = { recipe: TypeOrDeleted<RecipeDomain>, date: RecipeDateDomain }
async function handleDateChange(e: Event) {
   if (e.target instanceof HTMLInputElement) {
      var date = e.target.value
      var start = new ISODate(date)
      var recipeDates = await getRecipeDates(new ISODate(date), 1)
      var recipes = await getRecipes()
      var currentIds = recipeDates.map(x => x.recipeId.value)
      var currentRecipes : RecipeAndRecipeDate[] = []
      var unUsedRecipes : RecipeDomain[] = []
      var shouldAddNewRecipes = currentIds.length !== 7
      for (var recipe of recipes) {
         var idx = currentIds.indexOf(recipe.id.value)
         if (idx > -1) {
            currentRecipes.push({ recipe, date: recipeDates[idx] })
         } else if(shouldAddNewRecipes && !isDeleted(recipe)) {
            unUsedRecipes.push(recipe)
         }
      }
      var currentRecipesAddedDates : RecipeAndRecipeDate[] = []
      if (currentRecipes.length !== 7) {
         var currentDate = start
         range(0, 7)
         .forEach(_ => {
            var r = currentRecipes.find(x => currentDate.equals(x.date.date))
            if (r) {
               currentRecipesAddedDates.push(r)
            } else {
               var newRecipe = unUsedRecipes[random(0, unUsedRecipes.length - 1)]
               currentRecipesAddedDates.push({
                  recipe: newRecipe,
                  date: {
                     categoryId: { isCategoryId: true, value: 1 },
                     date: currentDate,
                     lastUpdated: 0,
                     quantity: 1,
                     recipeId: newRecipe.id
                  }
               })
            }
            currentDate = currentDate.addDays(1)
         })
      } else {
         currentRecipes.sort((a, b) => a.date.date < b.date.date ? -1 : 1)
         currentRecipesAddedDates = currentRecipes
      }
      await setRecipeDate(currentRecipesAddedDates.map(x => ({
         recipeId: x.date.recipeId,
         date: x.date.date,
         categoryId: x.date.categoryId,
         quantity: x.date.quantity,
         lastUpdated: x.date.lastUpdated
      })))

      mealSelections && (mealSelections.innerHTML = "")
      currentRecipesAddedDates.forEach(x => {
         var recipeNode = getRecipe(x.date.date, x.recipe)
         mealSelections && mealSelections.appendChild(recipeNode.nodes.root)
      })
   }
}

startDate.addEventListener("change", debounce(function(e: Event) {
      e.preventDefault()
      handleDateChange(e)
   }, 300))

mealSelections && mealSelections.addEventListener("click", debounce(function(e: Event) {
   e.preventDefault()
   var $button = e.target
   if ($button instanceof HTMLButtonElement) {
      var changeRecipe: Recipe | undefined,
          cancelledRecipe: Recipe | undefined,
          toNewRecipe: CancelledRecipe | undefined
      if (cancelledRecipe = actions.recipeCancelMeal.get($button)) {
         run(() => CancelRecipe(<Recipe>cancelledRecipe))
      } else if (toNewRecipe = actions.addRecipe.get($button)) {
         run(() => CancelledRecipeToNewRecipe(<CancelledRecipe>toNewRecipe))
      } else if (changeRecipe = actions.recipeChangeMeal.get($button)) {
         run(() => ChangeRecipe(<Recipe>changeRecipe))
      }
   }
}, 100))

function* CancelRecipe(oldRecipe: Recipe) {
   var cancelledRecipe = CreateCancelledRecipe({ date: oldRecipe.date })
   yield setRecipeDate([
      { date: oldRecipe.date
      , recipeId: oldRecipe.id
      , categoryId: { isCategoryId: true, value: 1 }
      , lastUpdated: 0
      , quantity: 1
      , isDeleted: true }])
   oldRecipe.nodes.root.replaceWith(cancelledRecipe.nodes.root)
   cancelledRecipe.nodes["add-recipe"].focus()
}

function* CancelledRecipeToNewRecipe(cancelledRecipe: CancelledRecipe) {
   var recipes = <RecipeDomain[]>(yield getActiveRecipes())
   var date = cancelledRecipe.date
   let newRecipe = getRecipe(date, recipes[random(0, recipes.length - 1)])
   cancelledRecipe.nodes.root.replaceWith(newRecipe.nodes.root)
   newRecipe.nodes["change-meal"].focus()
}

function* ChangeRecipe(oldRecipe: Recipe) {
   var recipes = <RecipeDomain[]>(yield getActiveRecipes())
   var newRecipe = recipes[random(0, recipes.length - 1)]
   yield setRecipeDate([
      { date: oldRecipe.date
      , recipeId: newRecipe.id
      , categoryId: { isCategoryId: true, value: 1 }
      , lastUpdated: 0
      , quantity: 1 }])

   recipes = []
   oldRecipe.update({ ...newRecipe , date: oldRecipe.date })
}

function getRecipe(date : ISODate, recipe : RecipeDomain) {
   return CreateRecipe({...recipe, date})
}

function init() {
   var e = new Event("change")
   startDate.dispatchEvent(e)
}

if (!startDate.value) {
   getDB()
   .then(db => {
      db.get("settings", 1)
      .then(settings => {
         if (settings) {
            startDate.value = settings.mealPlanner.startDate
         }
      })
   })
   .then(init)
} else {
   init()
}
