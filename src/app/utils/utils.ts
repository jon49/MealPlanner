type ArgTypes<T> = T extends (...args: infer A) => any ? A:[]
export function defer<R, T extends (...args: any[]) => Promise<R>>(p: T) : (...args: ArgTypes<T>) => Promise<R|void> {
   let wait = false
   return (...args: ArgTypes<T>) => {
      if (!wait) {
         wait = true
         return p.apply(p, args).finally(() => wait = false)
      }
      return Promise.resolve()
   }
}

/**
 * A function that emits a side effect and does not return anything.
 * https://github.com/chodorowicz/ts-debounce/
 */
export type Procedure = (...args: any[]) => void;

export type Options = {
  isImmediate: boolean
  runImmediatelyFirstTimeOnly: boolean
}

export function debounce<F extends Procedure>(
  func: F,
  waitMilliseconds = 50,
  option?: Partial<Options>
): (this: ThisParameterType<F>, ...args: Parameters<F>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const options: Options = Object.assign({
    isImmediate: false,
    runImmediatelyFirstTimeOnly: false
  }, option)

  return function(this: ThisParameterType<F>, ...args: Parameters<F>) {
    const context = this;

    const doLater = function() {
      timeoutId = undefined;
      if (!options.isImmediate) {
        func.apply(context, args);
      }
    }

    const shouldCallNow = (options.isImmediate || options.runImmediatelyFirstTimeOnly) && timeoutId === undefined;
    options.runImmediatelyFirstTimeOnly = false

    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(doLater, waitMilliseconds);

    if (shouldCallNow) {
      func.apply(context, args);
    }
  }
}

export const handleError = <T>(err: T) => { document.dispatchEvent(new CustomEvent("Error", { detail: err })) }

export class ISODate {
   year: number
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
