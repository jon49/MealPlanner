import { compile, hElement } from "stage0"
import getDb from "./database.js"

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
   getDb
}
