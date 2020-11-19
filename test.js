var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
System.register("_default.template", [], function (exports_1, context_1) {
    "use strict";
    var templateObject_1;
    var __moduleName = context_1 && context_1.id;
    function DefaultTemplate(html) {
        return function (_a) {
            var head = _a.head, header = _a.header, nav = _a.nav, main = _a.main, afterMain = _a.afterMain;
            return html(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n   <!DOCTYPE html>\n   <html lang=\"en\">\n   <head>\n      <meta charset=\"UTF-8\">\n      <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n      <meta http-equiv=\"X-UA-Compatible\" content=\"ie=edge\">\n      <meta name=swjs>\n      <link rel=\"stylesheet\" type=\"text/css\" href=\"/app/index.css\">\n      <script src=\"/app/utils/database.js\"></script>\n      <script async src=\"/app/utils/snack-bar.js\"></script>\n      <script async src=\"/app/index.js\" type=module></script>\n      $", "\n   </head>\n   <body class=\"{{body-class}}\">\n      <header>\n         $", "\n         <nav><a href=\"/app/\">Home</a>&nbsp;|&nbsp;$", "</nav>\n      </header>\n      <main id=\"_main\">$", "</main>\n      $", "\n      <template id=\"error-message-template\">\n         <snack-bar class=show><p slot=\"message\"></p></snack-bar>\n      </template>\n      <div id=\"error-message\"></div>\n   </body>\n   </html>"], ["\n   <!DOCTYPE html>\n   <html lang=\"en\">\n   <head>\n      <meta charset=\"UTF-8\">\n      <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n      <meta http-equiv=\"X-UA-Compatible\" content=\"ie=edge\">\n      <meta name=swjs>\n      <link rel=\"stylesheet\" type=\"text/css\" href=\"/app/index.css\">\n      <script src=\"/app/utils/database.js\"></script>\n      <script async src=\"/app/utils/snack-bar.js\"></script>\n      <script async src=\"/app/index.js\" type=module></script>\n      $", "\n   </head>\n   <body class=\"{{body-class}}\">\n      <header>\n         $", "\n         <nav><a href=\"/app/\">Home</a>&nbsp;|&nbsp;$", "</nav>\n      </header>\n      <main id=\"_main\">$", "</main>\n      $", "\n      <template id=\"error-message-template\">\n         <snack-bar class=show><p slot=\"message\"></p></snack-bar>\n      </template>\n      <div id=\"error-message\"></div>\n   </body>\n   </html>"])), head, header, nav, main, afterMain);
        };
    }
    exports_1("default", DefaultTemplate);
    return {
        setters: [],
        execute: function () {
        }
    };
});
