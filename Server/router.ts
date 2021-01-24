import { router, ifUrl } from "./backend/router/index.ts"
import { login } from "./features/login/index.ts"
import home from "./features/home/index.html.ts"
import { toHTML } from "./backend/http.ts"

router
.get(ifUrl("/app"), toHTML(home))
.get(ifUrl("/login"), toHTML(login))

export default router.run
