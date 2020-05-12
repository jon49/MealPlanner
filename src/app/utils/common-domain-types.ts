class String50_ {
    readonly value: string
    static maxLength = 50
    constructor(value: string) {
        this.value = value
    }
}

class String100_ {
    readonly value: string
    static maxLength = 100
    constructor(value: string) {
        this.value = value
    }
}

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

export type String100 = String100_
export type String50 = String50_
export type PositiveWholeNumber = PositiveWholeNumber_
export type IdNumber = IdNumber_
export type TableType = string
export type IDType<T extends TableType> = { _id: T, value: number }

const notFalsey = (error: string, val: string | undefined) =>
    !val ? Promise.reject([error]) : Promise.resolve(val)

const maxLength = (error: string, val: string, maxLength: number) =>
    (val.length > maxLength)
        ? Promise.reject([error])
    : Promise.resolve(val)

const createString = async <T>(ctor: (s: string) => T, name: string, val: string | undefined, maxLength_: number) => {
    const trimmed = await notFalsey(`'${name} is required.'`, val?.trim())
    const s = await maxLength(`'${name}' must be less than 50 characters.`, trimmed, maxLength_)
    return ctor(s)
}

const isInteger = (val: number) => val === (val|0)

export const createString50 = (name: string, val: string | undefined): Promise<String50> =>
    createString(s => new String50_(s), name, val, String50_.maxLength)

export const createString100 = (name: string, val: string | undefined) : Promise<String100> =>
    createString(s => new String100_(s), name, val, String100_.maxLength)

export const createPositiveWholeNumber = (name: string, val: number) : Promise<PositiveWholeNumber>  => {
    if (val < 0) return Promise.reject([`'${name}' must be 0 or greater. But was given '${val}'.`])
    if (!isInteger(val)) return Promise.reject([`${name} must be a whole number. But was given '${val}' and was expecting '${val|0}'.`])
    return Promise.resolve(new PositiveWholeNumber_(val))
}

export const createIdNumber = (name: string, val: number) : Promise<IdNumber> => {
    if (!isInteger(val)) return Promise.reject([`${name} must be a whole number. But was given '${val}' and was expecting '${val|0}'.`])
    if (val < 1) return Promise.reject([`'${name}' must be 1 or greater. But was given '${val}'.`])
    return Promise.resolve(new IdNumber_(val))
}
