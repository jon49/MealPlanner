// @ts-check

;(function() {
    // See https://www.w3schools.com/howto/howto_js_snackbar.asp
    const $style = document.createElement("style")
    $style.innerHTML = `
    snack-bar.snack-bar-style {
        visibility: hidden;
        min-width: 250px;
        text-align: center;
        z-index: 1;
    }
    snack-bar.show {
        visibility: visible;
        -webkit-animation: fadein 0.5s, fadeout 0.5s var(--snack-bar-duration)s;
        animation: fadein 0.5s, fadeout 0.5s var(--snack-bar-duration)s;
    }
    @-webkit-keyframes fadein {
        from {bottom: 0; opacity: 0;}
        to {bottom: 30px; opacity: 1;}
    }
    @keyframes fadein {
        from {bottom: 0; opacity: 0;}
        to {bottom: 30px; opacity: 1;}
    }
    @-webkit-keyframes fadeout {
        from {bottom: 30px; opacity: 1;}
        to {bottom: 0; opacity: 0;}
    }
    @keyframes fadeout {
        from {bottom: 30px; opacity: 1;}
        to {bottom: 0; opacity: 0;}
    }
    `
    document.head.append($style)

    // Also known as "Toast" and "Snackbar"
    class Snackbar extends HTMLElement {
        constructor() {
            super()
            const shadowRoot = this.attachShadow({mode: 'open'})
            shadowRoot.innerHTML = `<slot name="message"><p>I love cheesburgers!</p></slot>`
        }

        connectedCallback() {
            this.classList.add("snack-bar-style")
            const timeout = +(getComputedStyle(document.documentElement).getPropertyValue('--snack-bar-duration') || 3) + 0.5
            let temp =
                setTimeout(() => {
                    clearTimeout(temp)
                    this.remove()
                } , timeout * 1e3)
        }
    }

    customElements.define("snack-bar", Snackbar)
})();