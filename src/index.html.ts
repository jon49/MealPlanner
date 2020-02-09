import _default from "./layouts/_default.html.js"

const page = _default({
   currentPage: "Home",
   head: "",
   header: "Welcome to Meal Planner!",
   main: "Yellow! And Green",
   afterMain: "",
})

console.log(page)
