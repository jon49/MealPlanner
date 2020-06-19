// @ts-check

const CACHE_NAME = 'meal-planner-v4'
// @ts-ignore
if (!self.M) self.M = {}
// @ts-ignore
if (!self.M.template) self.M.template = {}

// @ts-ignore
self.addEventListener("install", installHandler)
// @ts-ignore
self.addEventListener("fetch", fetchHandler)
// @ts-ignore
self.addEventListener("activate", activateHandler)

/**
 * @param {ExtendableEvent} event 
 */
function activateHandler(event) {
    self.clients.claim()
    console.log(`Service worker activated. Cache version '${CACHE_NAME}'.`)
    event.waitUntil(removeCaches(event))
}

/**
 * @param {ExtendableEvent} event 
 */
async function removeCaches(event) {
    const keys = await caches.keys()
    return Promise.all(keys.filter(x => x !== CACHE_NAME && x.startsWith("meal-planner")).map(x => caches.delete(x)))
}

/**
 * @param {string} url 
 * @returns {string}
 */
function normalizeUrl(url) {
    let path = new URL(url).pathname
    !path.endsWith("/") && (path = path.lastIndexOf("/") > path.lastIndexOf(".") ? path+"/" : path)
    return path
}

/**
 * @param {FetchEvent} event 
 */
function fetchHandler(event) {
    event.respondWith(getResponse(event))
}

/**
 * @param {FetchEvent} event 
 */
function getResponse(event) {
    const url = normalizeUrl(event.request.url)
    if (url.endsWith("sw.js")) return fetch(event.request)
    if (url.endsWith("/")) {
        return htmlFragment(url)
    }
    return cacheResponse(url, event)
}

/**
 * @param {string} url
 * @param {{ request: string | Request; }} event
 */
async function cacheResponse(url, event) {
    const match = await caches.match(url)
    if (match) return match
    const res = await fetch(event.request)
    if (!res || res.status !== 200 || res.type !== "basic") return res
    const responseToCache = res.clone()
    const cache = await caches.open(CACHE_NAME)
    cache.put(url, responseToCache)
    return res
}

/**
 * @param {string} url
 */
async function htmlFragment(url) {
    const jsPage = `${url}index.html.js`
    const templateURL = "/app/layouts/_default.builder.html.js"
    const stream = streamResponse(jsPage, templateURL)
    if (stream) return stream.catch(e => { console.error(e); return cacheResponse(url, {request: url}) })
    return cacheResponse(url, {request: url})
}

/**
 * @param {{ enqueue: (arg0: any) => void; }} controller
 */
const append =
    controller =>
    /** @param {*} item */
    async item => {
        if (!item) return
        if (typeof item === "string") {
            controller.enqueue(item)
        } else if (isAsyncFunction(item)) {
            const result = await item()
            if (result) controller.enqueue(result)
        } else if (typeof item === "function") {
            const result = item()
            if (result) controller.enqueue(result)
        }
    }

/**
 * @param {string} html
 * @param {any} val
 * @returns {Promise<string>}
 */
const appendString =
    (html, val) =>
        !val
            ? Promise.resolve(html)
        : typeof val === "string"
            ? Promise.resolve(html += val)
        : isAsyncFunction(val)
            ? val().then(/** @param {string} x */x => (x ? html += x : html))
        : typeof val === "function"
            ? Promise.resolve(((val = val(), val instanceof Promise) ? val : Promise.resolve(val)).then(x => x ? html += x : html))
        : Promise.resolve(html)

/**
 * @param {string} templateUrl
 * @param {string} contentUrl
 */
async function streamResponse(contentUrl, templateUrl) {
    console.log(`Loading ${contentUrl} and ${templateUrl}`)
    // @ts-ignore
    const js = [templateUrl, contentUrl].filter(x => !self.M.template[x]).map(x => fetch(x))
    // @ts-ignore
    if (!self.DB || !self.M.html) js.push(...[fetch("/app/utils/database.js"), fetch("/app/utils/html-template-tag.js")])
    const templates = await Promise.all(js)
    for (const template of templates) {
        eval(await template.text())
    }
    /** @type {any[]} */
    // @ts-ignore
    const template = self.M.template[templateUrl]
    /** @type {any} */
    // @ts-ignore
    const content = self.M.template[contentUrl]
    // const stream = new ReadableStream({
    //     async start(controller) {
    //         const send = append(controller)
    //         /**
    //          * @param {number} idx
    //          */
    //         async function push(idx) {
    //             if (idx === template.length) {
    //                 controller.close()
    //                 return
    //             }
    //             console.log(`${idx+1} of ${template.length}`)
    //             const val = template[idx]
    //             if (!val) {
    //                 return push(++idx)
    //             } else if (typeof val === "string") {
    //                 controller.enqueue(val)
    //                 push(++idx)
    //             } else {
    //                 const key = Object.keys(val)[0]
    //                 await send(val[key])
    //                 if (key in content) await send(content[key])
    //                 push(++idx)
    //             }
    //         }
    //         push(0)
    //     }
    // })

    let html = ""
    for (const val of template) {
        if (!val) {
            continue
        } else if (typeof val === "string") {
            html += val
        } else {
            const key = Object.keys(val)[0]
            html = await appendString(html, val[key])
            html = await appendString(html, content[key])
        }
    }

    return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" }})
}

/**
 * @param {*} f
 */
function isAsyncFunction(f) {
    return typeof f === "function" && f[Symbol.toStringTag] === "AsyncFunction"
}

/**
 * @param {InstallEvent} e 
 */
function installHandler(e) {
    console.log(`Installing version '${CACHE_NAME}' service worker.`)
    e.waitUntil(
        caches.open(CACHE_NAME)
        .then(function(cache) {
            const links = createLinks("", { "app": { "_files": [ "index.css", "form.css", "index.html", "index.js" ] } })
            return cache.addAll(links)
        })
    )
}

/**
 * @param {string} root
 * @param {{[K: string]: any, _files?: string[]}} links
 * @param {?string[]} files
 * @returns {string[]}
 */
function createLinks(root, links, files = []) {
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
