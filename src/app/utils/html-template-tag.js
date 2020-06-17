// source: https://github.com/AntonioVdlC/html-template-tag
;(function() {
// List of the characters we want to escape and their HTML escaped version
const chars = {
    "&": "&amp",
    ">": "&gt",
    "<": "&lt",
    '"': "&quot",
    "'": "&#39",
    "`": "&#96"
}

// Dynamically create a RegExp from the `chars` object
const re = new RegExp(Object.keys(chars).join("|"), "g")

// Return the escaped string
const htmlEscape = (str = "") => String(str).replace(re, match => chars[match])

if (!self.M) self.M = {}
self.M.html = function htmlTemplateTag(literals, ...substs) {
    return literals.raw.reduce((acc, lit, i) => {
        let subst = substs[i - 1]
        if (Array.isArray(subst)) {
            subst = subst.join("")
        } else if (literals.raw[i - 1] && literals.raw[i - 1].endsWith("$")) {
            // If the interpolation is preceded by a dollar sign,
            // substitution is considered safe and will not be escaped
            acc = acc.slice(0, -1)
        } else {
            subst = htmlEscape(subst)
        }

        return acc + subst + lit
    })
}
}());
