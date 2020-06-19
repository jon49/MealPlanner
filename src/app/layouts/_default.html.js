// @ts-check
import html from './html.js'

/**
 * @typedef {Object} Link
 * @property {string} href
 * @property {string} title
 * @property {boolean} isCurrentPage
 */

/**
 * @param {Object} htmlSegment
 * @param {string} htmlSegment.currentPage
 * @param {string} htmlSegment.head
 * @param {string} [htmlSegment.header]
 * @param {string} htmlSegment.main
 * @param {string} htmlSegment.afterMain
 */
var _default = ({ main, currentPage, afterMain, head, header }) => html`
<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <meta http-equiv="X-UA-Compatible" content="ie=edge">
   <meta name=swjs>
   <title>${currentPage}</title>
   <link rel="stylesheet" type="text/css" href="/app/index.css">
   <script src="/app/utils/database.js"></script>
   <script async src="/app/utils/snack-bar.js"></script>
   <script async src="/app/index.js" type=module></script>
   ${head}
</head>
<body>
   <header>
      ${header}
      <nav>
         ${
            /**
             * @type {Link[]}
             */
            ([ { href: "/app/", title: "Home" }
             , { href: "/app/meal-plans/edit/", title: "Plan Meals", }
             , { href: "/app/meals/add/", title: "Add Meal", }
             ])
            .map(x => html`<a href=${x.href}>${x.title}</a>`)
            .join("&nbsp;|&nbsp;")
         }
      </nav>
   </header>
   

   <main id="_main">${main}</main>

   ${afterMain}

   <template id="error-message-template">
      <snack-bar class=show><p slot="message"></p></snack-bar>
   </template>
   <div id="error-message"></div>

</body>
</html>
`

export default _default
