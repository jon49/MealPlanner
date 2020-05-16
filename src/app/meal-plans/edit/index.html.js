// @ts-check
import html from '../../layouts/html.js'
import _default from "../../layouts/_default.html.js"
import { recipeTemplate } from './templates/_recipe.html.js'
import { cancelledRecipeTemplate } from './templates/_cancelled-recipe.html.js'

/**
 * @typedef Page
 * @property {"_meal-selections"} mealSelectionsId
 * @property {"start-date"} startDateFormId
 */

var head = html`
<script async src="/app/utils/utils.js" type="module"></script>
<script async src="/app/utils/template.js" type="module"></script>
<script async src="/app/utils/database.js" type="module"></script>
`

var main = html`
   <form>
      <label for="start-date"> Start Date: </label>
      <input id="start-date" name="start-date" type="date" required />
   </form>
   <section id="_meal-selections"></section>`

var afterMain = html`
${recipeTemplate}
${cancelledRecipeTemplate}
<script src="/app/meal-plans/edit/index.js" async type="module"></script>`

const page = _default({
   head,
   header: "Meal Planner",
   currentPage: "Plan Meals",
   main,
   afterMain,
})

console.log(page)
