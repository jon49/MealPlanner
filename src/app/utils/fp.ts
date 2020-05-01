import { Either, either, left, right, getValidation, mapLeft, fold, isLeft } from "fp-ts/es6/Either"
import { TaskEither, taskEither, rightTask, leftTask, fromEither, tryCatch } from "fp-ts/es6/TaskEither"
import { pipe } from "fp-ts/es6/pipeable"
import { Do } from "fp-ts-contrib/es6/Do"
import { getMonoid, array } from "fp-ts/es6/Array"

const validateForm = () => getValidation(getMonoid<string>())

export type Validation<T> = Either<string[], T>
export {
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
}
