// @ts-check

// GENERATED FILE LOCATIONS ON LINE 4 DO NOT MOVE!!!!
const files = {"app":{"meal-plans":{"edit":{"_files":["index.html","index.js","temp-meal-store.js"],"search":{"_files":["index.html","index.js","store.js"]},"store":{"_files":["store.js"]},"templates":{"_files":["cancelled-recipe.js","recipe.js"]},"util":{"_files":["util.js"]}}},"meals":{"add":{"_files":["index.html","index.js","store.js"]}},"settings":{"_files":["index.html","index.js"]},"utils":{"_files":["common-domain-types.js","database.js","form-tabs.js","fuzzy-search.js","idb.js","ISODate.js","snack-bar.js","template.js","utils.js"]}}}

var CACHE_NAME = 'meal-planner-v1'
var urlsToCache = createLinks("", files).concat("/images/meal-planner-logo.svg")

// @ts-ignore
self.addEventListener("install", installHandler)
// @ts-ignore
self.addEventListener("fetch", fetchHandler)

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
    const url = normalizeUrl(event.request.url)
    event.respondWith(
        caches
        .match(url)
        .then(res => res ? res : fetch(event.request)))
}  

/**
 * @param {InstallEvent} e 
 */
function installHandler(e) {
    // Perform install steps
    e.waitUntil(
        caches.open(CACHE_NAME)
        .then(function(cache) {
            console.log('Opened cache')
            return cache.addAll(urlsToCache)
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
                files.push(root + "/")
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
