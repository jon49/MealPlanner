import { Context } from "../../backend/application.ts"
import view from "./index.html.ts"
import { v4 } from "https://deno.land/std@0.82.0/uuid/mod.ts"

function getRandomInt(min: number, max: number) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
}

export const register =
    (ctx: Context) => {
        const uuid = v4.generate()
        ctx.state.registerKey = uuid

        return view({
            question: [getRandomInt(0, 10), getRandomInt(0, 10)],
            uuid
        })
    }
