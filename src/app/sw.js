// @ts-check

var CACHE_NAME = 'meal-planner-v1'
var urlsToCache = createLinks("/app", {
    _files: [ "form.css", "index.css", "index.html", "index.js" ],
    utils: {
        _files:
        [ "common-domain-types.js"
        , "form-tabs.js"
        , "fuzzy-search.js"
        , "template.js"
        , "database.js"
        , "fp.js"
        , "snack-bar.js"
        , "utils.js" ]},
    meals: { add: { _files: ["index.html", "index.js"] } },
    "meal-plans":
        { _files: ["index.html", "index.js"]
        , search: { _files: ["index.html", "index.js"]} },
}).concat("/images/meal-planner-logo.svg")

self.addEventListener("install", installHandler)
self.addEventListener("fetch", fetchHandler)

/**
 * @param {FetchEvent} event 
 */
function fetchHandler(event) {
    event.respondWith(
        caches
        .match(event.request)
        .then(function (response) {
            // Cache hit - return response
            if (response) {
                return response
            }
            return fetch(event.request)
        }))
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
 * @param {*} links
 * @param {?string[]} files
 */
function createLinks(root, links, files = []) {
    if (links._files) {
        links._files.forEach(x => { files.push(`${root}/${x}`) })
    }
    for (const link of Object.keys(links)) {
        if (link !== "_files") {
            createLinks(`${root}/${link}`, links[link], files)
        }
    }
    return files
}
