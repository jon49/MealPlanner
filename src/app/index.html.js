// @ts-check
import html from "./layouts/html.js"

const $header = html`
<h1>
   <a href="/app/">
      <img alt="Meal Planner Logo" src="/images/meal-planner-logo.svg" height="50" width="300">
   </a>
</h1>
`

/** @type {Partial<import("./layouts/_default.builder.html.js").DefaultTemplate>} */
const page = {
   $title: "Home",
   $header,
   $main: "Yellow!",
}

export default page
