import { Context } from "../../backend/application.ts"
import view from "./index.html.ts"

export const register =
    (_: Context) => view()
