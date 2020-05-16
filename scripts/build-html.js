import glob from "glob"
import fs from "fs"
import cp from "child_process"
import path from "path"

const execFile = cp.execFile

var cwd = process.cwd()

var fileLocation = process.argv[3]
glob("./src/**/index.html.js", (err, matches) => {
   if (err) {
      console.error(err)
      return
   }
   for (var filename of matches) {
      GenerateHTML(filename)
   }
})

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
      console.log(`Writing file: ${fullClean}`)
      fs.writeFile(clean, stdout, (err) => {
         if (err) console.log(err)
         console.log(`Finished writing file: ${fullClean}`)
      })
   })
}
