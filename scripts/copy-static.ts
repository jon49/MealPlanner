import { ensureDir, copy } from "https://deno.land/std/fs/mod.ts"
import getFiles, { FileInfo } from "https://deno.land/x/getfiles/mod.ts"
import { dirname } from "https://deno.land/std@0.77.0/path/mod.ts"

async function copyNow(info: FileInfo & {dir: string}) {
    const [toDir, toFile] = [info.dir, info.realPath].map(x => x.replace("src", "public"))
    console.log(`Copying ${info.realPath}`)
    await ensureDir(toDir)
    await copy(info.realPath, toFile, { overwrite: true })
}
const extensions = ["css", "svg", "html", "ico"]
async function copyFile(filename: string | undefined = undefined) {
    if (filename) {
        if (extensions.findIndex(x => filename.endsWith(x)) > -1) {
            await Deno.copyFile(filename, "./public")
            return
        } else {
            return
        }
    }
    const files =
        getFiles({ root: "./src" })
        .filter(x => extensions.indexOf(x.ext) > -1)
        .map(x => ({ ...x, dir: dirname(x.realPath) }))
        .map(copyNow)
        .map(x => x.catch(x => console.error(x)))
    return Promise.all(files)
}

await copyFile()

export default copyFile
