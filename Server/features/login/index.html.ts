import html from "../../backend/html.ts"
import layout from "../shared/layout.html.ts"

export default async () =>
layout({
    header: html`<h1>Login</h1>`,
    nav: undefined,
    title: "Login",
    body:
html`
<form id=login method=post>
    <label>
        Email:&nbsp;
        <input type=email name=email>
    </label><br>
    <label>
        Password:&nbsp;
        <input type=password name=password>
    </label>
    <input type=submit value=Submit>
</form>
`
})
