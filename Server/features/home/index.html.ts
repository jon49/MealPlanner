import { Context } from "../../backend/application.ts"
import html from "../../backend/html.ts"
import layout from "../shared/layout.html.ts"

export default (_: Context<unknown>) => Promise.resolve(
layout({
    header: html`<h1>Welcome!</h1>`,
    nav: "Home",
    title: "Welcome",
    body: html`<p>Hi! It's great to have you here. <a href="/app/login"></a>Please login to get started.</a></p>`
})
)
