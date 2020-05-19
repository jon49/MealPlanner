// @ts-check
import glob from "glob"
import { exec } from "child_process"

/**
 * @param {string} s 
 */
const ignore = s =>
    s.endsWith(".html.js")
        ? !s.startsWith("index")
    : false

/**
 * 
 * @param {string} s 
 */
const clean = s =>
    s
    .replace(".ts", ".js")
    .replace(".html.js", ".html")

glob("./src/app/**/!(layouts)/!(*.d.ts|*.spec.[jt]s)", (err, matches) => {
    if (err) {
        console.error(`Build Sources Error: ${err}`)
        return
    }

    const objects =
        matches
        .map(x => isFile(x) && toObj(x, ignore, clean))
        .filter(x => x)
    const filesObject =
        objects
        .reduce((acc, val) => mergeFileList(acc, val), {})
    const result =  JSON.stringify(filesObject)
    // console.log(JSON.stringify(filesObject, null, 4))
    exec(`sed -i '4s/.*/const files = ${result}/' ./src/app/sw.js`, (err, std, stderr) => {
        if (err) return console.error(err)
        if (stderr) return console.error(stderr)
        console.log("Updated files for service worker")
    })
})

/**
 * @param {string} name 
 */
const isFile = name =>
    name.lastIndexOf(".") > name.lastIndexOf("/")

/**
 * @param {string} path 
 * @param {(s: string) => boolean} ignore
 * @param {(s: string) => string} clean
 */
const toObj = (path, ignore, clean) => {
    const arr = path.split("/").slice(2)
    if (ignore(arr.slice(-1)[0])) return
    return arr.reduceRight((/** @type {*} */ acc, val) =>
        acc === void 0 ? {_files: [clean(val)]} : {[val]: acc}
    , void 0)
}

/**
 * @param {*} o 
 * @param {*} o2 
 */
const mergeFileList = (o, o2) => {
    /** @type {*} */
    let key = Object.keys(o2)[0]
    if (key === "_files") {
        if (key in o) {
            o[key] = o[key].concat(o2[key])
        } else {
            o[key] = o2[key]
        }
        return o
    } else if (!(key in o)) {
        o[key] = o2[key]
        return o
    } else {
        mergeFileList(o[key], o2[key])
    }
    return o
}
