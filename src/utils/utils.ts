import { compile, hElement } from "stage0"

function random(start : number, end : number) {
	return ((Math.random() * (end - start + 1))|0) + start
}

function range(start : number, count : number) {
  var array = new Array(count)
  for (var i = start; i < count + start; i++)
    array[i - start] = i
  return array
}

function getTemplate<T extends string>(id : T) : hElement {
   var node = <Node>(<HTMLTemplateElement>document.getElementById(id))?.content?.firstChild
   if (!node) {
      throw `Template "${id}" is not found.`
   }
   compile(node)
   return <hElement>node
}

export {
   getTemplate,
   random,
   range
}
