import { Page } from "./index.html"
import { recipeCancelMeal, recipeNextMeal, recipePreviousMeal, CreateRecipe, Recipe } from "./templates/recipe.js"
import { addRecipe, CancelledRecipe, CreateCancelledRecipe } from "./templates/cancelled-recipe.js"
import { random, range } from "./util/util.js"
import { getRecipes, setRecipeDate, getRecipeDates, getActiveRecipes, setMealPlannerSettings, getMealPlannerSettings } from "./store/store.js"
import { TypeOrDeleted, isDeleted } from "../utils/database.js"
import { run, ISODate, debounce } from "../utils/utils.js"
import { RecipeDomain, RecipeDateDomain, RecipeAndDateDomain } from "./Domain/DomainTypes"

var page : Page = {
   mealSelectionsId: "_meal-selections",
   startDateFormId: "_start-date"
}

var actions = {
   recipeCancelMeal,
   recipeNextMeal,
   recipePreviousMeal,
   addRecipe,
}

var mealSelections = document.getElementById(page.mealSelectionsId)
var startDate = <HTMLInputElement>document.getElementById(page.startDateFormId)

type RecipeAndRecipeDate = { recipe: TypeOrDeleted<RecipeDomain>, date: RecipeDateDomain }
async function handleDateChange(e: Event) {
   if (e.target instanceof HTMLInputElement) {
      var start = new ISODate(e.target.value)
      await setMealPlannerSettings({startDate: start})
      var recipeDates = await getRecipeDates(start, 1)
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
   }, 200))

mealSelections && mealSelections.addEventListener("click", debounce(function(e: Event) {
   e.preventDefault()
   var $button = e.target
   if ($button instanceof HTMLButtonElement) {
      var changeRecipe: Recipe | undefined,
          cancelledRecipe: Recipe | undefined,
          toNewRecipe: CancelledRecipe | undefined,
          toPreviousRecipe: Recipe | undefined
      if (cancelledRecipe = actions.recipeCancelMeal.get($button)) {
         run(() => CancelRecipe(<Recipe>cancelledRecipe))
      } else if (toNewRecipe = actions.addRecipe.get($button)) {
         run(() => CancelledRecipeToNewRecipe(<CancelledRecipe>toNewRecipe))
      } else if (changeRecipe = actions.recipeNextMeal.get($button)) {
         run(() => NextRecipe(<Recipe>changeRecipe))
      } else if (toPreviousRecipe = actions.recipePreviousMeal.get($button)) {
         run(() => PreviousRecipe(<Recipe>toPreviousRecipe))
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
   newRecipe.nodes["next-meal"].focus()
}

function* NextRecipe(oldRecipe: Recipe) {
   const recipe = <RecipeAndDateDomain | undefined>(yield oldRecipe.next(() => getNewRecipe(oldRecipe)))
   if (recipe) {
      yield setNewRecipe(recipe)
   }
}

function* PreviousRecipe(oldRecipe: Recipe) {
   const recipe = oldRecipe.previous()
   if (recipe) {
      yield setNewRecipe(recipe)
   }
}

async function setNewRecipe(o: RecipeAndDateDomain) {
   var recipe: RecipeDateDomain =
      { date: o.date
      , categoryId: { isCategoryId: true, value: 1 }
      , lastUpdated: 0
      , quantity: 1
      , recipeId: o.id }
   await setRecipeDate([recipe])
}

async function getNewRecipe(oldRecipe: Recipe) {
   var recipes = <RecipeDomain[]>(await getActiveRecipes())
   var newRecipe = recipes[random(0, recipes.length - 1)]
   return { ...newRecipe , date: oldRecipe.date }
}

function getRecipe(date : ISODate, recipe : RecipeDomain) {
   return CreateRecipe({...recipe, date})
}

function init() {
   var e = new Event("change")
   startDate.dispatchEvent(e)
}

if (!startDate.value) {
   getMealPlannerSettings()
   .then(settings => {
      if (settings) {
         startDate.value = settings.startDate.toString()
         init()
      }
   })
} else {
   init()
}
