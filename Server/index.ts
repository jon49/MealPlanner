import { Application } from "./backend/application.ts"
import { getCookies } from "https://deno.land/std@0.82.0/http/cookie.ts"
import { redirect } from "./backend/http.ts"
import router from "./router.ts"
import { SessionUser } from "./features/shared/types.d.ts"

const app = new Application()

app.use(async function*(ctx) {
  const start = Date.now()
  yield "continue"
  const ms = Date.now() - start
  ctx.response.headers["X-Response-Time"] = `${ms}ms`
})

app.use(async function*(ctx) {
  ctx.response.headers["Cache-Control"] = "max-age=0"
})

const states : Record<string, any> = {}
app.use(async function*(ctx) {
  const cookies = getCookies(ctx)
  const userSession = cookies["user"]
  let session : SessionUser | undefined = void 0
  if (!userSession) {
    const response = await fetch("http://localhost:55665", {
      method: "POST",
      headers: new Headers({
        "Content-Length": "0",
        "Content-Type": "application/json",
        body: ""
      })
    })
    if (response.ok) {
      session = JSON.parse(await response.json())
      if (session?.id) {
        const s = { session }
        states[session.id] = s
        ctx.state = s
      }
    }
  } else {
    const state = states[userSession]
    if (session) {
      ctx.state = { }
    }
  }

  const now = new Date((session?.expiration || 0) * 1e3)
  const expires = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
  ctx.response.cookies.push({
    name: "user",
    value: session?.id || "",
    httpOnly: true,
    sameSite: "Strict",
    path: "/",
    secure: true,
    expires
  })

  if (!session?.isLoggedIn && !(ctx.uri.pathname === "/login" || ctx.uri.pathname === "/register")) {
    redirect(ctx, "/login")
    yield "break"
  }

})

app.use(async function*(ctx) {
  await router(ctx)
  yield "break"
})

app.use(async function*(ctx) {
  ctx.respond({ body: "Yay! It worked!" })
})

const start = async () => await app.listen({ port: 4333 })

start()
