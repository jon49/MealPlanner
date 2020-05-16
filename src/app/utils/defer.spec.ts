// import test from "ava"
// import {defer} from "./utils.js"

// let wait = (time : number, message: string) => new Promise<string>((resolve, _) => {
//   setTimeout( function() {
//     resolve(message)
//   }, time)
// }) 

// test("Should wait until previous item is finished", async t => {
//     var deferred = defer(wait)
//     var p1 = deferred(1, "Yes!")
//     var p2 = deferred(0, "Doh!")
//     var [result, neverRun] = await Promise.all([p1, p2])
//     t.is(result, "Yes!")
//     t.is(neverRun, undefined)
// })
