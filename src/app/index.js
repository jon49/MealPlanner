// @ts-check
import { getReadOnlyDb } from "./utils/database.js"
import { handleError } from "./utils/utils.js";

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/app/sw.js').then(function(registration) {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

/**
 * @param {CustomEvent} e 
 */
function errorHandler(e) {
    const $template = document.getElementById("error-message-template")
    if ($template instanceof HTMLTemplateElement) {
        const $message = $template.content.cloneNode(true)
        if ($message instanceof DocumentFragment) {
            /** @type {HTMLElement|null} */
            var $p = $message.querySelector("[slot=message]")
            if (!$p) throw "No slot message found."
            if (Array.isArray(e.detail) && typeof e.detail[0] === "string") {
              console.error(e.detail)
              $p.textContent = e.detail.join("\n")
            } else if (typeof e.detail === "string") {
                console.error(e.detail)
                $p.textContent = e.detail
            } else {
                if (e.detail.message) {
                  $p.textContent = e.detail.message
                } else {
                  $p.textContent = JSON.stringify(e.detail)
                }
                console.error(e.detail)
            }
            document.getElementById("error-message")?.appendChild($message)
        }
    }
}

// @ts-ignore
document.addEventListener("Error", errorHandler)

async function applySettings() {
  const db = await getReadOnlyDb(["settings"])
  const theme = await db.settings.get("theme")
  if (theme) {
    document.body.removeAttribute("class")
    document.body.setAttribute("class", theme)
  }
}

applySettings()
.catch(handleError)
