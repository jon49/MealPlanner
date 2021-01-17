import { assertEquals } from "https://deno.land/std/testing/asserts.ts"

export function assertArrayEquals(actual: unknown[], expected: unknown[]) {
    const length = actual.length
    for (let index = 0; index < length; index++) {
        const item = actual[index]
        const expect = expected[index]
        assertEquals(item, expect, `Index **${index}** -- '${item}' - '${expect}'`)
    }
}
