const CACHE_NAME = 'meal-planner-v5'
const loadedFiles: any = {}

// @ts-ignore
self.addEventListener("install", installHandler)
// @ts-ignore
self.addEventListener("fetch", fetchHandler)
// @ts-ignore
self.addEventListener("activate", activateHandler)

function activateHandler(event: ExtendableEvent) {
    self.clients.claim()
    console.log(`Service worker activated. Cache version '${CACHE_NAME}'.`)
    event.waitUntil(removeCaches(event))
}

async function removeCaches(_: ExtendableEvent) {
    const keys = await caches.keys()
    return Promise.all(keys.filter(x => x !== CACHE_NAME && x.startsWith("meal-planner")).map(x => caches.delete(x)))
}

function normalizeUrl(url : string) {
    let path = new URL(url).pathname
    !path.endsWith("/") && (path = path.lastIndexOf("/") > path.lastIndexOf(".") ? path+"/" : path)
    return path
}

const getHtmlJsUrl = (url: string) => `${url}index.html.js`

function fetchHandler(event: FetchEvent) {
    event.respondWith(getResponse(event).then(x => x.res).catch(x => console.error(x)))
}

async function loadJavascript(...files : string[]) {
    const jsFilesTask = files
        .filter(x => !loadedFiles[x])
        .map(x => cacheResponse(x))
    const jsFiles = await Promise.all(jsFilesTask)
    for (const x of jsFiles) {
        const jsText = await x.res.text()
        if (jsText) {
            loadedFiles[x.url] = await eval(jsText)
        } else {
            console.error(`Could not parse ${x.url}. Text: ${jsText}`)
        }
    }
}

var staticFiles : any = {
    DB: "/app/utils/database.js",
    html: "/app/utils/html-template-tag.js"
}
export type Load = typeof load
async function load(...files : string[]) {
    await loadJavascript(...(files.map(x => staticFiles[x] || x)));
    return <any>files.map(x => loadedFiles[staticFiles[x] || x])
}

async function getResponse(event: FetchEvent) : Promise<CacheResponse> {
    const req = event.request
    const url = normalizeUrl(req.url)
    if (req.method == "POST") return await handlePost(url, req)
    if (url.endsWith("sw.js")) return { url, res: await fetch(event.request) }
    if (url.endsWith("/") && url !== "/app/") {
        return htmlFragment(url)
    }
    return cacheResponse(url, event)
}

async function handlePost(url: string, req: Request) : Promise<CacheResponse> {
    url = getHtmlJsUrl(url)
    const data = await req.formData()
    if (data.has("cmd")) {
        var js = (await load(url))[0]
        var cmd = <string>data.get("cmd")
        // @ts-ignore
        var command : any
        if ((command = js?.command) && (command = command[cmd])) {
            var result = command(req, data)
            return { url, res: result }
        } else {
            console.error(`Could not find command "${cmd}" for file "${url}"`)
        }
    }
    return { url, res: new Response("doh!", { headers: { "content-type": "text/html" } }) }
}

interface CacheResponse {
    url: string
    res: Response 
}

async function cacheResponse(url: string, event?: { request: string | Request }) : Promise<CacheResponse> {
    const match = await caches.match(url)
    if (match) return { url, res: match }
    const res = await fetch(event?.request || url)
    if (!res || res.status !== 200 || res.type !== "basic") return { url, res }
    const responseToCache = res.clone()
    const cache = await caches.open(CACHE_NAME)
    cache.put(url, responseToCache)
    return { url, res }
}

async function htmlFragment(url: string) : Promise<CacheResponse> {
    const jsPage = getHtmlJsUrl(url)
    const stream = await streamResponse(jsPage)
    if (stream) return { url, res: stream }
    return cacheResponse(url, {request: url})
}

async function streamResponse(url: string) {
    console.log(`Loading ${url}`)
    const template = await load(url)
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
        async start(controller : ReadableStreamDefaultController<any>) {
            const send = (item: string) => controller.enqueue(encoder.encode(item))
            await template[0].render().start((x: any) => send(x))
                  .catch((x: any) => console.error(x))
            controller.close()
        }
    })

    return new Response(stream, { headers: { "content-type": "text/html; charset=utf-8" }})
}

function installHandler(e: InstallEvent) {
    console.log(`Installing version '${CACHE_NAME}' service worker.`)
    e.waitUntil(
        caches.open(CACHE_NAME)
        .then(function(cache) {
            const links = createLinks("", { "app": { "_files": [ "index.css", "form.css", "index.html", "index.js" ] } })
            return cache.addAll(links)
        })
    )
}

function createLinks(root: string, links: {[K: string]: any, _files?: string[]}, files: string[] = []) {
    if (links._files) {
        links._files.forEach(x => {
            if (!files) throw `Files must be an array but got '${files}'`
            if (x === "index.html") {
                files.push(`${root}/`)
            } else {
                files.push(`${root}/${x}`)
            }
        })
    }
    for (const link of Object.keys(links)) {
        if (link !== "_files") {
            createLinks(`${root}/${link}`, links[link], files)
        }
    }
    return files || []
}
