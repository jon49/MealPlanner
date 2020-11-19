// // @ts-check
// import { handleError } from "./utils/utils.js";

// /** @type {import("./utils/database").DatabaseWindow} */
// // @ts-ignore
// const s = self

// const { getReadOnlyDB } = s.DB
// /**
//  * @param {CustomEvent} e 
//  */
// function errorHandler(e) {
//     const $template = document.getElementById("error-message-template")
//     if ($template instanceof HTMLTemplateElement) {
//         const $message = $template.content.cloneNode(true)
//         if ($message instanceof DocumentFragment) {
//             /** @type {HTMLElement|null} */
//             var $p = $message.querySelector("[slot=message]")
//             if (!$p) throw "No slot message found."
//             if (Array.isArray(e.detail) && typeof e.detail[0] === "string") {
//               console.error(e.detail)
//               $p.textContent = e.detail.join("\n")
//             } else if (typeof e.detail === "string") {
//                 console.error(e.detail)
//                 $p.textContent = e.detail
//             } else {
//                 if (e.detail.message) {
//                   $p.textContent = e.detail.message
//                 } else {
//                   $p.textContent = JSON.stringify(e.detail)
//                 }
//                 console.error(e.detail)
//             }
//             document.getElementById("error-message")?.appendChild($message)
//         }
//     }
// }

// // @ts-ignore
// document.addEventListener("Error", errorHandler)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/app/sw.js').then(function(registration) {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
      const redirect = document.querySelector("meta[name=swjs]")
      if (!redirect) {
        debugger;
        document.location.href = document.location.href
      }
    }, function(err) {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

export type FormEventCallback = (e: { event: string, target: Element, detail: any }) => void
const events : { [key: string]: FormEventCallback } = {}
export type AddFormEvent = typeof addFormEvent
function addFormEvent(name: string, e: FormEventCallback) {
  if (events[name]) {
    console.error(`The event ${name} has already been registered! ${e}`)
    return
  }
  events[name] = e
}

// @ts-ignore 
self.addFormEvent = addFormEvent

document.addEventListener("submit", async e => {

  const form = e.target as HTMLFormElement;

  if (form.hasAttribute("ignore") || form.method === "get") {
    return
  }
  e.preventDefault()

  const data = new FormData(form)
  const cmd = ""+data.get("cmd")
  if (events[cmd]) {
    events[cmd]({ event: cmd, detail: data, target: form })
  }
  const response = await fetch(form.action, {
    method: form.method,
    body: new URLSearchParams([...(data as any)])
  })

  const event = response.headers.get("event")
  if (event) {
    const contentType = response.headers.get("content-type")
    var json : any
    if (contentType && contentType.indexOf("application/json") !== -1) {
      json = await response.json()
    }
    if (events[event]) {
      events[event]({ detail: json, event, target: form })
    }
  }

})
