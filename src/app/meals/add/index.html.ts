import html from "../../layouts/util.js"
import _default from "../../layouts/_default.html.js"

const main = html`
    <form>
        <label for="name">Recipe:</label>
        <input id="name" type="text" placeholder="Recipe Name" name="name" required>
        <p class="error">Your recipe must have a name.</p>
        <fieldset>
            <legend>Recipe Source</legend>
            <input class="tab" type="radio" id="url" name="source" value="url" data-tab="1" checked>
            <label for="url">Website</label>
            <input class="tab" type="radio" id="book" name="source" value="book" data-tab="2">
            <label for="book">Book</label>
            <input class="tab" type="radio" id="other" name="source" value="other" data-tab="3">
            <label for="other">Other</label>
            <div data-tab="1">
                <label for="source-url">Website:</label>
                <input type="url" id="source-url" name="url" placeholder="https://example.com" data-required>
                <p class="error">Please enter the URL for the website.</p>
            </div>
            <div data-tab="2">
                <label for="source-book">Book:</label>
                <input id="source-book" name="book" type="text" placeholder="My Favorite Recipe Book" data-required>
                <p class="error">Please enter the page for the book.</p>
                <br>
                <label for="source-book-page">Book Page:</label>
                <input id="source-book-page" name="book-page" type="text" placeholder="125" data-required>
                <p class="error">Please enter a page for the book.</p>
            </div>
            <div data-tab="3">
                <label for="source-other">Other:</label>
                <input id="source-other" name="other" type="text" placeholder="I made this recipe!" data-required>
                <p class="error">Please enter where the recipe came from.</p>
            </div>
        </fieldset>
        <input type="reset" value="Clear">&nbsp;
        <input type="submit" value="Save">
    </form>
`

const page = _default({
    head: `<link rel="stylesheet" type="text/css" href="/app/form.css">`,
    header: "Add Meal",
    currentPage: "Add Meal",
    main,
    afterMain: "",
})

console.log(page)

