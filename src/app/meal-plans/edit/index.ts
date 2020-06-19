import { Page } from "./index.html.js"
import { recipeCancelMeal, recipeNextMeal, recipePreviousMeal, Recipe } from "./templates/recipe.js"
import { addRecipe, CancelledRecipe, CreateCancelledRecipe } from "./templates/cancelled-recipe.js"
import { random, range } from "./util/util.js"
import { getRecipes, setRecipeDate, getRecipeDates, setMealPlannerSettings, getMealPlannerSettings } from "./store/store.js"
import { debounce, defer, handleError, ISODate } from "../../utils/utils.js"
import { RecipeDomain, RecipeDateDomain, RecipeAndDateDomain } from "./Domain/DomainTypes.js"
import start from "./temp-meal-store.js"
start()

var page : Page = {
   mealSelectionsId: "_meal-selections",
   startDateFormId: "start-date"
}

var actions = {
   recipeCancelMeal,
   recipeNextMeal,
   recipePreviousMeal,
   addRecipe,
}

var mealSelections = <HTMLDivElement>document.getElementById(page.mealSelectionsId)
var startDate = <HTMLInputElement>document.getElementById(page.startDateFormId)

function parseRecipes(recipes: RecipeDomain[], recipeDates: RecipeDateDomain[]) {
   var currentIds = recipeDates.map(x => x.recipeId.value)
   var currentRecipes : RecipeAndRecipeDate[] = []
   var unUsedRecipes : RecipeDomain[] = []
   var shouldAddNewRecipes = currentIds.length !== 7
   for (var recipe of recipes) {
      var idx = currentIds.indexOf(recipe.id.value)
      if (idx > -1) {
         currentRecipes.push({ recipe, date: recipeDates[idx] })
      } else if(shouldAddNewRecipes) {
         unUsedRecipes.push(recipe)
      }
   }
   return { currentRecipes, unUsedRecipes }
}

interface GetCurrentRecipesOptions {
   currentRecipes: RecipeAndRecipeDate[]
   unUsedRecipes: RecipeDomain[] 
   start: ISODate
}
function getCurrentRecipes({ currentRecipes, unUsedRecipes, start }: GetCurrentRecipesOptions) {
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
                  mealTimeId: { _id: "meal-time", value: 1 },
                  date: currentDate,
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

   return { currentRecipesAddedDates }
}

// * Make the Monad more robust, add an applicative for validation and use in database calls
// * Create a central recipe picker which takes into account 0 recipes, < 7 recipes, above 7 recipes
//   Also, takes into account current recipes chosen and current recipes chosen for specific widget
// * Drag and drop recipes

type RecipeAndRecipeDate = { recipe: RecipeDomain, date: RecipeDateDomain }
async function handleDateChange(target: HTMLInputElement) {
   // Still need to deal with the amount of recipes under 7 and 0 recipes
   // Yield here as we don't know the target is the correct value
   // Perhaps a ISODate.Create which returns => ISODate | ErrorWithUserMessage
   var start = new ISODate(target.value)
   await setMealPlannerSettings({ startDate: start })
   const [recipeDates, recipes] = await Promise.all([getRecipeDates(start, 1), getRecipes()])
   const parsed = parseRecipes(recipes, recipeDates)
   const current = getCurrentRecipes({ ...parsed, start })
   await setRecipeDate(current.currentRecipesAddedDates.map(x => ({
      recipeId: x.date.recipeId,
      date: x.date.date,
      mealTimeId: x.date.mealTimeId,
      quantity: x.date.quantity,
   })))
   const fragment = document.createDocumentFragment()
   current.currentRecipesAddedDates.forEach(x => {
      var recipeNode = new Recipe({ date: x.date.date, ...x.recipe })
      fragment.appendChild(recipeNode.root)
   })
   const $addNewMeal = document.getElementById("add-new-meal")
   if ($addNewMeal) fragment.appendChild($addNewMeal.cloneNode(true))
   mealSelections.innerHTML = ""
   mealSelections.appendChild(fragment)
}

var firstPageView = true
startDate.addEventListener("change", debounce(function(e: Event) {
      e.preventDefault()
      if (e.target instanceof HTMLInputElement) {
         handleDateChange(e.target)
         .then(() => {
            if (firstPageView && location.hash) {
               location.href = location.hash
            }
            firstPageView = false
         })
         .catch(handleError)
      }
   }, 250, { runImmediatelyFirstTimeOnly: true }))

const cancelRecipe = (oldRecipe: Recipe) =>
   Promise.all([
      CreateCancelledRecipe({ date: oldRecipe.date }),
      setRecipeDate([
         { date: oldRecipe.date
         , recipeId: oldRecipe.id
         , mealTimeId: { value: 1, _id: "meal-time" as const }
         , quantity: 1 }])
      ]) 
   .then(([cancelledRecipe]) => {
      oldRecipe.root.replaceWith(cancelledRecipe.cancel.root)
      cancelledRecipe.actions.addRecipe.focus()
   })

const cancelledRecipeToNewRecipe = (cancelledRecipe: CancelledRecipe) =>
   getRecipes()
   .then(recipes => {
      const newRecipe = new Recipe({date: cancelledRecipe.date, ...recipes[random(0, recipes.length - 1)]})
      cancelledRecipe.cancel.root.replaceWith(newRecipe.root)
      newRecipe.actions.nextMeal.focus()
   })

const nextRecipe = async (oldRecipe: Recipe) => {
   const maybeNextRecipe = oldRecipe.peek()
   const nextRecipe =
      !maybeNextRecipe
         ? await getNewRecipe(oldRecipe)
      : maybeNextRecipe
   oldRecipe.next(nextRecipe)
   await setNewRecipe(nextRecipe)
}

const previousRecipe = async (oldRecipe: Recipe) => {
   const previous = oldRecipe.previous()
   previous && await setNewRecipe(previous)
}

mealSelections.addEventListener("click", defer(function(e: Event) {
   var $button = e.target
   if ($button instanceof HTMLButtonElement) {
      var changeRecipe: Recipe | undefined,
          cancelledRecipe: Recipe | undefined,
          toNewRecipe: CancelledRecipe | undefined,
          toPreviousRecipe: Recipe | undefined
      let result : Promise<any> =
         (cancelledRecipe = actions.recipeCancelMeal.get($button))
            ? cancelRecipe(<Recipe>cancelledRecipe)
         : (toNewRecipe = actions.addRecipe.get($button))
            ? cancelledRecipeToNewRecipe(<CancelledRecipe>toNewRecipe)
         : (changeRecipe = actions.recipeNextMeal.get($button))
            ? nextRecipe(<Recipe>changeRecipe)
         : (toPreviousRecipe = actions.recipePreviousMeal.get($button))
            ? previousRecipe(<Recipe>toPreviousRecipe)
         : Promise.resolve()
      return result.catch(handleError)
   } else {
      return Promise.resolve()
   }
}))

const setNewRecipe = (o: RecipeAndDateDomain) =>
   setRecipeDate([{ date: o.date
      , mealTimeId: { _id: "meal-time", value: 1 }
      , quantity: 1
      , recipeId: o.id }])

const getNewRecipe = async (oldRecipe: Recipe) => {
   const recipes = await getRecipes()
   const picked = recipes[random(0, recipes.length - 1)]
   return { ...picked, date: oldRecipe.date }
}

function init() {
   var e = new Event("change")
   startDate.dispatchEvent(e)
}

if (!startDate.value) {
   getMealPlannerSettings()
   .then(
      settings => {
         if (settings) {
            startDate.value = settings.startDate.toString()
            init()
         }
      })
   .catch(handleError)
} else {
   init()
}
