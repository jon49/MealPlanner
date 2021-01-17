import { ServerRequest } from "https://deno.land/std@0.82.0/http/server.ts"
import { Context } from "../application.ts"
import staticHandler from "./static-handler.ts"

type Method = "POST" | "GET" | "PATCH" | "DELETE"

type Handler = (req: RouteRequest) => Promise<void>
type Guard = (req: Context<Record<string, object>>) => boolean

interface RouteInternal {
    method : Method
    guard: Guard
    handler: Handler
}

export interface RouteRequest extends ServerRequest {
    uri: URL
    data: any
}

const routeList : RouteInternal[] = []

interface RouteHandler {
    (guard: Guard, handler: Handler) : Router
}

interface Router {
    post: RouteHandler
    get: RouteHandler
    patch: RouteHandler
    delete: RouteHandler
    run: (req: Context<Record<string, object>>) => Promise<void>
    static: (staticDir: string) => Router
}

function createRoute(method: Method, guard: Guard, handler: Handler) {
    routeList.push({
        guard,
        method,
        handler,
    })
}

function createStaticRoute(staticDir: string) {
    routeList.push({
        // Just need to check for the last slash since the clean URL adds a
        // slash if it is not a file
        guard: req => !req.uri.pathname.endsWith("/"),
        handler: req => staticHandler(req, staticDir),
        method: "GET",
    })
}

const parseParams = (params: URLSearchParams | undefined) => {
    const obj : any = {};
    if (!params) return obj
    // iterate over all keys
    for (const key of (<Set<string>>new Set((<any>params).keys()))) {
        if (params.getAll(key).length > 1) {
            obj[decodeURIComponent(key)] = params.getAll(key).map(decodeURIComponent)
        } else {
            var val = params.get(key)
            obj[decodeURIComponent(key)] = val ? decodeURIComponent(val) : val
        }
    }
    return obj;
}

const run = async (ctx: Context<Record<string, object>>) => {
    var contentType
    var data

    if ("GET" === ctx.method) {
        data = parseParams(ctx.uri.searchParams)
    }

    if ((["POST", "DELETE", "POST"] as Method[]).includes(ctx.method as Method)
        && (contentType = ctx.headers.get("content-type"))) {
        const decoder = new TextDecoder()
        const body = decoder.decode(await Deno.readAll(ctx.body))
        if (body.length > 0) {
            if (contentType.includes("application/json")) {
                data = JSON.parse(body)
            } else if (contentType.includes("application/x-www-form-urlencoded")) {
                data = parseParams(new URLSearchParams(body))
            } else {
                console.error(`The content type "${contentType}" is not accounted for.`)
            }
        }
    }

    ctx.data = data

    // const debug = (x: RouteInternal) =>
    //     console.log(
    //         "  Method:", x.method, x.method === req.method,
    //         "\n  Route:", x.route, x.route?.test(url),
    //         "\n  Guard:", x.guard, x.guard && x.guard(request),
    //         "\n  Exec:", url, x.route?.exec(url))

    const route = routeList.find(x => x.method === ctx.method && x.guard(ctx))

    if (route) {
        route.handler(ctx)
        .catch(x => ctx.respond({body: `<h1>Oops! Something happened that shouldn't have!</h1><p>${JSON.stringify(x)}</p>`}))
    } else {
        ctx.respond({ body: "<h1>Not found!<h1>" })
    }
}

export const ifUrl =
    (route: string) =>
    (ctx: Context<Record<string, object>>) =>
        ctx.uri.pathname === route

export const command =
    (route: string, cmd: string) =>
    (ctx: Context<Record<string, object>>) =>
        ctx.uri.pathname === route && ctx.uri.searchParams.get("cmd") === cmd

export const router : Router = {
    post: (guard: Guard, handler: Handler) => (createRoute("POST", guard, handler), router),
    get: (guard: Guard, handler: Handler) => (createRoute("GET", guard, handler), router),
    patch: (guard: Guard, handler: Handler) => (createRoute("PATCH", guard, handler), router),
    delete: (guard: Guard, handler: Handler) => (createRoute("DELETE", guard, handler), router),
    static: (staticDir: string) => (createStaticRoute(staticDir), router),
    run,
}
