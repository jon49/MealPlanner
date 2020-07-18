import { assertEquals } from "https://deno.land/std/testing/asserts.ts"
import { splitHtml, html } from "./html-build-utils.js"

Deno.test("splitHtml: Replaces placeholders", () => {
    const h = html`
    {{list}}
    <header>
    <h1>{{yes}}</h1>
    {{ok}}
    {{ignore}}
    </header>`

    const yes = (x: any) => x
    const ok = "<ok>Yeppers</ok>"
    const list = ["one", "two"]
    const result = splitHtml(h, { yes, ok, list })

    const expected = [
        ...list,
        "<header><h1>",
        yes,
        "</h1>",
        ok,
        "ignore",
        "</header>"
    ]

    const length = result.length
    for (let index = 0; index < length; index++) {
        const item = result[index]
        const expect = expected[index]
        assertEquals(item, expect, `Index **${index}**\n${item} - ${expect}`)
    }
})
