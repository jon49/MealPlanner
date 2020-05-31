import { createString100, createString50, createPositiveWholeNumber, createIdNumber } from "../../utils/common-domain-types.js"
import { Domain } from "../../utils/database-domain-types.js"
import { createRecipe, getMealTimes } from "./store.js"
import { handleError, validate, defer } from "../../utils/utils.js"
import template from "../../utils/template.js"
import { Page, HTMLAddRecipeForm, SourceValue } from "./index.html.js"
import { DatabaseType } from "../../utils/database.js"

var page : Page = {
    addRecipeFormId: "_add-recipe",
    previousRecipes: "_previous-recipes",
    mealTimes: "meal-times"
}

const $form = <HTMLAddRecipeForm>document.getElementById(page.addRecipeFormId)
const $mealTime = <HTMLFieldSetElement>document.getElementById(page.mealTimes)

/** Add Meal Time Choices */

const makeEl = (s: string) => document.createElement(s)
function addMealTimes(mealTimes: DatabaseType.MealTimeData[]) {
    const times = document.createDocumentFragment()
    var $input = makeEl("input")
    mealTimes.forEach(x => {
        const $label = makeEl("label")
        const id = `meal-time-${x.id}`
        ;[["type", "checkbox"]
        , ["id", id]
        , ["name", `meal-times`]
        , ["value", ""+x.id] ]
        .forEach(xs => $input.setAttribute(xs[0], xs[1]))
        $label.setAttribute("for", id)
        $label.textContent = x.name || "Unknown"
        times.append($input, $label, makeEl("br"))
    })
    mealTimes.length === 1 && $input.setAttribute("checked", "true")
    $mealTime.append(times)
}

getMealTimes()
.then(addMealTimes)
.catch(handleError)

/** Form submit **/

const saveRecipe = async () => {
    const data = await validateAddMealForm()
    const result = await createRecipe(data)
    return { data, result }
}

const submitOnce = () =>
    saveRecipe()
    .then(x => { location.href = `/app/meals/?id=${x.result}` })
    .catch(handleError)

interface PreviousRecipeTemplate {
    "previous-recipe": HTMLAnchorElement
    root: HTMLParagraphElement
}
type PreviousRecipeTemplateId = "_previous-recipe"
var previousRecipeView = template.get<PreviousRecipeTemplateId>("_previous-recipe")
const previousRecipesList = <HTMLDivElement>document.getElementById(page.previousRecipes)
const saveAndAdd = () =>
    saveRecipe()
    .then(x => {
        var root = previousRecipeView.cloneNode(true)
        var nodes = <PreviousRecipeTemplate>previousRecipeView.collect(root)
        nodes["previous-recipe"].href = `/app/meals/?id=${x.result}`
        nodes["previous-recipe"].textContent = x.data.name.value
        previousRecipesList.prepend(nodes.root)
        $form.reset()
    })
    .catch(handleError)

const submit = (e: Event) => {
    e.preventDefault()
    return (document.activeElement && document.activeElement.id === "save-and-add")
        ? saveAndAdd()
    : submitOnce()
}

$form.addEventListener("submit", defer(submit))

async function getValidatedLocation() {
    let locationType = <SourceValue> $form.source.value
    let location : Domain.Recipe.Location
    switch (locationType) {
        case "book":
            const [book, page] = await validate([createString50("Book Title", $form.book.value), createPositiveWholeNumber("Book Page Number", +$form["book-page"].value)])
            location = { _kind: "book", book, page }
            break
        case "url":
            const urlVal = $form.url.value
            const maybeUrl = createString100("Website URL", urlVal)
            const maybeTitle = createString50("Website Title", $form["use-url-as-title"].checked ? urlVal.slice(0, 50) : $form["url-title"].value)
            const [url, title] = await validate([maybeUrl, maybeTitle]) 
            location = { _kind: "url", url, title }
            break
        case "other":
            const [other] = await validate([createString100("Other", $form.other.value)])
            location = { _kind: "other", other }
            break
    }
    return location
}

function getValidatedMealTimeIds() {
    var rawMealTimes = $form["meal-times"]
    const mealTimes =
        (rawMealTimes instanceof RadioNodeList
            ? Array.from(rawMealTimes)
        : [rawMealTimes])
        .filter(x => x instanceof HTMLInputElement && x.checked)
        .map(x => (<HTMLInputElement>x).value)
    return validate(mealTimes.map(x => createIdNumber("Meal times", +x)))
}

async function validateAddMealForm(): Promise<Domain.Recipe.Recipe> {

    const [location, mealTimeIds, recipeName] = await validate(
        [ getValidatedLocation()
        , getValidatedMealTimeIds()
        , createString100("Recipe Name", $form["recipe-name"].value)
    ])

    if (mealTimeIds.length === 0) {
        return Promise.reject(["Meal times need to have at least one item checked."])
    }

    return { name: recipeName , location , mealTimeIds }
}

/** Toggle URL Title with Checkbox **/

function toggleUrlTitle($checkbox: HTMLInputElement) {
    const $urlTitle = $form["url-title"]
    if ($checkbox.checked) {
        $urlTitle.removeAttribute("required")
        $urlTitle.value = ""
    } else {
        $urlTitle.setAttribute("required", "")
    }
}

function toggleUrlCheckbox($urlTitle: HTMLInputElement) {
    var useURL = $form["use-url-as-title"]
    if (useURL.checked) {
        useURL.checked = false
        $urlTitle.setAttribute("required", "")
    }
}

$form.addEventListener("change", e => {
    var target = e.target
    if (target instanceof HTMLInputElement) {
        switch (<keyof HTMLAddRecipeForm>target.name) {
            case "use-url-as-title":
                toggleUrlTitle(target)
                break
            case "url-title":
                toggleUrlCheckbox(target)
                break
        }
    }
})
