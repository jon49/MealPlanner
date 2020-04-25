import html from '../../../layouts/util.js'
import _default from "../../../layouts/_default.html.js"

var head = html`
<script async src="/app/utils/fuzzy-search.js"></script>
<style type="text/css">fuzzy-search p { line-height: 0; margin: 0; padding: 0.5em; }</style>
`

var afterMain = html`
<script src="/app/meal-plans/edit/search/index.js" async type="module"></script>`

const main = html`
   <template id="_template">
   <p name="title"></p>
   <p><small name="location"></small></p>
   </template>
`

const page = _default({
   head,
   header: "Search for Meals",
   currentPage: "Meal Plan Search",
   main,
   afterMain,
})

console.log(page)
