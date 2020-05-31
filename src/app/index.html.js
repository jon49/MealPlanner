// @ts-check
import _default from "./layouts/_default.html.js"
import html from "./layouts/html.js"

const header = html`
<h1>
   <a href="/app/">
      <img alt="Meal Planner Logo" src="/images/meal-planner-logo.svg" height="50" width="300">
   </a>
</h1>
`

const page = _default({
   currentPage: "Home",
   head: "",
   header,
   main: "Yellow!",
   afterMain: "",
})

console.log(page)
