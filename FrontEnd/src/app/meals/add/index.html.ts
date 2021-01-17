import type { Module, HTML, DB } from "../../@types/Globals"
import type {  DefaultTemplateFunction } from "../../layouts/app.template"
import type { Validation } from "../../utils/validation"


(async function addRecipe() {

// const [{ template }, html, DB, { validate, type: { createString100 } }]: [DefaultTemplateFunction, HTML, DB, Validation] =
//     await load("/app/layouts/app.template.js", "html", "DB", "/app/utils/validation.js")
const [{ template }, html, DB ]: [DefaultTemplateFunction, HTML, DB, Validation] =
    await load("/app/layouts/app.template.js", "html", "DB", "/app/utils/validation.js")

var o = {

    getMealTimes: async () => {
        const db = await DB.getReadOnlyDB(["meal-time"])
        const mealTimes = (await db["meal-time"].getAll()) ?? []
        const checked = mealTimes.length === 1 ? ` checked` : ``
        const $mealTimes =
            mealTimes
            .map(x => {
                const id = ""+(+x.id)
                const name = `meal-time-${id}`
                return html`
                <input type="checkbox" id="$${name}" name="$${name}" value="$${id}"$${checked}>
                <label for="$${name}">${x.name || "Unknown"}</label><br>`
            })
        return $mealTimes
    },

    render: () =>
        template({
            head: html`
<link rel="stylesheet" type="text/css" href="/app/form.css">
<script async src="/app/utils/form-tabs.js"></script>
            `,
            title: "Add Meal",
            header: `<h1>Add Meal</h1>`,
            nav: `<a href="/app/meal-plans/edit">Plan Meals</a>`,
            main: html`
<form id="_add-recipe">
<label for="name">Recipe Name:</label>
<input id="name" type="text" placeholder="Spaghetti with Meatballs" name="recipe-name" autofocus required>
<p class="error">The name of your recipe, e.g.,&nbsp;<em>Spaghetti with Meatballs</em></p>
<form-tabs>
<fieldset slot="tabs">
    <legend>Recipe Source</legend>
    <input class="tab" type="radio" id="radio-url" name="source" value="url" data-tab="1" checked>
    <label for="radio-url">Website</label>
    <input class="tab" type="radio" id="radio-book" name="source" value="book" data-tab="2">
    <label for="radio-book">Book</label>
    <input class="tab" type="radio" id="radio-other" name="source" value="other" data-tab="3">
    <label for="radio-other">Other</label>
    <fieldset data-tab="1">
        <label for="source-url">Website:</label>
        <input type="url" id="source-url" name="url" placeholder="https://example.com" required>
        <p class="error">Please enter the URL for the website.</p>
        <br>
        <label for="source-title">Title:</label>
        <input type="text" id="source-title" name="url-title" placeholder="My Recipe" required>
        <p class="error">The title for your URL, e.g.,&nbsp;<a href="https://example.com">My Recipe</a></p>
        <br>
        <input type="checkbox" id="source-title-url" name="use-url-as-title">
        <label for="source-title-url">Use the URL as the title</label>
        <p class="error">E.g.,&nbsp;<a href="https://example.com">https://example.com</a></p>
    </fieldset>
    <fieldset data-tab="2">
        <label for="source-book">Book:</label>
        <input id="source-book" name="book" type="text" placeholder="My Favorite Recipe Book" required>
        <p class="error">The name of the recipe book, e.g.,&nbsp;<em>My Favorite Recipe Book</em>.</p>
        <br>
        <label for="source-book-page">Book Page:</label>
        <input id="source-book-page" name="book-page" type="number" placeholder="125" required>
        <p class="error">The page number of your book, e.g., 125.</p>
    </fieldset>
    <fieldset data-tab="3">
        <label for="source-other">Other:</label>
        <input id="source-other" name="other" type="text" placeholder="I made this recipe!" required>
        <p class="error">Where your recipe came from.</p>
    </fieldset>
</fieldset>
</form-tabs>
<fieldset id="meal-times">
<legend>Meal Times</legend>
$${o.getMealTimes()}
</fieldset>
<input type="reset" value="Clear">&nbsp;
<input id="save-once" type="submit" value="Save">&nbsp;
<input id="save-and-add" type="submit" value="Save & Add Another">
</form>
<div id="_previous-recipes"></div>`,
            afterMain: "" }),

    previousRecipe: (previousRecipeUrl : string) => {
        return html`<p><a href=$${previousRecipeUrl}>$${previousRecipeUrl}</a></p>`
    },

    command: {
        // createRecipe: async ({ data }: { request: Request, data: FormData }) => {
        //     // const [recipeName] = await validate([createString100("Recipe Name", <string>data.get("recipe-name"))]) 
        //     return o.previousRecipe("https://example.com")
        // }
    }

}
return o
}()) as Module