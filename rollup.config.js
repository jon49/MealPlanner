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
   external: ["../utils/utils.js", "../../utils/utils.js"]
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
   input: "./src/index.html.ts",
   output: {
      dir: `./temp`,
      format: "esm"
   },
   plugins: [
      typescript()
   ]
}].concat(pages)
