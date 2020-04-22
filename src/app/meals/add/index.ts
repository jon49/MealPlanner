import { String100, String50, PositiveWholeNumber, createString100, createString50, createPositiveWholeNumber } from "../../utils/common-domain-types.js"
import { Do, validateForm, Either, right, taskEither, fromEither, pipe, mapLeft, fold, Validation } from "../../utils/fp.js"
import { Domain } from "../../utils/database-domain-types.js"
import { createRecipe } from "./store.js"
import { defer } from "../../utils/utils.js"
import template from "../../utils/template.js"
import { Page, HTMLAddRecipeForm, SourceValue } from "./index.html.js"

var page : Page = {
    addRecipeFormId: "_add-recipe",
    previousRecipes: "_previous-recipes"
}

const $form = <HTMLAddRecipeForm>document.getElementById(page.addRecipeFormId)

/** Form submit **/

const saveRecipe =
    Do(taskEither)
    .bindL("data", () => pipe(validateAddMealForm(), mapLeft(x => x.join("\n")), fromEither))
    .bindL("result", ({ data }) => createRecipe(data))
    .done()

const submitOnce = () =>
    saveRecipe()
    .then(
        fold(x => {
            document.dispatchEvent(new CustomEvent("Error", { detail: x }))
            return Promise.resolve()
        }, x => {
            location.href = `/app/meals/?id=${x.result}`
            return Promise.resolve()
        })
    )

interface PreviousRecipeTemplate {
    "previous-recipe": HTMLAnchorElement
    root: HTMLParagraphElement
}
type PreviousRecipeTemplateId = "_previous-recipe"
var previousRecipeView = template.get<PreviousRecipeTemplateId>("_previous-recipe")
const previousRecipesList = <HTMLDivElement>document.getElementById(page.previousRecipes)
const saveAndAdd = () =>
    saveRecipe()
    .then(fold(x => {
        document.dispatchEvent(new CustomEvent("Error", { detail: x }))
        return Promise.resolve()
    }, x => {
        var root = previousRecipeView.cloneNode(true)
        var nodes = <PreviousRecipeTemplate>previousRecipeView.collect(root)
        nodes["previous-recipe"].href = `/app/meals/?id=${x.result}`
        nodes["previous-recipe"].textContent = x.data.name.value
        previousRecipesList.prepend(nodes.root)
        $form.reset()
        return Promise.resolve()
    }))

const submit = (e: Event) => {
    e.preventDefault()
    return (document.activeElement && document.activeElement.id === "save-and-add")
        ? saveAndAdd()
    : submitOnce()
}

$form.addEventListener("submit", defer(submit))

class LocationUrlValidation {
    readonly url: Either<string[], String100>
    readonly title: Either<string[], String50>
    readonly _kind: Either<string[], "url">
    constructor(url: string, title: string, useUrlAsTitle: boolean) {
        this.url = createString100("Website URL", url)
        this.title = useUrlAsTitle ? this.url : createString50("Website Title", title)
        this._kind = right("url")
    }
}

type EitherSourceValue<T extends SourceValue> = Validation<T>
type LocationBookValidation = { _kind: EitherSourceValue<"book">, book: Validation<String50>, page: Validation<PositiveWholeNumber> } 
type LocationUrlValidationType = { _kind: EitherSourceValue<"url">, title: Validation<String50>, url: Validation<String100> }
type LocationOtherValidation = { _kind: EitherSourceValue<"other">, other: Validation<String100> }
export type LocationValidation = LocationBookValidation | LocationUrlValidationType | LocationOtherValidation

function validateAddMealForm() {
    let locationType = <SourceValue> $form.source.value
    let location : LocationValidation
    switch (locationType) {
        case "book":
            location = {
                _kind: right("book"),
                book: createString50("Book Title", $form.book.value),
                page: createPositiveWholeNumber("Book Page Number", +$form["book-page"].value) }
            break
        case "url":
            location = new LocationUrlValidation($form.url.value, $form["url-title"].value, $form["use-url-as-title"].checked)
            break
        case "other":
            location = { _kind: right("other"), other: createString100("Other", $form.other.value) }
            break
    }

    return Do(validateForm())
    .sequenceS({
        recipeName: createString100("Recipe Name", $form["recipe-name"].value),
        ...location
    })
    .return(o => {
        let location: Domain.Recipe.Location
        switch (o._kind) {
            case "book":
                location = { _kind: "book", book: o.book, page: o.page }
                break
            case "other":
                location = { _kind: "other", other: o.other }
                break
            case "url":
                location = { _kind: "url", url: o.url, title: o.title }
                break
        }

        const result : Domain.Recipe.Recipe = {
            name: o.recipeName,
            location }
        return result
    })
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
