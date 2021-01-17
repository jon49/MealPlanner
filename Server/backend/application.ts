import { serve, ServerRequest } from "https://deno.land/std@0.82.0/http/server.ts"
import { Cookie } from "https://deno.land/std@0.82.0/http/cookie.ts"
import { BufReader } from "https://deno.land/std@0.82.0/io/bufio.ts"

export interface ContextResponse {
    body?: BufReader | string
    headers: Record<string, string>
    cookies: Cookie[] 
}

export interface Context<T = Record<string, object>> extends ServerRequest {
    response: ContextResponse
    uri: URL
    state: T | undefined
    data: any
}

interface ContextFunction<T> {
    (ctx: Context<T>): AsyncGenerator<"continue" | "break", any, any>
}

const cleanUrl = (url: string) : URL => {
    var uri = new URL("x:" + url)
    uri.pathname.endsWith("/")
    && uri.pathname.length !== 1
    && (uri.pathname = uri.pathname.slice(0, -1))
    return uri
}

const middleware : any[] = []

export class Application<T> {
    use(contextFunction: ContextFunction<T>) : Application<T> {
        middleware.push(contextFunction)
        return this
    }

    async _start(req: Context<T>) {
        var generators = Array(middleware.length)
        var i = 0
        for await (const f of middleware) {
            const gen = generators[i] = f(req); i++
            const result = await gen.next()
            if (result.value === "break") { break }
        }

        for await (const gen of generators.reverse()) {
            if (!gen || gen.done) continue
            await gen.next()
        }
    }

    async listen({ port }: { port: number }) {
        const server = serve({ port });
        for await (const req of server) {
            const app = new Application()
            const ctx = req as Context<T>
            ctx.uri = cleanUrl(req.url)
            ctx.response = { headers: {}, cookies: [] }
            app._start(ctx)
            .catch(() => req.respond({body: "Doh!"}))
        }
    }
}