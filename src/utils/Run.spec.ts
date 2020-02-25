import test from "ava"
import Run from "./Run.js"
import { SpecialEvent, EventValue, FriendlyError } from "./MonadTypes.js"
import { ErrorWithUserMessage } from "./utils.js"

test("Should be able to return value from promise", async t => {
   const run = new Run(function* () {
      const result: string = yield Promise.resolve("Yes!")
      return result
   })
   const result: string = await run.start()
   t.is(result, "Yes!")
})

test("Should be able to return error value", async t => {
   const run = new Run(function* () {
      const result = yield Promise.reject("Error!")
      return result
   })
   return await run.start().catch(x => t.is(x, "Error!"))
})

test("Should be able to handle multiples values", async t => {
   const run = new Run(function* () {
      const one = yield Promise.resolve(1)
      const two = yield Promise.resolve(2)
      return one + two
   })
   const result = await run.start()
   t.is(result, 3)
})

test("Should flatten promise.", async t => {
   const run = new Run(function* () {
      return Promise.resolve("Yes!")
   })
   const result = await run.start()
   t.is(result, "Yes!")
})

test("Should return rejected promise if error is returned.", t => {
   const run = new Run(function* () {
      return new Error("Doh!")
   })
   return run.start()
   .catch((x: ErrorWithUserMessage) => {
      t.true(x instanceof ErrorWithUserMessage)
      t.is(x.userMessage, "Unkown error occurred.")
      t.true(x.error instanceof Error)
   })
})

test("Should complete early if promise is rejected.", t => {
   const run = new Run(function* () {
      const result = yield Promise.reject("Rejected!")
      shouldNeverBeCalled = false
      return result
   })
   let shouldNeverBeCalled = true
   return run.start()
   .catch(_ => {})
   .finally(() => t.true(shouldNeverBeCalled))
})

test("Should return rejected value.", t => {
   const run = new Run(function* () {
      const one = yield Promise.reject(1)
      const two = yield Promise.resolve(2)
      return one + two
   })
   return run.start()
   .catch(x => {
      t.is(x, 1)
   })
})

test("Should collect events", async t => {
   const run = new Run(function* () {
      const one = yield new EventValue(Promise.resolve(1), new SpecialEvent("Yes!"))
      const two = yield new EventValue(Promise.resolve(2), new SpecialEvent("Alrighty!"))
      return one + two
   })
   const result = await run.start()

   t.is(result, 3, "Returns the correct value when using events.")
   t.true(run.events.length === 2, "Has 2 events.")
   t.is(run.events[0].message, "Yes!")
})

test("Should return early with rejected events.", t => {
   let isNeverCalled = true
   const run = new Run(function* () {
      const one = yield new EventValue(Promise.reject("Was rejected."), new SpecialEvent("Yes!"))
      isNeverCalled = false
      const two = yield new EventValue(Promise.resolve(2), new SpecialEvent("Alrighty!"))
      return one + two
   })

   return run.start()
   .catch(x => {
      t.true(isNeverCalled)
      t.is(x, "Was rejected.")
      t.true(run.events.length === 1, "Has 1 event.")
   })
})

test("Should return friendly error", async t => {
   const run = new Run(function* () {
      yield Promise.resolve(FriendlyError("This is a friendly message.")("Error"))
   })
   const result: ErrorWithUserMessage = await run.start().catch(x => x)
   t.true(result instanceof ErrorWithUserMessage)
   t.is(result.userMessage, "This is a friendly message.")
   t.is(result.error, "Error")
})
