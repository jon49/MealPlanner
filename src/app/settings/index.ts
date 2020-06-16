import { handleError } from "../utils/utils.js"
import { DatabaseWindow } from "../utils/database.js"

declare let self: DatabaseWindow

const { getDB } = self.DB

const $form = <HTMLFormElement>document.getElementById("settings")

const actions : Record<string, (e: Event) => Promise<any>> = {
    "theme": async (e: Event) => {
        const mode = (<HTMLSelectElement>e.target).value
        document.body.removeAttribute("class")
        document.body.setAttribute("class", mode)
        const db = await getDB(["settings"])
        if (mode) {
            await db.settings.put({ theme: mode })
        } else {
            await db.settings.delete("theme")
        }
        await db.done
    }
}

$form.addEventListener("change", e => {
    const name : string | undefined = (<any>e.target).name
    if (name && name in actions) {
        actions[name](e)
        .catch(handleError)
    }
})
