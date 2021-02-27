import html from "../../backend/html.ts"
import layout from "../shared/layout.html.ts"

interface LoginFormOptions {
    uuid: string
    errors?: {
        email?: boolean
        password?: boolean
    }
}

export default async (o: LoginFormOptions) => {
    const emailError =
        o.errors?.email
            ? html`<p class=error>Email required.</p>`
        : ""
    const passwordError =
        o.errors?.password
            ? html`<p class=error>Email required. Minimum 6 characters.</p>`
        : ""

    return layout({
        header: html`<h1>Login</h1>`,
        nav: undefined,
        title: "Login",
        body:
    html`
<form id=login method=post>
    <label for=email>Email:</label><br>
    <input id=email type=email name=email required><br>
    ${emailError}
    <label for=password>Password:</label><br>
    <input id=password type=password name=password minlength=6 required><br>
    ${passwordError}
    <input type=hidden name=key value=${o.uuid}>
    <p>No account? <a href="/register">Sign up</a></p>
    <input type=submit value=Submit>
</form>`
    })
}
