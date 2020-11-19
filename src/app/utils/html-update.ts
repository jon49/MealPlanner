interface Refs {
    targets: string[],
    el: Element
}

function getRefs(root : HTMLElement) {
    var refs = {}
    for (var el of Array.from(root.querySelectorAll("[_]"))) {
        (<string>el.getAttribute("_")).split(";").reduce((acc, val) => {
        var vv = val.split("|")
        var data : Refs = {targets: vv[1] ? vv[1].split(",") : [], el}
        if (acc[vv[0]]) {
            acc[vv[0]].push(data)
        } else {
            acc[vv[0]] = [data]
        }
        return acc
        }, <any>refs)
    }
    return refs
}

var map : WeakMap<HTMLElement, any> = new WeakMap()
const compile = (root : HTMLElement) =>
    map.has(root) ? map.get(root) : map.set(root, getRefs(root)).get(root)

export default function update<T extends { [key: string]: any }>(root : HTMLElement, data : Partial<T>) {
    var v = map.get(root)
    if (!v) v = compile(root)
    for (var key of Object.keys(data)) {
        for (var content of <Refs[]>v[key] || []) {
            var el = content.el
            content.targets.forEach(x => {
                let d = data[key], val = d || ""
                x === "text"
                    ? (el.textContent = val)
                : d === null || d === void 0
                    ? el.removeAttribute(x)
                : el.setAttribute(x, val)
            })
        }
    }
    return v
}
