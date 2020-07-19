// @ts-check
import { html, splitHtml } from "../layouts/html-build-utils.js"

const main = html`
<form id=settings>
    <label for=theme>Theme:</label>
    <br>
    <select id=theme name=theme>
        {{getOptions}}
    </select>
</form>
`

async function getOptions() {
    /** @type {import("../@types/globals").CustomGlobal} */
    // @ts-ignore
    const s = self

    const db = await s.DB.getReadOnlyDB(["settings"])
    const theme = await db.settings.get("theme")

    /**
     * @param {string|undefined} x
     */
    const selected = (x) => theme === x ? "selected" : ""

    return s.M.html`
        <option value=dark $${selected("dark")}>Dark Mode</option>
        <option value=light $${selected("light")}>Light Mode</option>
        <option value="" $${selected(void 0)}>Default</option>`
}

const $main = splitHtml(main, { getOptions })

const $head = html`
<script async src="/app/utils/database.js" type="module"></script>
`

/** @type {Partial<import("../layouts/_default.builder.html.js").DefaultTemplate>} */
const page = {
   $head,
   $header: "<h1>Settings</h1>",
   $title: "Settings",
   $main,
   $afterMain: `<script src="/app/settings/index.js" async type="module"></script>`,
}

export default page
