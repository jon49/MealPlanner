import glob from "glob"
import fs from "fs"
import { execFile } from "child_process"
import path from "path"

var cwd = process.cwd()

var fileLocation = process.argv[3]
if (fileLocation && fileLocation.indexOf("__") > -1) {
   GenerateHTML(fileLocation)
} else {
   glob("./build/**/__*.html.js", (err, matches) => {
      if (err) {
         console.error(err)
         return
      }
      for (var filename of matches) {
         GenerateHTML(filename)
      }
   })
}

function GenerateHTML(filename) {
   const clean = filename
   .replace("__", "")
   .replace(/\.js$/, "")
   .replace(/\.\/build/, "public")
   var full = path.join(cwd, filename)
   execFile("node", [full], (error, stdout, stderr) => {
      if (error) {
         throw error
      }
      const fullClean = path.join(cwd, clean)
      console.log(fullClean)
      fs.writeFile(clean, stdout, (err) => {
         if (err) console.log(err)
      })
   })
}
