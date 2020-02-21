import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import typescript from "@rollup/plugin-typescript"

var pages = [
   "plan-meals"
].map(x => [{
   input: `./src/${x}/index.ts`,
   output: {
      file: `./build/${x}/index.js`,
      format: "esm"
   },
   plugins: [
      typescript()
   ],
   external: ["./utils.js", "./utils/utils.js", "../utils/utils.js", "../../utils/utils.js", "../../../utils/utils.js",
   "./utils/template.js", "../utils/template.js", "../../utils/template.js", "../../../utils/template.js",
   "./utils/database.js", "../utils/database.js", "../../utils/database.js", "../../../utils/database.js",
   ]
}, {
   input: `./src/${x}/index.html.ts`,
   output: {
      dir: `./temp/${x}`,
      format: "esm"
   },
   plugins: [
      typescript()
   ]
}
])
.flat()

export default [{
  input: "./src/utils/utils.ts",
  output: {
    file: "./build/utils/utils.js",
    format: "esm"
  },
  plugins: [
     typescript(),
     resolve(),
     commonjs()
  ]
}, {
   input: "./src/utils/template.ts",
   output: {
      file: "./build/utils/template.js",
      format: "esm"
   },
   plugins: [
      typescript(),
      resolve()
   ]
}, {
   input: "./src/utils/database.ts",
   output: {
      file: "./build/utils/database.js",
      format: "esm"
   },
   plugins: [
      typescript(),
      resolve()
   ],
   external: ["./utils.js"]
}, {
   input: "./src/index.html.ts",
   output: {
      dir: `./temp`,
      format: "esm"
   },
   plugins: [
      typescript()
   ]
}].concat(pages)
