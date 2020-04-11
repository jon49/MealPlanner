import html from '../../layouts/util.js'
import _default from "../../layouts/_default.html.js"
import { recipeTemplate } from './templates/_recipe.html.js'
import { cancelledRecipeTemplate } from './templates/_cancelled-recipe.html.js'

export interface Page {
   mealSelectionsId: "_meal-selections"
   startDateFormId: "_start-date"
}

var head = html`
<script async src="/app/utils/utils.js" type="module"></script>
<script async src="/app/utils/template.js" type="module"></script>
<script async src="/app/utils/database.js" type="module"></script>
`

var main = html`
   <form>
      <label for="start-date"> Start Date: </label>
      <input id="_start-date" name="start-date" type="date" required />
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
