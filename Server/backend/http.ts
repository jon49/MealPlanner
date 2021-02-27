import { BufReader } from "https://deno.land/std@0.82.0/io/bufio.ts"
import { HTML } from "./html.ts";
import { Context } from "./application.ts";
import { Cookie } from "https://deno.land/std@0.82.0/http/cookie.ts"

const encoder = new TextEncoder()

const toCookieHeader : (cookie: Cookie) => string =
    cookie => {
        const acc = [`${cookie.name}=${cookie.value}`]
        const pairs = Object.keys(cookie).reduce((acc, val) => {
            // @ts-ignore
            if (val !== "name" && val !== "value" && cookie[val]) {
                // @ts-ignore
                acc.push(`${val}=${cookie[val]}`)
            }
            return acc
        }, acc)
        return pairs.join(";")
    }

const setResponse : (ctx: Context) => void =
    ctx => {
        const headers1 = ctx.response.headers
        for (const cookie of ctx.response.cookies) {
            headers1["Set-Cookie"] = toCookieHeader(cookie)
        }
        const headers = new Headers(ctx.response.headers)
        ctx.respond({ body: ctx.response.body, headers })
    }

export const toHTML =
    (html: (ctx: Context) => Promise<HTML | void>) =>
    async (ctx: Context) => {
    var buffer = new Deno.Buffer()
    ctx.response.body = new BufReader(buffer)
    ctx.response.headers["Content-Type"] = "text/html; charset=utf-8"

    var h = await html(ctx)
    if (h) {
        setResponse(ctx)
        await h.start((item: string) => buffer.write(encoder.encode(item)))
    }
}

export const toJson =
    (ctx: Context) =>
    (data: any) => {
    ctx.response.headers["Content-Type"] = "application/json; charset=utf-8"
    ctx.response.body = JSON.stringify(data)
    setResponse(ctx)
}

export const redirect = (ctx: Context, url: string) => {
    ctx.response.headers.Location = url
    ctx.response.headers.Status = "302"
    setResponse(ctx)
}
