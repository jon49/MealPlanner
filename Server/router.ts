import { router, ifUrl } from "./backend/router/index.ts"
// import login from "./features/login/index.html.ts"
import home from "./features/login/index.html.ts"
import { toHTML } from "./backend/http.ts"

router
.get(ifUrl("/"), req => toHTML(req, home()))
// .get("/", req => toHTML(req, login()))

export default router.run
