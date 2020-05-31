// Stage0
function collector(node) {
  if (node.nodeType !== 3) {
    if (node.attributes !== undefined) {
      for(let attr of Array.from(node.attributes)) {
        let aname = attr.name
        if (aname[0] === '#') {
          node.removeAttribute(aname)
          return aname.slice(1)
        }
      }
    }
    return 0
  } else {
    let nodeData = node.nodeValue
    if (nodeData[0] === '#') {
      node.nodeValue = ""
      return nodeData.slice(1)
    }
    return 0
  }
}

const TREE_WALKER = document.createTreeWalker(document, NodeFilter.SHOW_ALL, null, false)
TREE_WALKER.roll = function(n) {
  while(--n) this.nextNode()
  return this.currentNode
}

class Ref {
  constructor(idx, ref) {
    this.idx = idx
    this.ref = ref
  }
}

function genPath(node) {
  const w = TREE_WALKER
  w.currentNode = node

  let indices = [], ref, idx = 0
  do {
    if (ref = collector(node)) {
      indices.push(new Ref(idx+1, ref))
      idx = 1
    } else {
      idx++
    }
  } while(node = w.nextNode())

  return indices
}

function walker(node) {
  const refs = {}

  const w = TREE_WALKER
  w.currentNode = node

  this._refPaths.map(x => refs[x.ref] = w.roll(x.idx))

  return refs
}

function compile(node) {
    node._refPaths = genPath(node)
    node.collect = walker
}

function getTemplate(id) {
    var _a, _b;
    var node = (_b = (_a = document.getElementById(id)) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b.firstChild;
    if (!node) {
        throw "Template \"" + id + "\" is not found.";
    }
    compile(node);
    return node;
}

export default {
    get: getTemplate
}
