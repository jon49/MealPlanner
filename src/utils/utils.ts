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

async function run<T, E extends Error, R>(
   f : () => Generator<Promise<T> | E, R, T>) {
   var iterator = f()
   var result = iterator.next()
   var value : T | E | undefined

   while(!result.done) {
      var newValue = result.value
      if (newValue instanceof Promise) {
         value = await newValue
         if (value instanceof Error) {
            break
         }
         result = iterator.next(value)
      } else {
         value = newValue
         break
      }
   }

   if (!value) {
      return result.value instanceof Promise
         ? result.value
      : result.value instanceof Error
         ? Promise.reject(result.value)
      : Promise.resolve(result.value)
   }

   return (value instanceof Error)
      ? Promise.reject(value)
   : Promise.resolve(value)
}

export {
   getTemplate,
   getDb,
   run
}
