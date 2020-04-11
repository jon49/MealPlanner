
var html = (strings : TemplateStringsArray, ...args : any[]) =>
   String.raw(strings, ...args)
   .replace(/>\n+/g, '>')
   .replace(/\s+</g, '<')
   .replace(/>\s+/g, '>')
   .replace(/\n\s+/g, '<!-- -->')

export default html
