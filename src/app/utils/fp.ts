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
