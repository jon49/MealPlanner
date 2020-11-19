import { HTML, DB, Module } from "../@types/Globals"
import {  DefaultTemplateFunction } from "../layouts/app.template"

(async function settings() {

const [{ template }, DB, html]: [ DefaultTemplateFunction, DB, HTML] = await load("/app/layouts/app.template.js", "DB", "html")

var o = {
getThemes: async function getThemes() {
    const db = await DB.getReadOnlyDB(["settings"])
    const theme = await db.settings.get("theme")
    const selected = (x: string | undefined) => theme === x ? "selected" : ""
    return html`
        <option value=dark $${selected("dark")}>Dark Mode</option>
        <option value=light $${selected("light")}>Light Mode</option>
        <option value="" $${selected(void 0)}>Default</option>`
},
render: () =>
    template({
        head: "",
        title: "Settings",
        header: "<h1>Settings</h1>",
        nav: "",
        main: html`
            <form method=post onchange="this.querySelector('[type=submit]').click()">
                <input type=hidden name=cmd value=updateTheme>
                <label for=theme>Theme:</label>
                <br>
                <select id=theme name=theme>
                    ${o.getThemes()}
                </select>
                <input type=submit style=display:none>
            </form>`,
        afterMain: html`<script src="/app/settings/index.js"></script>`,
    }),
command: {
    // @ts-ignore
    updateTheme: async (req: Request, data: FormData) => {
        const db = await DB.getDB(["settings"])
        const theme = data.get("theme") as string
        await db.settings.put({ theme: theme })
        return new Response(JSON.stringify({ theme }), {
            headers: {
                "content-type": "application/json; charset=utf-8",
                "event": "themeUpdated"
            }})
    }
}
}
return o
}()) as Module
