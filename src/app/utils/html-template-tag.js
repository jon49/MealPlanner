// Inspired by source: https://github.com/AntonioVdlC/html-template-tag
(function() {
const chars = {
	"&": "&amp;",
	">": "&gt;",
	"<": "&lt;",
	'"': "&quot;",
	"'": "&#39;",
	"`": "&#96;"
};

// Dynamically create a RegExp from the `chars` object
const re = new RegExp(Object.keys(chars).join("|"), "g");

// Return the escaped string
// @ts-ignore
const htmlEscape = (str = "") => String(str).replace(re, match => chars[match]);

// type HTMLRunnerSub = string | string[] | Promise<HTMLRunnerSub> | Promise<HTMLRunnerSub>[] | HTMLRunner | HTMLRunner[]
// type HTMLGeneratorReturn = ReturnType<typeof htmlGenerator>
function* htmlGenerator(literals, ...subs) {
   var length = literals.raw.length,
      s = "",
      escape = true
   for (var i = 0; i < length; i++) {
      let lit = literals.raw[i]
      let sub = subs[i - 1]
      if (sub) {
         if (Array.isArray(sub)) { for (s of sub) if (s) yield s }
         else yield escape ? sub : { e: sub }
      }
      lit = (escape = lit.endsWith("$")) ? lit.slice(0, -1) : lit
      if (lit) yield lit
   }
}

const catchError = x => x.catch(x => `!!!!Error!!!! ${x}`)

// type Callback = (s: string) => void
// type HtmlRunnerValueResult = string | Promise<HTMLRunnerSub> | HTMLRunner | { e: string | Promise<HTMLRunnerSub> | HTMLRunner; }
async function runCallback(callback, val) {
   var e
   if (val instanceof Promise) val = await val
   if (val?.e instanceof Promise) e = await val.e
   if (!e && val?.e) e = val.e

   if (val?.start || (e?.start && (val = e))) {
      await catchError(val.start(callback))
   } else if (Array.isArray(val) || (Array.isArray(e) && (val = e))) {
      for (const x of val) await runCallback(callback, x)
   } else if (e) {
      callback(htmlEscape(e))
   } else callback(val)
}

class HTMLRunner {
   // g : HTMLGeneratorReturn
   constructor(generator) {
      this.g = generator
   }
   async start(callback) {
      var val //: IteratorResult<HtmlRunnerValueResult> | undefined
      while ((val = this.g.next()) && !val.done) {
         await runCallback(callback, val.value)
      }
   }
}

return (literals, ...subs) => new HTMLRunner(htmlGenerator(literals, ...subs))

}());
