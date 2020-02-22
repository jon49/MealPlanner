const glob = require("glob")
const fs = require("fs")
const cp = require("child_process")
const execFile = cp.execFile
const path = require("path")

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
      console.log(`Writing file: ${fullClean}`)
      fs.writeFile(clean, stdout, (err) => {
         if (err) console.log(err)
         console.log(`Finished writing file: ${fullClean}`)
      })
   })
}
