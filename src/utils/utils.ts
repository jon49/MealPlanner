import * as debounce1 from "debounce"
import ISODate from "./ISODate.js"
import Run from "./Run.js"
import { EventValue, SpecialEvent, ErrorWithUserMessage, FriendlyError } from "./MonadTypes.js"

const debounce = <typeof debounce1>(<any>debounce1).default

const run = async (f: () => Generator<any, any, any>): Promise<any> => {
   const r = new Run(f)
   let isError = false
   return r.start()
   .catch(x => {
      isError = true
      var message: string
      if (x instanceof ErrorWithUserMessage) {
         message = x.userMessage
         console.error(`Function "${f.name}" - Error: ${x.error}`)
      } else {
         message = "Unknown error occurred."
         console.error(x)
      }
      document.dispatchEvent(new CustomEvent("Error", { detail: { message } }))
   })
   .finally(() => {
      if (!isError) {
         r.events
         .forEach(x => {
            document.dispatchEvent(new CustomEvent(x.message, { detail: x.value }))
         })
      }
   })
}

export {
   run,
   debounce,
   ISODate,
   EventValue,
   SpecialEvent,
   ErrorWithUserMessage,
   FriendlyError
}
