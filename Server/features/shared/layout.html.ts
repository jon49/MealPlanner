import html, { HTML, HTMLRunnerSub } from "../../backend/html.ts"
import navView, { Navigation } from "./navigation.html.ts"

interface LayoutView {
    body: HTMLRunnerSub
    title: string
    nav: Navigation
    header: HTML
}

export default ({ body, title, nav, header }: LayoutView) : HTML => html`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" type="text/css" href="/css/site.css">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="manifest" href="/site.webmanifest">
    <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5">
    <meta name="msapplication-TileColor" content="#da532c">
    <meta name="theme-color" content="#ffffff">
    <title>${title} | Meal Planner</title>
</head>
<body style="max-width: 800px; margin: auto;">
    ${navView({ current: nav, header })}
    ${body}
</body>
</html>`

