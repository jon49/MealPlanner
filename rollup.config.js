import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"

var pages = [
   "plan-meals"
].map(x => [{
   input: `./build/${x}/index.js`,
   output: {
      file: `./public/${x}/index.js`,
      format: "esm"
   },
   external: ["./utils.js", "./utils/utils.js", "../utils/utils.js", "../../utils/utils.js", "../../../utils/utils.js",
   "./utils/template.js", "../utils/template.js", "../../utils/template.js", "../../../utils/template.js",
   "./utils/database.js", "../utils/database.js", "../../utils/database.js", "../../../utils/database.js",
   ]
}, {
   input: `./build/${x}/index.html.js`,
   output: {
      file: `./build/${x}/__index.html.js`,
      format: "cjs"
   }
} ])
.flat()

export default [{
  input: "./build/utils/utils.js",
  output: {
    file: "./public/utils/utils.js",
    format: "esm"
  },
  plugins: [
     resolve(),
     commonjs()
  ]
}, {
   input: "./build/utils/template.js",
   output: {
      file: "./public/utils/template.js",
      format: "esm"
   },
   plugins: [
      resolve()
   ]
}, {
   input: "./build/utils/database.js",
   output: {
      file: "./public/utils/database.js",
      format: "esm"
   },
   plugins: [
      resolve()
   ],
   external: ["./utils.js"]
}, {
   input: "./build/index.html.js",
   output: {
      file: "./build/__index.html.js",
      format: "cjs"
   }
} ].concat(pages)
