import { Context } from "../../backend/application.ts"
import view from "./index.html.ts"
import { v4 } from "https://deno.land/std@0.82.0/uuid/mod.ts"
import { redirect } from "../../backend/http.ts"

export const login =
    (ctx: Context) => {
        const uuid = v4.generate()
        ctx.state.loginId = uuid
        return view({ uuid })
    }

interface LoginForm {
    email: string
    password: string
    key: string
}

export async function loginUser(ctx: Context) {
    const data : LoginForm | undefined = ctx.data

    const email = !data?.email?.includes("@")
    const password = !(data?.password && data.password.length > 5)
    if (ctx.state.loginId !== data?.key) {
        const uuid = v4.generate()
        ctx.state.loginId = uuid
        return view({ uuid })
    } else if (email && password) {
        const uuid = v4.generate()
        ctx.state.loginId = uuid
        return view({ uuid, errors: { email, password } })
    }

    return redirect(ctx, "/app")
}
