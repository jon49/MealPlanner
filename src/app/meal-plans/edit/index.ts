import { Page } from "./index.html"
import { recipeCancelMeal, recipeNextMeal, recipePreviousMeal, CreateRecipe, Recipe } from "./templates/recipe.js"
import { addRecipe, CancelledRecipe, CreateCancelledRecipe } from "./templates/cancelled-recipe.js"
import { random, range } from "./util/util.js"
import { getRecipes, setRecipeDate, getRecipeDates, setMealPlannerSettings, getMealPlannerSettings } from "./store/store.js"
import { ISODate } from "../../utils/database.js"
import { debounce, defer } from "../../utils/utils.js"
import { RecipeDomain, RecipeDateDomain, RecipeAndDateDomain } from "./Domain/DomainTypes.js"
import start from "./temp-meal-store.js"
import { Do, Either, taskEither, tryCatch, handleError, fold, tryCatchArgs, TE, TaskEither, right } from "../../utils/fp.js"
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
function handleDateChange(target: HTMLInputElement) {
   // Still need to deal with the amount of recipes under 7 and 0 recipes
   // Yield here as we don't know the target is the correct value
   // Perhaps a ISODate.Create which returns => ISODate | ErrorWithUserMessage
   var start = new ISODate(target.value)
   return Do(taskEither)
   .do(setMealPlannerSettings({startDate: start}))
   .bind("recipeDates", getRecipeDates(start, 1))
   .bind("recipes", getRecipes)
   .letL("parsed", ({recipes, recipeDates}) => parseRecipes(recipes, recipeDates))
   // extract random from getCurrentRecipes, perhaps a different implementation?
   .letL("current", ({parsed}) => getCurrentRecipes({ ...parsed, start }))
   .doL(({ current }) => setRecipeDate(current.currentRecipesAddedDates.map(x => ({
      recipeId: x.date.recipeId,
      date: x.date.date,
      mealTimeId: x.date.mealTimeId,
      quantity: x.date.quantity,
   }))))
   .doL(({ current }) =>
      tryCatch(() => {
         mealSelections.innerHTML = ""
         current.currentRecipesAddedDates.forEach(x => {
            var recipeNode = getRecipe(x.date.date, x.recipe)
            mealSelections.appendChild(recipeNode.nodes.root)
         })
         return Promise.resolve()
      }))
   .done()()
}

var firstPageView = true
startDate.addEventListener("change", debounce(function(e: Event) {
      e.preventDefault()
      if (e.target instanceof HTMLInputElement) {
         handleDateChange(e.target)
         .then(fold(handleError,
            () => {
            if (firstPageView && location.hash) {
               location.href = location.hash
            }
            firstPageView = false
         }))
      }
   }, 250, { runImmediatelyFirstTimeOnly: true }))

const cancelRecipe = (oldRecipe: Recipe) =>
   Do(taskEither)
   .bind("cancelledRecipe", tryCatchArgs(CreateCancelledRecipe)({ date: oldRecipe.date }))
   .do(setRecipeDate([
      { date: oldRecipe.date
      , recipeId: oldRecipe.id
      , mealTimeId: { value: 1, _id: "meal-time" as const }
      , quantity: 1 }]))
   .doL(({cancelledRecipe}) => tryCatch(() => {
      oldRecipe.nodes.root.replaceWith(cancelledRecipe.nodes.root)
      cancelledRecipe.nodes["add-recipe"].focus()
      return Promise.resolve()
   }))
   .done()

const cancelledRecipeToNewRecipe = (cancelledRecipe: CancelledRecipe) =>
   Do(taskEither)
   .bind("recipes", getRecipes)
   .doL(
      tryCatchArgs(({recipes}) => {
         const newRecipe = getRecipe(cancelledRecipe.date, recipes[random(0, recipes.length - 1)])
         cancelledRecipe.nodes.root.replaceWith(newRecipe.nodes.root)
         newRecipe.nodes["next-meal"].focus()
         return Promise.resolve()
      }))
   .done()

const nextRecipe = (oldRecipe: Recipe): TaskEither<string, any> => {
   const maybeNextRecipe = oldRecipe.peek()
   return Do(taskEither)
   .bind("nextRecipe",
      !maybeNextRecipe
         ? getNewRecipe(oldRecipe)
      : TE.right<string, RecipeAndDateDomain>(maybeNextRecipe))
   .doL(tryCatchArgs(({nextRecipe}) => {
      oldRecipe.next(nextRecipe)
      return Promise.resolve()
   }))
   .doL(({nextRecipe}) => setNewRecipe(nextRecipe))
   .done()
}

const previousRecipe = (oldRecipe: Recipe) =>
   Do(taskEither)
   .bind("recipe", tryCatch(() => {
      const old = oldRecipe.previous()
      return Promise.resolve(old)
   }))
   .doL(({recipe}) => {
      if (recipe) {
         return setNewRecipe(recipe)
      }
      return TE.right(void 0)
   })
   .done()

mealSelections.addEventListener("click", defer(function(e: Event) {
   var $button = e.target
   if ($button instanceof HTMLButtonElement) {
      e.preventDefault()
      var changeRecipe: Recipe | undefined,
          cancelledRecipe: Recipe | undefined,
          toNewRecipe: CancelledRecipe | undefined,
          toPreviousRecipe: Recipe | undefined
      let result : Promise<Either<string, any>> =
         (cancelledRecipe = actions.recipeCancelMeal.get($button))
            ? cancelRecipe(<Recipe>cancelledRecipe)()
         : (toNewRecipe = actions.addRecipe.get($button))
            ? cancelledRecipeToNewRecipe(<CancelledRecipe>toNewRecipe)()
         : (changeRecipe = actions.recipeNextMeal.get($button))
            ? nextRecipe(<Recipe>changeRecipe)()
         : (toPreviousRecipe = actions.recipePreviousMeal.get($button))
            ? previousRecipe(<Recipe>toPreviousRecipe)()
         : Promise.resolve(right(void 0))
      return result.then(fold(handleError, _ => {}))
   } else {
      return Promise.resolve()
   }
}))

const setNewRecipe = (o: RecipeAndDateDomain) =>
   setRecipeDate([{ date: o.date
      , mealTimeId: { _id: "meal-time", value: 1 }
      , quantity: 1
      , recipeId: o.id }])

const getNewRecipe = (oldRecipe: Recipe): TaskEither<string, RecipeAndDateDomain> =>
      Do(taskEither)
      .bind("xs", getRecipes)
      .bindL("picked", ({xs}) => tryCatch(() => Promise.resolve(xs[random(0, xs.length - 1)])))
      .letL("newRecipe", ({picked}) => ({ ...picked , date: oldRecipe.date }))
      .return(({newRecipe}) => newRecipe)

function getRecipe(date : ISODate, recipe : RecipeDomain) {
   return CreateRecipe({...recipe, date})
}

function init() {
   var e = new Event("change")
   startDate.dispatchEvent(e)
}

if (!startDate.value) {
   getMealPlannerSettings()
   .then(fold(
      handleError,
      settings => {
         if (settings) {
            startDate.value = settings.startDate.toString()
            init()
         }
      }))
} else {
   init()
}
