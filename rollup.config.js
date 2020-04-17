import resolve from "@rollup/plugin-node-resolve"
import typescript from "@rollup/plugin-typescript"

var external = ["./utils.js", "./utils/utils.js", "../utils/utils.js", "../../utils/utils.js", "../../../utils/utils.js",
   "./utils/template.js", "../utils/template.js", "../../utils/template.js", "../../../utils/template.js",
   "./utils/database.js", "../utils/database.js", "../../utils/database.js", "../../../utils/database.js",
   "./fp.js", "./utils/fp.js", "../utils/fp.js", "../../utils/fp.js", "../../../utils/fp.js",
   "./utils/common-domain-types.js", "../utils/common-domain-types.js", "../../utils/common-domain-types.js", "../../../utils/common-domain-types.js",
   ]

const tscOptions = {
   module: "ES2015"
}

var pages = [
   "app/meal-plans/edit",
   "app/meal-plans/edit/search",
   "app/meals/add"
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
  input: "./src/app/utils/utils.ts",
  output: {
    file: "./public/app/utils/utils.js",
    format: "esm"
  },
  plugins: [
     typescript(tscOptions),
     resolve()
  ]
}, {
   input: "./src/app/utils/template.ts",
   output: {
      file: "./public/app/utils/template.js",
      format: "esm"
   },
   plugins: [
      typescript(tscOptions),
      resolve()
   ]
}, {
   input: "./src/app/utils/database.ts",
   output: {
      file: "./public/app/utils/database.js",
      format: "esm"
   },
   plugins: [
      typescript(tscOptions),
      resolve()
   ]
}, {
   input: "./src/app/utils/common-domain-types.ts",
   output: {
      file: "./public/app/utils/common-domain-types.js",
      format: "esm"
   },
   plugins: [
      typescript(tscOptions),
      resolve()
   ],
   external
}, {
   input: "./src/app/utils/fp.ts",
   output: {
      file: "./public/app/utils/fp.js",
      format: "esm"
   },
   plugins: [
      typescript(tscOptions),
      resolve()
   ]
}].concat(pages)
