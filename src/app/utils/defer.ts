type ArgTypes<T> = T extends (...args: infer A) => any ? A:[]
export default function defer<R, T extends (...args: any[]) => Promise<R>>(p: T) : (...args: ArgTypes<T>) => Promise<R|undefined> {
   let wait = false
   return (...args: ArgTypes<T>) => {
      if (!wait) {
         wait = true
         return p.apply(p, args).finally(() => wait = false)
      }
      return Promise.resolve(void 0)
   }
}
