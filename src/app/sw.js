// @ts-check

import { ClientRequest } from "http"

const CACHE_NAME = 'meal-planner-v1'
const SW_VERSION = "v1" 

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
    console.log(`Service worker version '${SW_VERSION}' activated. Cache version '${CACHE_NAME}'.`)
    event.waitUntil(removeCaches(event))
}

/**
 * @param {ExtendableEvent} event 
 */
async function removeCaches(event) {
    const keys = await caches.keys()
    return Promise.all(keys.filter(x => x !== CACHE_NAME).map(x => caches.delete(x)))
}

/**
 * @param {string} url 
 * @returns string
 */
function normalizeUrl(url) {
    let newUrl = url.includes("?") ? url.substring(0, url.lastIndexOf("?")) : url
    newUrl = newUrl.includes("#") ? url.substring(0, url.lastIndexOf("#")) : newUrl
    newUrl = !newUrl.endsWith("/") && newUrl.lastIndexOf("/") > newUrl.lastIndexOf(".") ? newUrl + "/" : newUrl
    return newUrl
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
async function getResponse(event) {
    const url = normalizeUrl(event.request.url)
    if (url.endsWith("sw.js")) return fetch(event.request)
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
 * @param {InstallEvent} e 
 */
function installHandler(e) {
    // Perform install steps
    console.log(`Installing version '${SW_VERSION}' service worker.`)
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
