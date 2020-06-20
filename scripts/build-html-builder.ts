import getFiles from "https://deno.land/x/getfiles/mod.ts"
import { writeFileStr } from "https://deno.land/std/fs/write_file_str.ts"

const re = /\.builder\.html\.js$/
const files = getFiles({
    root: "./src",
})
.filter(x => re.test(x.path))

const modules = await Promise.all(files.map(x => import(x.realPath).then(m => ({fileInfo: x, module: m}))))

for (const x of modules) {
    if (!("default" in x.module)) continue
    // tsc overwrites my files so I have to overwrite tsc :-(
    // const [sourceInfo, publicInfo] =
    //     await Promise
    //     .all([Deno.stat(x.fileInfo.realPath), Deno.stat(x.fileInfo.realPath.replace("src", "public"))])
    //     .catch(x => [undefined, undefined])
    // if (sourceInfo?.mtime && publicInfo?.mtime && sourceInfo.mtime < publicInfo.mtime) continue
    const result = createFile(x.module.default, x.fileInfo.path.replace("src/", "/"))
    writeFileStr(x.fileInfo.realPath.replace("src", "public"), result)
    .then(() => console.log(`Finished creating file to ${x.fileInfo.path.replace("src", "public")}`))
    .catch(err => console.error("Could not write:", x.fileInfo.path, "\n", err))
}

function createFile(module: any[], path: string) {
    let body = `;(function() {self.M.template["${path}"] = [`
    const items = []
    for (var m of module) {
        if (!m) continue
        if (typeof m === "string") {
            items.push(JSON.stringify(m))
            continue
        }
        const key = Object.keys(m)[0]
        if (typeof m[key] === "function") {
            items.push(`{"${key}":${m[key].toString()}}`)
        } else {
            items.push(JSON.stringify(m))
        }
    }
    body += items.join(",") + "]}());"
    return body
}
