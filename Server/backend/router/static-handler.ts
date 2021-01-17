import { RouteRequest } from "./index.ts"
import { exists } from "https://deno.land/std/fs/mod.ts"

const encoder = new TextEncoder()
const mediaTypes: Record<string, string> = {
  ".md": "text/markdown",
  ".html": "text/html",
  ".htm": "text/html",
  ".json": "application/json",
  ".map": "application/json",
  ".txt": "text/plain",
  ".ts": "text/typescript",
  ".tsx": "text/tsx",
  ".js": "application/javascript",
  ".jsx": "text/jsx",
  ".gz": "application/gzip",
  ".css": "text/css",
  ".wasm": "application/wasm",
  ".mjs": "application/javascript",
}

const cwd = Deno.cwd()
export default async function getStatic(req: RouteRequest, staticDir: string) {
    const path = req.uri.pathname

    var ext = path.slice(path.lastIndexOf(".") - path.length)
    var filePath = `${cwd}/${staticDir}${req.uri.pathname}`

    if (!(await exists(filePath))) return Promise.reject("File not found")
    const [body, fileInfo] = await Promise.all([ Deno.open(filePath), Deno.stat(filePath) ])

    const headers = new Headers()
    headers.set("content-length", fileInfo.size.toString())

    const contentTypeValue = mediaTypes[ext]
    if (contentTypeValue) {
        headers.set("content-type", contentTypeValue + "; charset=utf-8")
    }

    req.done.then(() => {
        body.close()
    })

    req.respond({ body, headers, status: 200 })
}
