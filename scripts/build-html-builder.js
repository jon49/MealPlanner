import glob from "glob"
import fs from "fs"
import cp from "child_process"
import util from "util"
import path from "path"

const stat = util.promisify(fs.stat)
const execFile = cp.execFile

var cwd = process.cwd()

glob("./src/**/*.builder.html.js", (err, matches) => {
    if (err) {
        console.error(err)
        return
    }
    for (var filename of matches) {
        console.log("Building builder HTML files.", filename)
        GenerateHTML(filename)
    }
})

async function GenerateHTML(filename) {
    const clean = filename
        .replace(/\.\/src/, "public")
    var full = path.join(cwd, filename)
    const targetInfo = await stat(clean).catch(() => ({mtime: new Date(1970, 0, 1)}))
    const sourceInfo = await stat(full)
    if (sourceInfo.mtime > targetInfo.mtime) {
        execFile("node", [full], (error, stdout, stderr) => {
            if (error) {
                throw error
            }
            console.log(`Writing file: ${clean}`)
            fs.writeFile(clean, stdout, (err) => {
                if (err) console.log(err)
                console.log(`Finished writing file: ${clean}`)
            })
        })
    } else {
        console.log(`The file is already the latest. '${clean}'`)
    }
}
