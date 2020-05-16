// import test from "ava"
// import ISODate from "./ISODate.js"

// const year = 2020, month = 2, date = 23, combined = `${year}-0${month}-${date}`

// test("Should maintain same values", t => {
//    const iso = new ISODate(combined)
//    t.is(iso.year, year, "Year")
//    t.is(iso.month, month, "Month")
//    t.is(iso.date, date, "Date")
// })

// test("Should return same string value", t => {
//    const iso = new ISODate(combined)
//    t.is(iso.toString(), combined)
// })

// test("Should not move to previous day when using Date type.", t => {
//    const d = new Date(year, month - 1, date)
//    const iso = new ISODate(d)
//    t.is(iso.toString(), combined, "ToString")
//    t.is(iso.getDate().toString(), d.toString(), "Date Type")
// })

// test("Should be able to compare two ISODates", t => {
//    const iso = new ISODate(combined)
//    const iso2 = new ISODate(combined)
//    t.true(iso.equals(iso2))
// })
