import { HTML, Module } from "../../../@types/Globals"
import { DefaultTemplateFunction } from "../../../layouts/app.template"

(async function addRecipe() {

const [{ template }, html]: [DefaultTemplateFunction, HTML] =
    await load("/app/layouts/app.template.js", "html")

var o = {
    render: () =>
        template({

head: html`
<script async src="/app/utils/fuzzy-search.js"></script>
<style type="text/css">
    fuzzy-search p {
        line-height: 0;
        margin: 0;
        padding: 0.5em;
    }
</style>`,

title: "Meal Plan Search",

header: "Search for Meals",

nav: html`<a href="/app/meal-plans/edit">Meal Plans</a>`,

main: html`
<template id="_template">
    <p name="title"></p>
    <p><small name="location"></small></p>
</template>`,

afterMain: `<script src="/app/meal-plans/edit/search/index.js" async type="module"></script>`,

        }),
        command: {}
}

return o

}()) as Module
