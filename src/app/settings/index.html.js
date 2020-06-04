// @ts-check

import html from '../layouts/html.js'
import _default from "../layouts/_default.html.js"

const main = html`
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

const head = html`
<script async src="/app/utils/database.js" type="module"></script>
`

const page = _default({
   head,
   header: "<h1>Settings</h1>",
   currentPage: "Settings",
   main,
   afterMain: `<script src="./index.js" async type="module"></script>`,
})

console.log(page)
