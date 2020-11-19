import { FormEventCallback } from "../index"

(function() {
    const f : FormEventCallback = e => document.body.className = e.detail.theme
    addFormEvent("updateTheme", f)
    addFormEvent("themeUpdated", f)
}())
