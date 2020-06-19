// @ts-check
import html from '../layouts/html.js'

const $main = html`
<form id=settings>
    <label for=theme>Theme:</label>
    <br>
    <select id=theme name=theme>
        <option value=dark>Dark Mode</option>
        <option value=light>Light Mode</option>
        <option value="">Default</option>
    </select>
</form>
`

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
