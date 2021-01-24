import { Context } from "../../backend/application.ts"
import view from "./index.html.ts"

export const login =
    (ctx: Context<unknown>) => view()
