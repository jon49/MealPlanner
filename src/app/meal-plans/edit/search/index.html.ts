import html from '../../../layouts/util.js'
import _default from "../../../layouts/_default.html.js"

var head = html`
<script async src="/utils/fuzzy-search.js"></script>
`

var afterMain = html`
<script src="/app/meal-plans/edit/search/index.js" async type="module"></script>`

const page = _default({
   head,
   header: "Search for Meals",
   currentPage: "Meal Plan Search",
   main: "",
   afterMain,
})

console.log(page)
