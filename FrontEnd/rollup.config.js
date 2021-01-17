import resolve from "@rollup/plugin-node-resolve"
import sucrase from "@rollup/plugin-sucrase"

// Use this with rollup to generate the type definitions
// npx tsc -d -m ES2020 --outDir ./src/app/utils/ ./external/*.ts

const resolve1 = () => resolve({ extensions: ['.js', '.ts'] })
const typescript = () => sucrase({
   exclude: ['node_modules/**'],
   transforms: ['typescript'],
   declaration: true,
   module: "ES2015" })

export default [ {
   input: "./external/template.ts",
   output: {
      file: "./src/app/utils/template.js",
      format: "esm"
   },
   plugins: [
      resolve1(),
      typescript()
   ]
}, {
   input: "./external/idb.ts",
   output: {
      file: "./src/app/utils/idb.js",
      format: "esm"
   },
   plugins: [
      typescript(),
      resolve1()
   ]
} ]
