import debounce from "./debounce.js"
import Run from "./Run.js"
import { EventValue, SpecialEvent, ErrorWithUserMessage, FriendlyError } from "./MonadTypes.js"
import defer from "./defer.js"

const run = async (f: () => Generator<any, any, any>): Promise<any> => {
   const r = new Run(f)
   let isError = false
   return r.start()
   .catch((x: ErrorWithUserMessage) => {
      isError = true
      console.error(`Function "${f.name}" - Error: ${x.error}`)
      document.dispatchEvent(new CustomEvent("Error", { detail: { message: x.userMessage } }))
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
   defer,
   debounce,
   EventValue,
   SpecialEvent,
   ErrorWithUserMessage,
   FriendlyError,
}
