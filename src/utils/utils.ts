import * as debounce1 from "debounce"
const debounce = <typeof debounce1>(<any>debounce1).default

async function run(f : () => Generator<any, any, any>) {
   var iterator = f()
   var result = iterator.next()
   var value : any | undefined

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

   // TODO: Send error event for logging/showing the user. Also, make error have
   // friendly message and message for logging.
   return (value instanceof Error)
      ? Promise.reject(value)
   : Promise.resolve(value)
}

export class ISODate {
   year : number
   month: number
   date: number
   constructor(d: string | Date) {
      if (typeof d === "string") {
         this.year = +d.slice(0, 4)
         this.month = +d.slice(5, 7)
         this.date = +d.slice(8, 10)
      } else {
         this.year = d.getFullYear()
         this.month = d.getMonth() + 1
         this.date = d.getDate()
      }
   }

   getDate() {
      return new Date(this.year, this.month - 1, this.date)
   }

   addDays(numberOfDays: number) {
      return new ISODate(new Date(this.year, this.month - 1, this.date + numberOfDays))
   }

   toString() {
      return `${this.year}-${this.month.toString().padStart(2, "0")}-${this.date.toString().padStart(2, "0")}`
   }

   equals(d: ISODate) {
      return this.year === d.year && this.month === d.month && this.date === d.date
   }
}

export {
   run,
   debounce
}
