import { Either, either, left, right, getValidation, mapLeft, fold } from "fp-ts/es6/Either"
import { TaskEither, taskEither, rightTask, leftTask, fromEither, tryCatch } from "fp-ts/es6/TaskEither"
import { pipe } from "fp-ts/es6/pipeable"
import { Do } from "fp-ts-contrib/es6/Do"
import { getMonoid } from "fp-ts/es6/Array"

const validateForm = () => getValidation(getMonoid<string>())

export {
    Do,
    Either,
    either,
    fold,
    mapLeft,
    left,
    right,
    validateForm,
    TaskEither,
    taskEither,
    rightTask,
    leftTask,
    fromEither,
    tryCatch,
    pipe,
}
