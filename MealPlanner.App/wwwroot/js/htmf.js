(function () {

    const debounced = {}
    function debounce(func, key, option = { args: [], wait: 50, isImmediate: false, immediateFirst: false }) {
        if (!debounced[key]) {
            debounced[key] = option
        }
        const options = debounced[key]
        let timeoutId = options.timeoutId
        const context = this
        const doLater = function () {
            timeoutId = undefined
            if (!options.isImmediate) {
                func.apply(context, options.args);
            }
        };
        const shouldCallNow = (options.isImmediate || options.immediateFirst) && timeoutId === undefined;
        options.immediateFirst = false;
        if (timeoutId !== undefined) {
            clearTimeout(timeoutId);
        }
        options.timeoutId = setTimeout(doLater, options.wait);
        if (shouldCallNow) {
            func.apply(context, options.args);
        }
    }

    function click(self) {
        var $form = self.form
        if (!$form) return
        ($form.querySelector("button") || $form.querySelector("[type='submit']"))?.click()
    }

    document.querySelectorAll("[hf-hidden]").forEach(x => x.style.visibility = "hidden")

    var hf = { debounce, click }

    /**
     * @typedef PreData
     * @property {string} event
     * @property {FormData} data
     * @property {HTMLFormElement} form
     * @property {HTMLButtonElement} target
     */

    /**
     * @typedef PostData
     * @property {string} event
     * @property {*} data
     * @property {string} text
     * @property {HTMLFormElement} form
     * @property {true} postEvent
     * @property {HTMLButtonElement} target
     * @property {"html"|"json"|"text"} contentType
     */

    /**
     * @typedef EventData
     * @type {PreData|PostData}
     */

    const events = {}
    const hooks = []

    function addFormEvent(name, f) {
        if (events[name]) {
            console.error(`The event ${name} has already been registered! ${f.name}`)
            return
        }
        events[name] = f
    }

    /**
     * @param {(data: EventData) => Promise<void> | void} f 
     */
    function addHook(f) {
        hooks.push(f)
    }

    document.addEventListener("submit", async e => {
        try {

            /**
             * @type {HTMLFormElement}
             */
            const $form = e.target
            const $button = document.activeElement

            if ($form.hasAttribute("hf-ignore") || $button.hasAttribute("hf-ignore")) return
            e.preventDefault()

            //if (($button.hasAttribute("hf-confirm") || $form.hasAttribute("hf-confirm"))
            //    && !confirm(($button.getAttribute("hf-confirm") || $form.getAttribute("hf-confirm")) || "Are you sure?")) return

            const preData = new FormData($form)
            /** @type {string} */
            const preEvent = $button.dataset.event ?? $form.dataset.event
            const shouldRunEvent = preEvent && events[preEvent]
            /** @type {PreData} */
            const preEventData = { event: preEvent, data: preData, form: $form, target: $button }
            if (shouldRunEvent) {
                await events[preEvent](preEventData)
            }
            for (const hook of hooks) {
                await hook(preEventData)
            }

            const method = $button.formMethod || $form.method
            const url = new URL(($button.getAttribute("formAction") && $button.formAction) || $form.action)
            const options = { method, credentials: "same-origin", headers: new Headers({ "HF-Request": "true" }) }
            if (method === "post") {
                options.body = new URLSearchParams([...preData])
            } else if (!($button.hasAttribute("data-skip-query") || $form.hasAttribute("data-skip-query"))) {
                const query = new URLSearchParams(preData).toString()
                if (query) {
                    url.search += (url.search ? "&" : "?") + query.toString()
                }
            }
            const response = await fetch(url.href, options)

            const event = response.headers.get("event")
            const contentType = response.headers.get("content-type")
            let data, text

            const simpleContentType =
                contentType.indexOf("application/json") !== -1
                    ? "json"
                    : contentType.indexOf("html") !== -1
                        ? "html"
                        : "text"
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = JSON.parse(await response.json())
            } else {
                text = await response.text()
            }

            /** @type {PostData} */
            const postData = {
                event: preEvent,
                data,
                text,
                form: $form,
                postEvent: true,
                target: $button,
                contentType: simpleContentType
            }
            if (shouldRunEvent) {
                await event[preEvent](postData)
            }
            for (const hook of hooks) {
                await hook(postData)
            }

        }
        catch (ex) {
            console.error(ex)
            var $form = e?.target
            if ($form instanceof HTMLFormElement) $form.submit()
        }
    })

     self.hf = Object.assign(hf, {
        addFormEvent,
        addHook
    })

    hf.addHook(function htmlSwap(data) {
        if (!data.postEvent || data.contentType !== "html") return

        const template = document.createElement("template")
        template.innerHTML = data.text.trim()
        for (const el of template.content.childNodes) {
            if (!el.getAttribute) continue
            const query = el.getAttribute("target")
            let target
            let swapType
            if (query) {
                target = document.querySelector(query)
                swapType = el.getAttribute("hf-swap") || "append"
            } else {
                target = document.getElementById(el.id)
            }
            if (!target) { target = data.form }
            switch (swapType) {
                case "append":
                    target.append(el)
                    break
                case "prepend":
                    target.prepend(el)
                    break
                case "replace":
                default:
                    target.replaceWith(el)
            }
        }
        var $focus = document.querySelector("[autofocus]")
        if ($focus) {
            $focus.removeAttribute("autofocus")
            $focus.focus()
        }
    })

}());
