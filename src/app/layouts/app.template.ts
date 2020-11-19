import { HTML, DB, HTMLRunnerSubs } from "../@types/Globals"
export interface DefaultTemplateFunction {
   template: (options: DefaultTemplate_) => { start: (callback: Function) => string }
}
export interface DefaultTemplate_ {
    head : HTMLRunnerSubs
    title : HTMLRunnerSubs
    header : HTMLRunnerSubs
    nav : HTMLRunnerSubs
    main : HTMLRunnerSubs
    afterMain : HTMLRunnerSubs
}

(async function DefaultTemplate() {
const [DB, html]: [DB, HTML] = await load("DB", "html")
   var o = {
      bodyClass:
         async function bodyClass() {
            const db = await DB.getReadOnlyDB(["settings"])
            var theme = await db.settings.get("theme")
            return theme || ""
         },
      template: ({ head, title, header, nav, main, afterMain } : DefaultTemplate_) => html`
      <!DOCTYPE html>
      <html lang="en">
      <head>
         <meta charset="UTF-8">
         <meta name="viewport" content="width=device-width, initial-scale=1.0">
         <meta http-equiv="X-UA-Compatible" content="ie=edge">
         <meta name=swjs>
         <link rel="stylesheet" type="text/css" href="/app/index.css">
         <script src="/app/utils/database.js"></script>
         <script async src="/app/utils/snack-bar.js"></script>
         <script src="/app/index.js"></script>
         <title>$${title}</title>
         $${head}
      </head>
      <body class="${o.bodyClass()}">
         <header>
            $${header}
            <nav><a href="/app/">Home</a>&nbsp;|&nbsp;$${nav}</nav>
         </header>
         <main id="_main">$${main}</main>
         $${afterMain}
         <template id="error-message-template">
            <snack-bar class=show><p slot="message"></p></snack-bar>
         </template>
         <div id="error-message"></div>
      </body>
      </html>`
   }
   return o;
}())
