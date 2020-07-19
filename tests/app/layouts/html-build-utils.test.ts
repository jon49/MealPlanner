import { splitHtml, html } from "../../../src/app/layouts/html-build-utils.js"
import { assertArrayEquals } from "../assert.ts"

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
        " ",
        ...list,
        "<header><h1>",
        yes,
        "</h1>",
        ok,
        " ",
        "ignore",
        "</header>"
    ]

    assertArrayEquals(result, expected)
})
