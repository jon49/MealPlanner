// deno run --allow-write --allow-read --allow-run --unstable .\scripts\install.ts

const installBuildTask = Deno.run({cmd: ["deno", "install", "--root", ".", "-f", "--allow-write", "--allow-read", "--unstable", "./scripts/build.ts"]})


const writeFileTask = Deno.writeTextFile("./bin/start-typescript.cmd", `tsc -w -p ./tsconfig.json`)

await Promise.all([installBuildTask, writeFileTask])

export {}
