import { left, right, Do, either, Either } from "./fp.js"

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

export type String100 = String100_
export type String50 = String50_
export type PositiveWholeNumber = PositiveWholeNumber_
export type TableType = string
export type IDType<T extends TableType> = { _id: T, value: number }

const notFalsey = (error: string, val: string | undefined) =>
    (!val) ? left([error]) : right(val)

const maxLength = (error: string, val: string, maxLength: number) =>
    (val.length > maxLength)
        ? left([error])
    : right(val)

const createString = <T>(ctor: (s: { s: string }) => T, name: string, val: string | undefined, maxLength_: number) =>
    Do(either)
    .bind("trimmed", notFalsey(`'${name} is required.'`, val?.trim()))
    .bindL("s", ({ trimmed }) => maxLength(`'${name}' must be less than 50 characters.`, trimmed, maxLength_))
    .return(ctor)

const isInteger = (val: number) => val === (val|0)

export const createString50 = (name: string, val: string | undefined) : Either<string[], String50> =>
    createString(({s}) => new String50_(s), name, val, String50_.maxLength)

export const createString100 = (name: string, val: string | undefined) : Either<string[], String100> =>
    createString(({s}) => new String100_(s), name, val, String100_.maxLength)

export const createPositiveWholeNumber = (name: string, val: number) : Either<string[], PositiveWholeNumber>  =>
    Do(either)
    .do(val < 0 ? left([`'${name}' must be 0 or greater. But was given '${val}'.`]) : right(val))
    .do(isInteger(val) ? right(val) : left([`${name} must be a whole number. But was given '${val}' and was expecting '${val|0}'.`]))
    .return(() => new PositiveWholeNumber_(val))
