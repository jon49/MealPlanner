import html from "../../backend/html.ts"
import layout from "../shared/layout.html.ts"

function getRandomInt(min: number, max: number) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
}

export default async () => {
    const first = getRandomInt(0, 10)
    const last = getRandomInt(0, 10)
    return layout({
        header: html`<h1>Login</h1>`,
        nav: undefined,
        title: "Login",
        body:
    html`
<form id=login method=post>
    <label>
        Email:&nbsp;
        <input type=email name=email>
    </label><br>
    <label>
        Password:&nbsp;
        <input type=password name=password>
    </label>
    <input type=hidden value=${""+(first + last)} name=total>
    <label>
        I am human add ${""+first} + ${""+last} =&nbsp;
        <input type=number name=userTotal>
    </label>
    <input type=hidden name=ok>
    <input type=submit value=Submit>
</form>
<script>
;(function() {
    var $form = document.forms[0]
    $form.addEventListener("submit", function() {
        $form.ok.value = "I am human"
    })
}());
</script>
    `
    })
}
