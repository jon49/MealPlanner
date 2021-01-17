import { Application } from "./backend/application.ts"
import { getCookies, setCookie } from "https://deno.land/std@0.82.0/http/cookie.ts"
import { v4 } from "https://deno.land/std@0.82.0/uuid/mod.ts"
import { redirect } from "./backend/http.ts"
// import router from "./router.ts"

interface State {
  auth: string
  url: URL
}

const app = new Application()
//   {
//   keys: ["auth"]
// })

app.use(async function*(ctx) {
  const start = Date.now()
  yield "continue"
  const ms = Date.now() - start
  ctx.response.headers["X-Response-Time"] = `${ms}ms`
})

app.use(async function*(ctx) {
  ctx.response.headers["Cache-Control"] = "max-age=0"
})

app.use(async function*(ctx) {
  const cookies = getCookies(ctx)
  const userSession = cookies["user"]
  if (!userSession || ctx.uri.pathname !== "/login") {
    const now = new Date()
    const expires = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
    ctx.response.cookies.push({
      name: "user",
      value: v4.generate(),
      httpOnly: true,
      sameSite: "Strict",
      path: "/app",
      secure: true,
      expires
    })

    // TODO: save cookie value to db for later look up on restart of server makes sure to get
    // all cookies on start up

    redirect(ctx, "/login")

    yield "break"
  }
})

app.use(async function*(ctx) {
  // Run router
})

app.use(async function*(ctx) {
  ctx.respond({ body: "Yay! It worked!" })
})

const start = async () => await app.listen({ port: 4333 })

start()

// const port = 54321
// const server = serve({ port });
// const url = `http://localhost:${port}/`

// Deno.run({
//   cmd: ["explorer", url]
// })

// console.log(url)

// const start = async () => {
//   for await (const req of server) {
//     router(req)
//     .catch(x => {
//       console.error(x)
//       req.respond({body: "Doh!"})
//     })
//   }
// }

// start()
