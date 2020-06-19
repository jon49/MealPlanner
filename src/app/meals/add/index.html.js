// @ts-check
import html from "../../layouts/html.js"

const $head = html`<link rel="stylesheet" type="text/css" href="/app/form.css">
    <script async src="/app/utils/form-tabs.js"></script>`

const main = html`
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
        {{createMealTimes}}
        </fieldset>
        <input type="reset" value="Clear">&nbsp;
        <input id="save-once" type="submit" value="Save">&nbsp;
        <input id="save-and-add" type="submit" value="Save & Add Another">
    </form>
    <template id="_previous-recipe">
        <p><a #href=previousRecipeUrl>#previousRecipe</a></p>
    </template>
    <div id="_previous-recipes"></div>
`

async function $main() {
    /** @type {import("../../@types/globals").CustomGlobal} */
    // @ts-ignore
    const s = self
    const db = await s.DB.getReadOnlyDB(["meal-time"])
    const mealTimes = await db["meal-time"].getAll()
    const $mealTimes =
        mealTimes
        .map(x => {
            const id = ""+(+x.id)
            const checked = mealTimes.length === 1 ? `checked="true"` : ``
            s.M.html`
            <input type="checkbox" id="meal-time-$${id}" name="meal-times" value="$${id}" $${checked}>
            <label for="meal-time-$${id}">${x.name || "Unknown"}</label><br>`
        }).join("")
    return main.replace(`{{createMealTimes}}`, $mealTimes)
}

const $afterMain = html`
    <script src="/app/meals/add/index.js" async type="module"></script>`

const $template = "/app/layouts/_default.builder.html.js"

/** @type {Partial<import("../../layouts/_default.builder.html.js").DefaultTemplate>} */
const templateItems = {
    $main,
    $afterMain,
    $head,
    $header: "<h1>Add Meal</h1>",
    $title: "Add Meal",
    $template,
    $nav: html`<a href="/app/meal-plans/edit">Plan Meals</a>`
}

export default Object.assign({ main }, templateItems)
