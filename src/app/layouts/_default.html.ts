import html from './util.js'

type CurrentPageTitle
   = "Home"
   | "Plan Meals" 
   | "Meal Plan Search"
   | "Add Meal"

interface DefaultOptions {
   currentPage : CurrentPageTitle
   head : string
   header : string
   main : string
   afterMain : string
}

interface Link {
   href : string
   title : CurrentPageTitle
   isCurrentPage : boolean 
}

const createLink = (o : Link) =>
   html`<a href="${o.isCurrentPage ? "#" : o.href}">${o.title}</a>`

var _default = ({ main, currentPage, afterMain, head } : DefaultOptions) => html`
<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <meta http-equiv="X-UA-Compatible" content="ie=edge">
   <title>${currentPage}</title>
   <link rel="stylesheet" type="text/css" href="/app/index.css">
   ${head}
</head>
<body>
   <nav>
      <a href="/app">
         <img alt="Meal Planner Logo" src="/images/meal-planner-logo.svg" height="50" width="300">
         <!-- <object type="image/svg+xml" data="/images/meal-planner-logo.svg" height="70"></object> -->
      </a>
      <ul>
      ${
         (<Link[]>[{
            href: "/app",
            title: "Home",
            isCurrentPage: currentPage === "Home"
         }, {
            href: "/app/meal-plans/edit",
            title: "Plan Meals",
            isCurrentPage: currentPage === "Plan Meals"
         }, {
            href: "/app/meals/add",
            title: "Add Meal",
            isCurrentPage: currentPage == "Add Meal"
         }])
         .map(x => `<li>${createLink(x)}</li>`).join("|")
      }
      </ul>
   </nav>

   <main id="_main">${main}</main>

   ${afterMain}

</body>
</html>
`

export default _default
