import h from "stage0"

const html = h

const Model = {
    name : "",
    password : "",
    confirmPassword : "",
}

const view = html`
    <style>
    .hidden {
        display: none;
    }
    </style>
    <form #oninput>
        <input type="text" placeholder="Name" data-oninput="name" />
        <input type="text" placeholder="Password" data-oninput="password" />
        <input type="text" placeholder="Confirm Password" data-oninput="confirm-password" />
        <p #password8 class="hidden">Password must be at least 8 characters long.</p>
        <p #oneUpper class="hidden">Password must container at least 1 upper case letter.</p>
        <p #oneLower class="hidden">Password must container at least 1 lower case letter.</p>
        <p #oneNumber class="hidden">Password must container at least 1 numeric case letter.</p>
        <p #mustMatch class="hidden">Password must match.</p>
    </form>`

type InputTypes = "name" | "password" | "confirm-password"

function Main() {
    var root = view
    const { oninput, password8, oneUpper, oneLower, oneNumber, mustMatch } = view.collect(root)

    type ErrorMessageKey =  "password8" | "oneUpper" | "oneLower" | "oneNumber" | "mustMatch"
    var errorMessages : Record<ErrorMessageKey, HTMLParagraphElement> = 
        { password8, oneUpper, oneLower, oneNumber, mustMatch, }

    var toggleHidden = (el : HTMLParagraphElement, show : boolean) =>
        show
            ? el.classList.remove("hidden")
        : el.classList.add("hidden")

    var update = () => {
        if (Model?.password?.length > 0 || Model?.confirmPassword?.length > 0) {
            var password = Model?.password ?? ""
            var confirm = Model?.confirmPassword ?? ""
            toggleHidden(errorMessages.mustMatch, password !== confirm)
            toggleHidden(errorMessages.password8, password.length > 7)
            var oneUpper = false,
                oneLower = false,
                oneNumber = false

            for (const char of password) {
                if (oneUpper && oneLower && oneNumber) {
                    break;
                }
                oneNumber = oneNumber || +char === +char
                var charNumber = char.charCodeAt(0)
                oneLower = oneLower || charNumber >= 97 && charNumber <= 122
                oneUpper = oneUpper || charNumber >= 65 && charNumber <= 90
            }

            toggleHidden(errorMessages.oneUpper, oneUpper)
            toggleHidden(errorMessages.oneLower, oneLower)
            toggleHidden(errorMessages.oneNumber, oneNumber)
        }
    }

    oninput.oninput = (e : Event) => {
        var $el = e.target
        if (!($el instanceof HTMLInputElement)) {
            return
        }

        switch (<InputTypes>$el.dataset.oninput) {
            case "name":
                Model.name = $el.value
                break;
            case "password":
                Model.password = $el.value
                break;
            case "confirm-password":
                Model.confirmPassword = $el.value
                break;
            default:
                break;
        }
        update()
    }

    update()
    return root
}

document.body.appendChild(Main())

