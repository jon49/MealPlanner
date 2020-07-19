// @ts-check
import { html } from './html-build-utils.js'

/**
 * @typedef {string|(() => Promise<string>)|((() => Promise<string>)|string)[]} TemplateReturnType
 */

/**
 * @typedef {Object} DefaultTemplate
 * @property {TemplateReturnType} $meta
 * @property {TemplateReturnType} $title
 * @property {TemplateReturnType} $head
 * @property {TemplateReturnType} $bodyClass
 * @property {TemplateReturnType} $header
 * @property {TemplateReturnType} $nav
 * @property {TemplateReturnType} $main
 * @property {TemplateReturnType} $afterMain
 * @property {string} $template
 */
const template = html`
<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <meta http-equiv="X-UA-Compatible" content="ie=edge">
   <meta name=swjs>
   <title>{{$title}}</title>
   <link rel="stylesheet" type="text/css" href="/app/index.css">
   <script src="/app/utils/database.js"></script>
   <script async src="/app/utils/snack-bar.js"></script>
   <script async src="/app/index.js" type=module></script>
   {{$head}}
</head>
<body class="{{$bodyClass}}">
   <header>
      {{$header}}
      <nav><a href="/app/">Home</a>&nbsp;|&nbsp;{{$nav}}</nav>
   </header>
   <main id="_main">{{$main}}</main>
   {{$afterMain}}
   <template id="error-message-template">
      <snack-bar class=show><p slot="message"></p></snack-bar>
   </template>
   <div id="error-message"></div>
</body>
</html>
`

const placeHolders = /{{([^}]+)}}/g
/**
 * @param {string} template
 */
function getPlaceHolderNames (template) {
    var xs = []
    let m;
    while (m = placeHolders.exec(template)) {
        xs.push(m[1])
    }
    return xs
}

const found = getPlaceHolderNames(template)

const maps = {
    $bodyClass: async () => {
        /** @type {import("../utils/database").DatabaseWindow} */
        // @ts-ignore
        const s = self
        const db = await s.DB.getReadOnlyDB(["settings"])
        return (await db.settings.get("theme")) || ""
    }
}
/**
 * @param {string} key
 */
const mapValue = key =>
    key in maps
        // @ts-ignore
        ? { [key]: maps[key] }
    : { [key]: "" }

const parsedTemplate =
    template
    .split(placeHolders)
    .map(x => found.indexOf(x) > -1 ? mapValue(x) : x)

export default parsedTemplate
