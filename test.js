import glob from "glob"

glob("./src/**/index.ts", (err, matches) => {
   if (err) {
      console.error(err)
   } else {
      matches.forEach(x => {
         console.log(x)
      })
   }
})
