// @ts-check
import { html } from "../../../layouts/html-build-utils.js"

var $head = html`
<script async src="/app/utils/fuzzy-search.js"></script>
<style type="text/css">fuzzy-search p { line-height: 0; margin: 0; padding: 0.5em; }</style>
`

var $afterMain = html`
<script src="/app/meal-plans/edit/search/index.js" async type="module"></script>`

const $main = html`
   <template id="_template">
   <p name="title"></p>
   <p><small name="location"></small></p>
   </template>
`

/** @type {Partial<import("../../../layouts/_default.builder.html.js").DefaultTemplate>} */
const page = {
   $head,
   $header: "Search for Meals",
   $title: "Meal Plan Search",
   $main,
   $afterMain,
   $nav: html`<a href="/app/meal-plans/edit">Plan Meals</a>`
}

export default page
