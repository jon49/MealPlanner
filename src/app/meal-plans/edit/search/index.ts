// import { getActiveRecipes, setRecipeDate } from "./store.js"
// import { RecipeDateDomain } from "../Domain/DomainTypes.js";
// import { handleError, ISODate } from "../../../utils/utils.js"

// interface FuzzySearch extends HTMLElement {
//    template: string
//    searchList: {
//       value: string | { title: string, [key: string]: string },
//       id: string|number,
//       compareValue: string }[]
// }

// getActiveRecipes()
// .then(recipes => {
//    const $fuzzySearch = <FuzzySearch>document.createElement("fuzzy-search")
//    $fuzzySearch.setAttribute("limit", "10")
//    $fuzzySearch.setAttribute("empty-message", "No meals available.")
//    $fuzzySearch.setAttribute("autofocus", "")
//    $fuzzySearch.template = "#_template"
//    $fuzzySearch.searchList = recipes.map(x => {
//       let location : string
//       switch (x.location._kind) {
//          case "book":
//             location = `${x.location.book} - ${x.location.page}`
//             break;
//          case "other":
//             location = x.location.other
//             break;
//          case "url":
//             location = x.location.url
//             break;
//       }
//       return {
//          value: { title: x.name, location },
//          id: x.id.value,
//          compareValue: x.name.toLowerCase() }})
//    $fuzzySearch.addEventListener("selected", selected as EventListener)

//    const $main = <HTMLDivElement>document.getElementById("_main")
//    if ($main) {
//       $main.append($fuzzySearch)
//    }
// })
// .catch(handleError)

// function selected(e: CustomEvent) {
//    e.preventDefault()
//    const id = +e.detail.id
//    const params = new URLSearchParams(location.search);
//    const recipeDate = params.get("recipeDate")
//    const mealTimeId = params.get("mealTimeId")
//    let catId: number | undefined
//    if (mealTimeId && !isNaN(+mealTimeId)) {
//       catId = +mealTimeId
//    }
//    if (!id || !recipeDate) {
//       return
//    }
//    const data: RecipeDateDomain = {
//       mealTimeId: { _id: "meal-time", value: catId || 1 },
//       date: new ISODate(recipeDate),
//       quantity: 1,
//       recipeId: { _id: "recipe", value: id }
//    }
//    setRecipeDate([data])
//    .then(() => { location.href = `/app/meal-plans/edit#${recipeDate.toString()}` })
//    .catch(handleError)
// }
