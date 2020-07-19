/**
 * @param {TemplateStringsArray} strings 
 * @param  {...any} args 
 */
export const html = (strings, ...args) =>
   String.raw(strings, ...args)
   .replace(/>\n+/g, '>')
   .replace(/\s+</g, '<')
   .replace(/>\s+/g, '>')
   .replace(/\n\s+/g, ' ')
   .trim()

const placeHolders = /{{([^}]+)}}/g
/**
 * @param {string} template
 * @param {*} replace
 */
export function splitHtml (template, replace) {
    var xs = []
    let m, cursor = 0
    while (m = placeHolders.exec(template)) {
        const slice = template.slice(cursor, m.index)
        if (slice.length !== 0) xs.push(slice)
        if (m[1] in replace) {
            if (Array.isArray(replace[m[1]])) {
                xs.push(...replace[m[1]])
            } else {
                xs.push(replace[m[1]])
            }
        } else {
            xs.push(m[1])
        }
        cursor = m.index + m[0].length
    }
    const slice = template.slice(cursor, template.length)
    if (slice.length !== 0) xs.push(slice)
    return xs
}
