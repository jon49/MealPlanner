import { Page } from "./index.html"
import { recipeCancelMeal, recipeNextMeal, recipePreviousMeal, CreateRecipe, Recipe } from "./templates/recipe.js"
import { addRecipe, CancelledRecipe, CreateCancelledRecipe } from "./templates/cancelled-recipe.js"
import { random, range } from "./util/util.js"
import { getRecipes, setRecipeDate, getRecipeDates, getActiveRecipes, setMealPlannerSettings, getMealPlannerSettings } from "./store/store.js"
import { TypeOrDeleted, isDeleted, ISODate } from "../../utils/database.js"
import { run, debounce, defer } from "../../utils/utils.js"
import { RecipeDomain, RecipeDateDomain, RecipeAndDateDomain } from "./Domain/DomainTypes.js"
import start from "./temp-meal-store.js"
start()

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

var mealSelections = <HTMLDivElement>document.getElementById(page.mealSelectionsId)
var startDate = <HTMLInputElement>document.getElementById(page.startDateFormId)

function parseRecipes(recipes: TypeOrDeleted<RecipeDomain>[], recipeDates: TypeOrDeleted<RecipeDateDomain>[]) {
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

   return { currentRecipesAddedDates }
}

// * Make the Monad more robust, add an applicative for validation and use in database calls
// * Create a central recipe picker which takes into account 0 recipes, < 7 recipes, above 7 recipes
//   Also, takes into account current recipes chosen and current recipes chosen for specific widget
// * Drag and drop recipes

type RecipeAndRecipeDate = { recipe: TypeOrDeleted<RecipeDomain>, date: RecipeDateDomain }
function* handleDateChange(e: Event) {
   if (e.target instanceof HTMLInputElement) {
      // Still need to deal with the amount of recipes under 7 and 0 recipes
      // Yield here as we don't know the target is the correct value
      // Perhaps a ISODate.Create which returns => ISODate | ErrorWithUserMessage
      var start = new ISODate(e.target.value)
      yield setMealPlannerSettings({startDate: start})
      var recipeDates = yield getRecipeDates(start, 1)
      var recipes = yield getRecipes()
      const { currentRecipes, unUsedRecipes } = parseRecipes(recipes, recipeDates)
      // extract random from getCurrentRecipes, perhaps a different implementation?
      const { currentRecipesAddedDates } = getCurrentRecipes({ currentRecipes, unUsedRecipes, start })
      yield setRecipeDate(currentRecipesAddedDates.map(x => ({
         recipeId: x.date.recipeId,
         date: x.date.date,
         categoryId: x.date.categoryId,
         quantity: x.date.quantity,
         lastUpdated: x.date.lastUpdated
      })))

      mealSelections.innerHTML = ""
      currentRecipesAddedDates.forEach(x => {
         var recipeNode = getRecipe(x.date.date, x.recipe)
         mealSelections.appendChild(recipeNode.nodes.root)
      })
   }
}

var firstPageView = true
startDate.addEventListener("change", debounce(function(e: Event) {
      e.preventDefault()
      run(() => handleDateChange(e))
      .then(() => {
         if (firstPageView && location.hash) {
            location.href = location.hash
         }
         firstPageView = false
      })
   }, 250, { runImmediatelyFirstTimeOnly: true }))

mealSelections.addEventListener("click", defer(function(e: Event) {
   var $button = e.target
   if ($button instanceof HTMLButtonElement) {
      e.preventDefault()
      var changeRecipe: Recipe | undefined,
          cancelledRecipe: Recipe | undefined,
          toNewRecipe: CancelledRecipe | undefined,
          toPreviousRecipe: Recipe | undefined
      return (cancelledRecipe = actions.recipeCancelMeal.get($button))
         ? run(() => CancelRecipe(<Recipe>cancelledRecipe))
      : (toNewRecipe = actions.addRecipe.get($button))
         ? run(() => CancelledRecipeToNewRecipe(<CancelledRecipe>toNewRecipe))
      : (changeRecipe = actions.recipeNextMeal.get($button))
         ? run(() => NextRecipe(<Recipe>changeRecipe))
      : (toPreviousRecipe = actions.recipePreviousMeal.get($button))
         ? run(() => PreviousRecipe(<Recipe>toPreviousRecipe))
      : Promise.resolve()
   } else {
      return Promise.resolve()
   }
}))

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
   var date = cancelledRecipe.date
   // var currentRecipe = <TypeOrDeleted<RecipeDateDomain>>(yield getRecipeDates(date, 1))
   var recipes = <RecipeDomain[]>(yield getActiveRecipes())
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
