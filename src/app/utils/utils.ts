type ArgTypes<T> = T extends (...args: infer A) => any ? A:[]
export function defer<R, T extends (...args: any[]) => Promise<R>>(p: T) : (...args: ArgTypes<T>) => Promise<R|undefined> {
   let wait = false
   return (...args: ArgTypes<T>) => {
      if (!wait) {
         wait = true
         return p.apply(p, args).finally(() => wait = false)
      }
      return Promise.resolve(void 0)
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

// FP

export const handleError = <T>(err: T) => { document.dispatchEvent(new CustomEvent("Error", { detail: err })) }
export const tryCatch = <T>(func: () => T): Promise<T> => {
  try {
    return Promise.resolve(func())
  } catch(e) {
    return Promise.reject(e)
  }
}

export const tryCatchWithArgs =
    <S extends any[], T>(f: (...args: S) => T) => 
    (...args: S) => tryCatch(() => f(...args))

export async function validate<T extends readonly unknown[] | readonly [unknown]>(promises: T):
    Promise<{ -readonly [P in keyof T]: T[P] extends PromiseLike<infer U> ? U : T[P] }> {
    const result = await Promise.allSettled(<any[]><unknown>promises)
    const failed: string[] = []
    for (const item of result) {
        if (item.status === "rejected") failed.push(item.reason)
    }
    if (failed.length > 0) return Promise.reject(failed)
    return <any>result.map(x => {
        if (x.status === "fulfilled") {
            return x.value
        }
        throw new Error("All items should already be resolved")
    })
}
