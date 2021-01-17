import { emptyDirSync } from "https://deno.land/std/fs/mod.ts"

function clean() { emptyDirSync("./public") }

clean()

export default clean
