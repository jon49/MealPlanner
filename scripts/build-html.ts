import getFiles from "https://deno.land/x/getfiles/mod.ts"
import { writeFileStr } from "https://deno.land/std/fs/write_file_str.ts"

const re = /index\.html\.js$/
const files = getFiles({
    root: "./src",
})
.filter(x => re.test(x.path))

const modules = await Promise.all(files.map(x => import(x.realPath).then(m => ({realPath: x.realPath, path: x.path, module: m}))))

for (const x of modules) {
    if (!("default" in x.module)) continue
    console.log(`Creating file ${x.path}`)
    const result = createFile(x.module.default, x.path.replace("src/", "/"))
    writeFileStr(x.realPath.replace("src", "public"), result)
    .then(() => console.log(`Finished creating file to ${x.path.replace("src", "public")}`))
    .catch(err => console.error("Could not write:", x.path, "\n", err))
}

function printExports(data: any[]) {
    const result = data.map(x => {
        const key = Object.keys(x)[0]
        const value =
            !x[key]
                ? ""
            : typeof x[key] === "string"
                ? `"${x[key].replace(/"/g, `\\"`)}"`
            : x[key].toString()
        return `"${key}":${value}`
    })
    .join(",")
    return `{${result}}`
}

function printData(data: any[]) {
    return data.map(x => {
        const key = Object.keys(x)[0]
        const value =
            !x[key]
                ? ""
            : typeof x[key] === "string"
                ? `\`${x[key].replace(/`/g, "\\`")}\``
            : x[key].toString()
        return `
            const ${key} = ${value};
        `.trim()
    }).join("")
}

function createFile(content: any, path: string) {
    // Args
    const exports = []
    const data = []
    for (const key of Object.keys(content)) {
        if (key.startsWith("$")) exports.push({ [key]: content[key] })
        else data.push({ [key]: content[key] })
    }
    return `
;(function() {
    ${printData(data)}
    self.M.template["${path}"] = ${printExports(exports)}
}());
    `.trim()
}
