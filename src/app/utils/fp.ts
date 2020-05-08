import { Either, either, left, right, getValidation, mapLeft, fold, isLeft } from "fp-ts/es6/Either"
import { TaskEither, taskEither, rightTask, right as rightTaskEither, leftTask, fromEither, tryCatch as _tryCatch } from "fp-ts/es6/TaskEither"
import { pipe } from "fp-ts/es6/pipeable"
import { Do } from "fp-ts-contrib/es6/Do"
import { getMonoid, array } from "fp-ts/es6/Array"

const validateForm = () => getValidation(getMonoid<string>())
const handleError = (err: string) => { document.dispatchEvent(new CustomEvent("Error", { detail: err })) }
const handleErrorWith = <T>(ret: T) => (err: string) => (handleError(err), ret)
const toErrorType = JSON.stringify
const tryCatchArgs = <T, S extends any[]>(f: (...args: S) => Promise<T>) =>
    (...args: S) => _tryCatch(() => f(...args), toErrorType)
const tryCatch = <T>(f: () => Promise<T>) => _tryCatch(f, toErrorType)
const tryCatchRaw = _tryCatch

const TE = {
    right: rightTaskEither
}

export type Validation<T> = Either<string[], T>
export {
    tryCatchRaw,
    tryCatchArgs,
    handleError,
    handleErrorWith,
    toErrorType,
    Do,
    Either,
    either,
    fold,
    mapLeft,
    left,
    right,
    isLeft,
    array,
    validateForm,
    TaskEither,
    taskEither,
    rightTask,
    leftTask,
    fromEither,
    tryCatch,
    pipe,
    TE
}
