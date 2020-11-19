import clean from "./clean-dir.ts"
import copy from "./copy-static.ts"
import cleanFile from "./remove-emptyExport.ts"

clean()
const copyTask = copy()

// will need to explore this some more Deno.run({cmd: ["tsc", "-w", "-p", `${Deno.cwd()}/tsconfig.json`]})
await copyTask.catch(x => console.error(`Copy error ${x}`))

const modifiedOrCreated = (event: Deno.FsEvent, callback: () => Promise<any>) => {
    if (event.kind === "create" || event.kind === "modify") {
        return callback()
    }
}

function isFile(str : string) {
    for (var i = str.length - 1; i >= 0; i--) {
        let s = str[i]
        if (s === ".") {
            return true
        } else if (s === "\\" || s === "/" ) {
            return false
        }
    }
    return false
}

async function SrcWatcher() {
    const srcWatcher = Deno.watchFs("./src", { recursive: true })
    for await (const event of srcWatcher) {
        const paths = event.paths.filter(isFile)
        await modifiedOrCreated(event, () => Promise.all(paths.map(copy)))
        ?.catch(x => console.error(`Source Watcher Error: ${x} <><> for file(s) ${paths.join("; ")}`))
    }
}

async function PublicWatcher() {
    const publicWatcher = Deno.watchFs("./public", { recursive: true })
    for await (const event of publicWatcher) {
        const paths = event.paths.filter(isFile)
        await modifiedOrCreated(event, () => Promise.all(paths.map(cleanFile)))
        ?.catch(x => console.error(`Public Watcher Error: ${x} <><> for file(s) ${paths.join("; ")}`))
    }
}

await Promise.all([SrcWatcher(), PublicWatcher()])
