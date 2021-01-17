import { DB, HTML, Module } from "../../@types/Globals"
import { DefaultTemplateFunction } from "../../layouts/app.template"
import { DatabaseType } from "../../utils/database"
import { ISODate } from "../../utils/utils"
import { RecipeDateDomain, RecipeDomain } from "./Domain/DomainTypes"

interface MealPlannerStoreSettings { startDate: ISODate }
interface RecipeTemplate {
    recipeDate: string
    date: string
    urlTitle: string
    url: string
    description: string
    name: string
    recipeLocation: string
    searchMeal: string
}

(async function addRecipe() {

const [{ template }, DB, html]: [DefaultTemplateFunction, DB, HTML] = await load("/app/layouts/app.template.js", "DB", "html")

var o = {

    getRecipeDates: async (startDate: ISODate, mealTimeId: number) : Promise<RecipeDateDomain[]> => {
        var db = await DB.getReadOnlyDB(["recipe-date"])
        var start = startDate.toString()
        var end = startDate.addDays(7).toString()
        var recipeDates = await db["recipe-date"].getRange(start, end, mealTimeId)
        return recipeDates.map(x => (
            { date: new ISODate(x.date)
            , mealTimeId: { _id: "meal-time", value: x.mealTimeId }
            , recipeId: { _id: "recipe", value: x.recipeId }
            , quantity: x.quantity
            }))
    },

    getRecipes: async () : Promise<RecipeDomain[]> => {
    var db = await DB.getReadOnlyDB(["recipe"])
    var recipes = await db.recipe.getAll()
    return recipes.map((x: DatabaseType.RecipeData) => (
        { location: x.location
        , id: { _id: "recipe", value: x.id }
        , name: x.name
        }))
    },

    getMealPlannerSettings: async () : Promise<MealPlannerStoreSettings> => {
        var db = await DB.getReadOnlyDB(["settings"])
        var settings = await db.settings.get("mealPlanner")
        return {
            startDate: new ISODate((settings && settings.startDate) || new Date())
        }
    },

    setMealPlannerSettings: async (mealPlannerSettings: MealPlannerStoreSettings) => {
        var db = await DB.getDB(["settings"])
        var settings = <DatabaseType.MealPlannerSettings>await db.settings.get("mealPlanner")
        if (settings) {
            settings.startDate = mealPlannerSettings.startDate.toString()
            db.settings.put({ mealPlanner: settings })
        }
        await db.done
    },

    setRecipeDate: async (data: RecipeDateDomain[]) => {
        var db = await DB.getDB(["recipe-date"])
        for (var d of data) {
            var o : DatabaseType.RecipeDateData = {
                mealTimeId: d.mealTimeId.value,
                date: d.date.toString(),
                quantity: d.quantity,
                recipeId: d.recipeId.value
            }
            await db["recipe-date"].put(o)
        }
        await db.done
    },

    canceledRecipeTemplate: ({date}: {date: string}) => html`
<div id=$${date}>
<p>$${date}</p>
<h2>No Recipe Chosen</h2>
<form class=inline action=post>
<input type=hidden name=id value=$${date}>
<input type=hidden name=cmd value=addRecipe>
<button>Add Recipe</button>
</form>
</div>`,

    recipeTemplate: (x : RecipeTemplate) => html`
<div class="meal-edit" id=${x.date}>
<p>${x.recipeDate}</p>
<h2 data-ref=name,title|text title="${x.name}">${x.name}</h2>
<p>
<small>
    <span data-ref=recipeLocation,title|text title="${x.recipeLocation}">${x.recipeLocation}</span>
    <a data-ref=url,href;urlTitle,title|text href="${x.url}" title="${x.urlTitle}">${x.urlTitle}</a>
</small>
</p>
<p data-ref=description,text>${x.description}</p>
<div>
<form class=inline method=post>
    <input type=hidden name=id value=${x.date}>
    <input type=hidden name=cmd value=cancel>
    <button>Cancel</button>&nbsp;
</form>
<form class=inline action="${x.searchMeal}">
    <button>Search</button>&nbsp;
</form>
<form class=inline action=post>
    <input type=hidden name=id value=${x.date}>
    <input type=hidden name=cmd value=previousMeal>
    <button>&laquo; Back</button>&nbsp;
</form>
<form class=inline action=post>
    <input type=hidden name=id value=${x.date}>
    <input type=hidden name=cmd value=nextMeal>
    <button>Next &raquo;</button>
</form>
</div>
</div>`,

    render: () =>
        template({
            head: html`
<script async src="/app/utils/utils.js" type="module"></script>
<script async src="/app/utils/database.js" type="module"></script>
<style>
.meal-edit {
min-width: 22em;
}
.meal-edit h2, .meal-edit p {
height: 1.25em;
overflow: hidden;
}
main { width: 100%; }
@media (max-width: 481px) {
.meal-edit h2, .meal-edit p {
    height: auto; overflow: none;
}
.meal-edit {
    min-width: auto;
}
}
</style>`,

            title: "Plan Meals",

            header: "<h1>Meal Planner</h1>",

            nav: "",

            main: html`
<form method=get>
<label for="start-date">Start Date:&nbsp;</label>
<input id="start-date" type=date name=startDate required>
<button>Submit</button>
</form>
<section id=_meal-selections class=cards>
/// TODO
<div><a href="/app/meals/add">Add New Meal</a></div>
</section>`,

            afterMain: ""
        }),
        command: {}
}

return o
}()) as Module
