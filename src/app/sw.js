// @ts-check

const CACHE_NAME = 'meal-planner-v6'
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
    if (url.endsWith("/") && url !== "/app/") {
        return htmlFragment(url)
    }
    return cacheResponse(url, event)
}

/**
 * @param {string} url
 * @param {{ request: string | Request; }} [event]
 */
async function cacheResponse(url, event) {
    const match = await caches.match(url)
    if (match) return match
    const res = await fetch(event?.request || url)
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
 * @param {TextEncoder} encoder
 */
const append =
    (controller, encoder) =>
    /** @param {*} item */
    async item => {
        if (!item) return
        if (typeof item === "string") {
            controller.enqueue(encoder.encode(item))
        } else if (item instanceof Promise) {
            const result = await item
            if (result) controller.enqueue(encoder.encode(result))
        }
    }

/**
 * @param {string} templateUrl
 * @param {string} contentUrl
 */
async function streamResponse(contentUrl, templateUrl) {
    console.log(`Loading ${contentUrl} and ${templateUrl}`)
    const js =
        [templateUrl, contentUrl]
        // @ts-ignore
        .filter(x => !self.M.template[x])
        .map(x => cacheResponse(x))
    // @ts-ignore
    if (!self.DB || !self.M.html) js.push(...["/app/utils/database.js", "/app/utils/html-template-tag.js"].map(x => cacheResponse(x)))
    const templates = await Promise.all(js)
    for (const template of templates) {
        const jsText = await template.text()
        if (jsText && jsText[0] !== "<") {
            eval(jsText)
        } else {
            console.error(`Could not parse ${template.url}. Text: ${jsText}`)
        }
    }
    /** @type {any[]} */
    // @ts-ignore
    const template = self.M.template[templateUrl]
    /** @type {any} */
    // @ts-ignore
    const content = self.M.template[contentUrl]

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
        async start(controller) {
            const allContent = preFetchTemplate(template, content)
            const send = append(controller, encoder)
            for (const item of allContent) {
                await send(item)
            }
            controller.close()
        }
    })

    return new Response(stream, { headers: { "content-type": "text/html; charset=utf-8" }})
}

/**
 * @param {any[]} template
 * @param {{ [x: string]: any; }} content
 */
function preFetchTemplate(template, content) {
    const allContent = []
    for (const segment of template) {
        getTemplate(segment, content, allContent)
    }
    return allContent
}

/**
 * @param {{ (): any; [x: string]: any; }} val
 * @param {{ [x: string]: any; }} [content]
 * @param {any[]} [allContent]
 */
function getTemplate(val, content, allContent) {
    if (!val) return
    if (typeof val === "string") {
        allContent.push(val)
    } else if (typeof val === "function") {
        allContent.push(val())
    } else {
        const key = Object.keys(val)[0]
        getTemplate(val[key], void 0, allContent)
        if (content && key in content) {
            getTemplate(content[key], void 0, allContent)
        }
    }
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
