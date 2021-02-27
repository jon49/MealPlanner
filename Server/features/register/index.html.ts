import html from "../../backend/html.ts"
import layout from "../shared/layout.html.ts"

interface RegisterOption {
    uuid: string
    question: [number, number]
    errors?: {
        email: boolean
        password: boolean
        confirmPassword: boolean
    }
}

export default async (o: RegisterOption) => {
    return layout({
        header: html`<h1>Login</h1>`,
        nav: undefined,
        title: "Login",
        body:
    html`
<form id=register method=post>
    <label for=email>Email:</label><br>
    <input id=email type=email name=email><br>
    <label for=password>Password:</label><br>
    <input id=password type=password name=password><br>
    <label for=confirmation-password>Confirm Password:</label><br>
    <input id=confirmation-password type=password name=confirmationPassword><br>
    <label>I am human so I can add $${""+o.question[0]} + $${""+o.question[1]} =</label><br>
    <input type=number name=userTotal><br>
    <input type=hidden name=ok>
    <input type=hidden name=key value=$${o.uuid}>
    <input type=submit value=Submit>
</form>
<script>
;(function() {
    var $form = document.forms["register"]
    $form.addEventListener("submit", function() {
        $form.ok.value = "I am human"
    })
}());
</script>`
    })
}

