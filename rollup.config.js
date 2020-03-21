import resolve from "@rollup/plugin-node-resolve"
import typescript from "@rollup/plugin-typescript"

var external = ["./utils.js", "./utils/utils.js", "../utils/utils.js", "../../utils/utils.js", "../../../utils/utils.js",
   "./utils/template.js", "../utils/template.js", "../../utils/template.js", "../../../utils/template.js",
   "./utils/database.js", "../utils/database.js", "../../utils/database.js", "../../../utils/database.js",
   ]

const tscOptions = {
   module: "ES2015"
}

var pages = [
   "meal-plans"
].map(x => ({
   input: `./src/${x}/index.ts`,
   output: {
      file: `./public/${x}/index.js`,
      format: "esm"
   },
   plugins: [
      typescript(tscOptions),
      resolve()
   ],
   external
} ))

export default [{
  input: "./src/utils/utils.ts",
  output: {
    file: "./public/utils/utils.js",
    format: "esm"
  },
  plugins: [
     typescript(tscOptions),
     resolve()
  ]
}, {
   input: "./src/utils/template.ts",
   output: {
      file: "./public/utils/template.js",
      format: "esm"
   },
   plugins: [
      typescript(tscOptions),
      resolve()
   ]
}, {
   input: "./src/utils/database.ts",
   output: {
      file: "./public/utils/database.js",
      format: "esm"
   },
   plugins: [
      typescript(tscOptions),
      resolve()
   ]
}].concat(pages)
