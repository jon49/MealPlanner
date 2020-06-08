// @ts-check

/**
 * @param {Node} node 
 * @returns {HashTemplate.PropertyAttributes|0}
 */
function collector(node) {
  if (node instanceof HTMLElement && node.attributes !== undefined) {
    const values = {}
    let setValues = false
    for(let attr of Array.from(node.attributes)) {
        let aname = attr.name
        if (aname[0] === '#') {
            const attrs =
                (aname[1] === '[')
                    ? aname.slice(2, aname.length - 1).split(',')
                : []
            const name = attr.value
            if (name in values) values[name].push(...attrs)
            else values[name] = attrs
            node.removeAttribute(aname)
            setValues = true
        }
    }
    return /** @type {*} */(setValues ? values : 0)
  } else {
    let nodeData = node.nodeValue
    if (nodeData[0] === '#') {
      node.nodeValue = ""
      return { [nodeData.slice(1)]: [] }
    }
    return 0
  }
}

/**
 * @type {HashTemplate.HashTreeWalker}
 */
// @ts-ignore
const TREE_WALKER = document.createTreeWalker(document, NodeFilter.SHOW_ALL, null, false)
TREE_WALKER.roll = function(n) {
  while(--n) this.nextNode()
  return this.currentNode
}

const genPath = (() => {
  let id = 0
  /**
   * @param {Node} node 
   * @returns {HashTemplate.Paths}
   */
  const pathGenerator = node => {
    const w = TREE_WALKER
    w.currentNode = node

    /** @type {HashTemplate.Refs} */
    let refs = {}
    /** @type {HashTemplate.Names} */
    let names = {}
    let indices = [], idx = 0
    /** @type {HashTemplate.PropertyAttributes|0} */
    let ref
    do {
      if (ref = collector(node)) {
        const i = idx + 1
        refs[id] = ref
        for (const name of Object.keys(ref)) {
          if (!(name in names)) names[name] = [id]
          else names[name].push(id)
        }
        indices.push({idx: i, id})
        idx = 1
      } else {
        idx++
      }
      id++
    } while(node = w.nextNode())

    return { refs, names, indices }
  }
  return pathGenerator
})();

/**
 * @param {Node} node
 * @param {HashTemplate.Paths} paths
 * @returns {HashTemplate.Nodes}
 */
function walker(node, paths) {
  /** @type {{[key: number]: Node}} */
  const refs = {}

  const w = TREE_WALKER
  w.currentNode = node

  paths.indices.map(x => refs[x.id] = w.roll(x.idx))

  return refs
}

/**
 * @template T
 */
class Template {
  /**
   * @param {Node} node
   * @param {HashTemplate.Paths} paths
   * @param {Partial<T>} [o]
   */
  constructor(node, paths, o) {
    this._refPaths = paths
    this.root = node.cloneNode(true)
    this._nodes = walker(this.root, this._refPaths)
    if (o) this.update(o)
  }

  /**
   * @param {Partial<T>} o
   * @returns {Partial<HashTemplate.Nodes>}
   */
  getNodes(o) {
    const nodes = {}
    for (const key of Object.keys(o)) {
      nodes[key] = this._nodes[key]
    }
    return nodes
  }

  /**
   * @param {Partial<T>} o
   */
  update(o) {
    Object.keys(o)
    .forEach(key => {
      /**
       * @param {string | number} idx
       */
      this._refPaths.names[key]
      .forEach(idx => {
        const n = this._nodes[idx]
        if (n instanceof Text) {
          n.nodeValue = o[key]
        } else if (n instanceof HTMLElement) {
          const attrs = this._refPaths.refs[idx]
          /**
           * @param {string} x
           */
          if (attrs[key]) {
            attrs[key].forEach(x => x === "text" ? n.textContent = o[key] : n.setAttribute(x, o[key]))
          } else { console.error(`Key '${key}' value not defined.`) }
        }
      })
    })
  }
}

const compilerTemplate = document.createElement('template')
/**
 * @param {TemplateStringsArray} strings
 * @param {any[]} args
 */
function h(strings, ...args) {
  const template = String.raw(strings, ...args)
    .replace(/>\n+/g, '>')
    .replace(/\s+</g, '<')
    .replace(/>\s+/g, '>')
    .replace(/\n\s+/g, '<!-- -->')
  compilerTemplate.innerHTML = template
  return compilerTemplate.content.firstChild
}

/**
 * @template T
 * @param {HTMLTemplateElement|TemplateStringsArray} node
 * @param {any[]} args
 * @returns {(o?: Partial<T>) => Template<T>}
 */
export default function template(node, ...args) {
  /** @type {Node} */
  const n = node instanceof HTMLTemplateElement ? node.content.firstChild : h(node, ...args)
  const paths = genPath(n)
  return (o) => new Template(n, paths, o)
}
