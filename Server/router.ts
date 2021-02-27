import { router, ifUrl, command } from "./backend/router/index.ts"
import { login, loginUser } from "./features/login/index.ts"
import { register, registerUser } from "./features/register/index.ts"
import home from "./features/home/index.html.ts"
import { toHTML } from "./backend/http.ts"

router
.get(ifUrl("/app"), toHTML(home))
.get(ifUrl("/login"), toHTML(login))
.post(ifUrl("/login"), toHTML(loginUser))
.get(ifUrl("/register"), toHTML(register))
.post(ifUrl("/register"), toHTML(registerUser))

export default router.run
