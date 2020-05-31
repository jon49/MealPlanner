// @ts-check

;(function() {
    const $style = document.createElement("style")
    /**
     * @param {number} count
     */
    const tabStyles = count => `
        form-tabs [data-tab] { display: none; }
        form-tabs [data-tab] + label { cursor: pointer; padding: 0.25em; border: 1px solid #ccc; background-color: var(--unselected-tab); }
        form-tabs [data-tab]:checked + label { border-bottom: solid var(--selected-tab) 1px; background-color: var(--selected-tab); }
        ${[...Array(count).keys()].map(x => `form-tabs [data-tab="${x}"]:checked ~ [data-tab="${x}"]`).join(",")} {
            padding: 1em;
            display: block;
            border: solid #ccc 1px;
            margin: 0;
        }`
    $style.innerHTML = tabStyles(10)
    document.head.append($style)

    class FormTabs extends HTMLElement {
        constructor() {
            super()
            const shadowRoot = this.attachShadow({mode: 'open'})
            shadowRoot.innerHTML = `<slot name="tabs"></slot>`
        }

        connectedCallback() {
            /** @param {Event} e */
            this.clickListener = e => {
                if (e.target instanceof HTMLInputElement) {
                    this.tabInput = e.target
                    this.toggleDisabled()
                }
            }
            this.addEventListener("change", this.clickListener)

            this.fieldSetTabContent = Array.from(this.querySelectorAll("fieldset[data-tab]")) || []
            this.toggleDisabled()
        }

        disconnectedCallback() {
            // @ts-ignore
            this.removeEventListener("change", this.clickListener)
        }

        toggleDisabled() {
            let tabNumber = this.tabInput?.dataset?.tab
            if (!tabNumber) {
                const currentSelected = this.querySelector("input[data-tab]:checked")
                if (currentSelected instanceof HTMLInputElement) {
                    tabNumber = currentSelected.dataset.tab
                }
            }
            (this.fieldSetTabContent ?? [])
            .forEach(x => {
                if (x instanceof HTMLFieldSetElement) {
                    if (x.dataset.tab === tabNumber) {
                        x.removeAttribute("disabled")
                    } else {
                        x.setAttribute("disabled", "")
                    }
                }
            })
        }
    }

    customElements.define("form-tabs", FormTabs)
})();
