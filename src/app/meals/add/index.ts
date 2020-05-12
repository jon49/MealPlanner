import { createString100, createString50, createPositiveWholeNumber, createIdNumber } from "../../utils/common-domain-types"
import { Domain } from "../../utils/database-domain-types"
import { createRecipe, getMealTimes } from "./store"
import { handleError, tryCatchWithArgs, validate, defer } from "../../utils/utils"
import template from "../../utils/template"
import { Page, HTMLAddRecipeForm, SourceValue } from "./index.html"
import { DatabaseType } from "../../utils/database"

var page : Page = {
    addRecipeFormId: "_add-recipe",
    previousRecipes: "_previous-recipes",
    mealTime: "meal-time"
}

const $form = <HTMLAddRecipeForm>document.getElementById(page.addRecipeFormId)
const $mealTime = <HTMLFieldSetElement>document.getElementById(page.mealTime)

/** Add Meal Time Choices */

const makeEl = (s: string) => document.createElement(s)
function addMealTimes(mealTimes: DatabaseType.MealTimeData[]) {
    const times = document.createDocumentFragment()
    mealTimes.forEach(x => {
        const $input = makeEl("input")
        const $label = makeEl("label")
        const id = `meal-time-${x.id}`
        ;[["type", "checkbox"]
        , ["id", id]
        , ["name", `meal-time-${x.id}`]
        , ["value", ""+x.id] ]
        .forEach(xs => $input.setAttribute(xs[0], xs[1]))
        $label.setAttribute("for", id)
        $label.textContent = x.name || "Unknown"
        times.append($input, $label, makeEl("br"))
    })
    $mealTime.append(times)
}

getMealTimes()
.then(tryCatchWithArgs(addMealTimes))
.catch(handleError)

/** Form submit **/

const saveRecipe = async () => {
    const data = await validateAddMealForm()
    const result = await createRecipe(data)
    return { data, result }
}

const submitOnce = () =>
    saveRecipe()
    .then(x => {
            location.href = `/app/meals/?id=${x.result}`
            return Promise.resolve()
        }, handleError)

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
        return Promise.resolve()
    }, handleError)

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
    const rawMealTimes = []
    for (const input of $form.querySelectorAll("[name^=meal-time-]")) {
        if (input instanceof HTMLInputElement && input.checked) rawMealTimes.push({id: input.value, name: input.dataset.name})
    }
    return validate(rawMealTimes.map(x => createIdNumber(x.name || "Unknown", +x.id)))
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
