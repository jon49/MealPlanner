// @ts-check
import html from './html.js'

/**
 * @typedef CurrentPageTitle
 * @type {"Home"|"Plan Meals"|"Meal Plan Search"|"Add Meal"}
 */

/**
 * @typedef {Object} Link
 * @property {string} href
 * @property {CurrentPageTitle} title
 * @property {boolean} isCurrentPage
 */

/**
 * @param {Link} o 
 */
const createLink = o =>
   html`<a href="${o.isCurrentPage ? "#" : o.href}">${o.title}</a>`

/**
 * @param {Object} htmlSegment
 * @param {CurrentPageTitle} htmlSegment.currentPage
 * @param {string} htmlSegment.head
 * @param {string} htmlSegment.header
 * @param {string} htmlSegment.main
 * @param {string} htmlSegment.afterMain
 */
var _default = ({ main, currentPage, afterMain, head }) => html`
<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <meta http-equiv="X-UA-Compatible" content="ie=edge">
   <title>${currentPage}</title>
   <link rel="stylesheet" type="text/css" href="/app/index.css">
   <script async src="/app/utils/snack-bar.js"></script>
   <script async src="/app/index.js"></script>
   ${head}
</head>
<body>
   <nav>
      <a href="/app/">
         <img alt="Meal Planner Logo" src="/images/meal-planner-logo.svg" height="50" width="300">
      </a>
      <ul>
      ${
         /**
          * @type {Link[]}
          */
         ([{
            href: "/app/meal-plans/edit/",
            title: "Plan Meals",
            isCurrentPage: currentPage === "Plan Meals"
         }, {
            href: "/app/meals/add/",
            title: "Add Meal",
            isCurrentPage: currentPage == "Add Meal"
         }])
         .map(x => `<li>${createLink(x)}</li>`).join("|")
      }
      </ul>
   </nav>

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
