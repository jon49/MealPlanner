interface Value<T> {
    value: T
}
interface String_ extends Value<string> {
}
export interface String100 extends String_ {}
export interface String50 extends String_ {}
export interface PositiveWholeNumber extends Value<number> {}
export interface IdNumber extends Value<number> {}
export type TableType = string
export interface IDType<T extends TableType> extends Value<number> { 
    _id: T
}

export interface Validation {
    type: {
        createString50: (name: string, val?: string | null | undefined) => Promise<String50>
        createString100: (name: string, val?: string | undefined) => Promise<String100>
        createPositiveWholeNumber: (name: string, val: number) => Promise<PositiveWholeNumber>
        createIdNumber: (name: string, val: number) => Promise<IdNumber>
    },
    validate: <T extends readonly unknown[] | readonly [unknown]>(promises: T) => Promise<{ -readonly [P in keyof T]: T[P] extends PromiseLike<infer U> ? U : T[P]; }>
}

(function validation() {

    class PositiveWholeNumber_ {
        readonly value: number
        constructor (value: number) {
            this.value = value
        }
    }

    class IdNumber_ {
        readonly value: number
        constructor (value: number) {
            this.value = value
        }
    }

    const notFalsey = (error: string, val: string | undefined) =>
        !val ? Promise.reject([error]) : Promise.resolve(val)

    const maxLength = (error: string, val: string, maxLength: number) =>
        (val.length > maxLength)
            ? Promise.reject([error])
        : Promise.resolve(val)

    const createString = async <T>(ctor: (s: string) => T, name: string, maxLength_: number, val?: string | undefined) => {
        const trimmed = await notFalsey(`'${name} is required.'`, val?.trim())
        const s = await maxLength(`'${name}' must be less than 50 characters.`, trimmed, maxLength_)
        return ctor(s)
    }

    const isInteger = (val: number) => val === (val|0)

    const createPositiveWholeNumber = (name: string, val: number) : Promise<PositiveWholeNumber>  => {
        if (val < 0) return Promise.reject([`'${name}' must be 0 or greater. But was given '${val}'.`])
        if (!isInteger(val)) return Promise.reject([`${name} must be a whole number. But was given '${val}' and was expecting '${val|0}'.`])
        return Promise.resolve(new PositiveWholeNumber_(val))
    }

    const createIdNumber = (name: string, val: number) : Promise<IdNumber> => {
        if (!isInteger(val)) return Promise.reject([`${name} must be a whole number. But was given '${val}' and was expecting '${val|0}'.`])
        if (val < 1) return Promise.reject([`'${name}' must be 1 or greater. But was given '${val}'.`])
        return Promise.resolve(new IdNumber_(val))
    }

    const createString50 = (name: string, val?: string | undefined): Promise<String50> =>
        createString(s => ({ value: s }), name, 50, val)
    const createString100 = (name: string, val?: string | undefined) : Promise<String100> =>
        createString(s => ({ value: s }), name, 100, val)

    async function validate<T extends readonly unknown[] | readonly [unknown]>(promises: T):
        Promise<{ -readonly [P in keyof T]: T[P] extends PromiseLike<infer U> ? U : T[P] }> {
        // @ts-ignore
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

    return {
        type: {
            createString50,
            createString100,
            createPositiveWholeNumber,
            createIdNumber,
        },
        validate
    }

}()) as Validation
