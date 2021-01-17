import html, { HTML } from "../../util/html.ts"

export type Navigation = "Operations" | "Home" | undefined

interface Header {
    current: Navigation
    header: HTML
}

const addNav =
    (current: Navigation) =>
    (nav: Navigation, value: any) =>
    current === nav ? undefined : value

export default (o: Header) => {

    const nav = addNav(o.current)

    return html`
    <header>
    ${o.header}
    <nav>
        ${ o.current === "Home" ? html`<span>Home</span>` :  html`<a href="/">Home</a>`}
        ${nav("Operations", html`| <a href="/operations">Operations</a>`)}
    </nav>
    </header>
    `
}