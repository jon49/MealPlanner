import { EventValue, SpecialEvent } from "./EventValue.js"

export default class Run {
   f: () => Generator<any, any, any>
   events: SpecialEvent<any>[] = []

   constructor(f: () => Generator<any, any, any>) {
      this.f = f
   }

   async start() {
      var iterator = this.f()
      var result = iterator.next()
      var value: any | undefined

      while(!result.done) {
         var newValue = result.value

         if (newValue instanceof EventValue) {
            this.events.push(newValue.event)
            newValue = newValue.value
         }

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

      if (result.value instanceof EventValue) {
         this.events.push(result.value.event)
         value = result.value.value
      }

      return result.value instanceof Promise
         ? result.value
      : result.value instanceof Error
         ? Promise.reject(result.value)
      : Promise.resolve(result.value)
   }
}
