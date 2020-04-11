import html from './util.js'

type CurrentPageTitle
   = "Home"
   | "Plan Meals" 
   | "Meal Plan Search"

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

var _default = ({ main, header, currentPage, afterMain, head } : DefaultOptions) => html`
<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <meta http-equiv="X-UA-Compatible" content="ie=edge">
   <title>${currentPage}</title>
   ${head}
</head>
<body>
   <h1>${header}</h1>

   <nav>
      ${
         (<Link[]>[{
            href: "/app",
            title: "Home",
            isCurrentPage: currentPage === "Home"
         }, {
            href: "/app/meal-plans/edit",
            title: "Plan Meals",
            isCurrentPage: currentPage === "Plan Meals"
         }])
         .map(createLink).join("")
      }
   </nav>

   <main id="_main">${main}</main>

   ${afterMain}

</body>
</html>
`

export default _default
