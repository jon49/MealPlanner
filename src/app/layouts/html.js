
/**
 * @param {TemplateStringsArray} strings 
 * @param  {...any} args 
 */
var html = (strings, ...args) =>
   String.raw(strings, ...args)
   .replace(/>\n+/g, '>')
   .replace(/\s+</g, '<')
   .replace(/>\s+/g, '>')
   .replace(/\n\s+/g, '<!-- -->')

export default html
