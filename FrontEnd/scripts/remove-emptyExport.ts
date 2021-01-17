async function cleanFile(filename: string) {
    const file = await Deno.open(filename, { write: true, read: true })
    const n = await file.seek(-12, Deno.SeekMode.End)
    const u = new Uint8Array(12)
    await file.read(u)
    if (u.join(" ") === "101 120 112 111 114 116 32 123 125 59 13 10") {
        file.close()
        await Deno.truncate(filename, n)
        console.log(`Truncated file ${filename}`)
    } else {
        file.close()
    }
}

let arg
if (arg = Deno.args[0]) {
    await cleanFile(arg)
}

export default cleanFile
