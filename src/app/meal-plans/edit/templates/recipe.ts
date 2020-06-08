import template from "../../../utils/hash-template.js"
import { Template } from "../../../utils/hash-template"
import { RecipeTemplate, RecipeTemplateActions } from "./_recipe.html.js"
import { RecipeId, RecipeAndDateDomain } from "../Domain/DomainTypes.js"
import { ISODate } from "../../../utils/database.js"

var recipeGenerator = template<RecipeTemplate, RecipeTemplateActions>(<HTMLTemplateElement>document.getElementById("_recipe-template"))

export var
   recipeCancelMeal = new WeakMap<HTMLButtonElement, Recipe>(),
   recipeNextMeal = new WeakMap<HTMLButtonElement, Recipe>(),
   recipePreviousMeal = new WeakMap<HTMLButtonElement, Recipe>()

export class Recipe {
   id!: RecipeId
   date!: ISODate
   recipeIndex = 0
   recipes: RecipeAndDateDomain[] = []
   stopUpdate = false
   _recipe: Template<RecipeTemplate, RecipeTemplateActions>
   root: HTMLElement
   actions: { cancelMeal: HTMLButtonElement; nextMeal: HTMLButtonElement; previousMeal: HTMLButtonElement }
   constructor(o: RecipeAndDateDomain) {
      const recipe = recipeGenerator()
      this._recipe = recipe
      const buttons = recipe.getNodes([ "cancelMeal", "nextMeal", "previousMeal" ])
      recipeCancelMeal.set(buttons.cancelMeal, this)
      recipeNextMeal.set(buttons.nextMeal, this)
      recipePreviousMeal.set(buttons.previousMeal, this)
      this.actions = buttons
      this.root = recipe.root
      this.recipes.push(o)
      this._update(o)
      recipe.update({
         searchMeal: `/app/meal-plans/edit/search/?recipeDate=${this.date.toString()}`,
         date: this.date.toString()
      })
   }

   _update(o: RecipeAndDateDomain) {
      this.id = o.id
      this.date = o.date
      let url = ""
      let urlTitle = ""
      let recipeLocation = ""

      switch (o.location._kind) {
         case "other":
            recipeLocation = o.location.other || "Unknown"; break;
         case "book":
            recipeLocation = `${o.location.book} (${o.location.page})`; break;
         case "url":
            url = o.location.url
            urlTitle = o.location.title
            break;
         default:
            break;
      }

      this._recipe.update({
         name: o.name,
         url,
         urlTitle,
         recipeLocation,
         recipeDate: o.date.getDate().toLocaleDateString(),
         description: ""
      })
   }

   previous() {
      if (this.stopUpdate || this.recipeIndex === 0) {
         return
      }
      this.recipeIndex--
      const recipe = this.recipes[this.recipeIndex]
      this._update(recipe)
      return recipe
   }

   peek(): RecipeAndDateDomain | undefined {
      return this.recipes[this.recipeIndex + 1]
   }

   next(recipe: RecipeAndDateDomain) {
      this.recipeIndex++
      if (this.recipeIndex === this.recipes.length) {
         this.recipes.push(recipe)
      }
      this._update(recipe)
   }
}
