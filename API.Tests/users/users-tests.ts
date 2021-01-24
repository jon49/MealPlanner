import { NewSession, url as sessionUrl } from "../sessions/sessions-tests.ts"
import { check, isBetween, isNonEmptyUUID, isNull, TestItem } from "../shared/api-test-framework.ts"

const url = "api/users"

interface NewUser {
    email: string
    password: string
    confirmationPassword: string
    firstName: string
    lastName?: string
}


interface SessionUser {
    id: string
    expiration: number
    isLoggedIn: boolean
}

const loginChain =
    (user: NewUser, sessionId: string) : TestItem =>
    async function login_user(baseUrl, client) {
        const badLoginInWithOldSessionId =
            await client.postAsync<NewSession>(`${baseUrl}/${url}/login`, {
                body: JSON.stringify({ password: user.password, email: user.email }), headers: { sessionId }
            })
            .catch(x => x)

        var session = await client.postAsync<NewSession>(`${baseUrl}/${sessionUrl}`, { body: "" })
        client.clearTime()
        const sessionUser = await client.postAsync<SessionUser>(`${baseUrl}/${url}/login`, {
            body: JSON.stringify({ password: user.password, email: user.email }),
            headers: { sessionId: session.id } })

        check(
            `Bad login with old session ID should not login. ${JSON.stringify(badLoginInWithOldSessionId)}`,
            () => badLoginInWithOldSessionId === "Cannot log in.")
        check(`Should be logged in.`, () => sessionUser.isLoggedIn)

        return { maxTime: 70 }
    }

const logoutChain =
    (user: NewUser, sessionId: string) : TestItem =>
    async function logout_user(baseUrl, client) {
        await client.postAsync<undefined>(`${baseUrl}/${url}/logout`, { body: "", headers: { sessionId } })
        check(`Should return OK ${client.response?.ok}`, () => client.response?.ok === true)
        return { maxTime: 70, chain: loginChain(user, sessionId) }
    }

export const Register_user : TestItem = async function Register_user(baseUrl, client) {
        var session = await client.postAsync<NewSession>(`${baseUrl}/${sessionUrl}`, { body: "" })

        var newUser : NewUser = {
            email: `${session.id}@test.com`,
            password: "I love cheese",
            confirmationPassword: "I love cheese",
            firstName: "George",
            lastName: "Jungle"
        }

        client.clearTime()
        var user = await client.postAsync<SessionUser>(
            `${baseUrl}/${url}`,
            { body: JSON.stringify(newUser),
              headers: { sessionId: session.id } })

        check(
            `Should be logged in ${JSON.stringify(user)}`,
            () => user.isLoggedIn)
        check(
            `Should be the same session ${JSON.stringify(user)}`,
            () => user.id === session.id)
        check(
            `Should return location of user.`,
            () => `/api/sessions` === client.response?.headers.get("location"))

        return { maxTime: 70, chain: logoutChain(newUser, session.id) }
    }

export const Register_bad_user : TestItem = async function Register_bad_user(baseUrl, client) {
        var session = await client.postAsync<NewSession>(`${baseUrl}/${sessionUrl}`, { body: "" })
        client.clearTime()
        var user = await client.postAsync<any>(
            `${baseUrl}/${url}`,
            { body: "{}",
              headers: { sessionId: session.id } })
            .catch(x => JSON.parse(x))

        check(
            `Should return 400 error`,
            () => user.status === 400)
        check(
            `Should be 3 errors: ${JSON.stringify(user)}`,
            () => Object.keys(user.errors).length === 4
        )

        return { maxTime: 5 }
    }

export const Register_user_without_session_id : TestItem = async function Register_user_without_session_id(baseUrl, client) {
        var session = await client.postAsync<NewSession>(`${baseUrl}/${sessionUrl}`, { body: "" })

        var newUser : NewUser = {
            email: `${session.id}@test.com`,
            password: "I love cheese",
            confirmationPassword: "I love cheese",
            firstName: "George",
            lastName: "Jungle"
        }

        client.clearTime()
        var user = await client.postAsync<any>(
            `${baseUrl}/${url}`,
            { body: JSON.stringify(newUser) })
            .catch(x => JSON.parse(x))

        check(
            `Should return 401 error`,
            () => user.status === 401)

        return { maxTime: 10 }
    }

// export const Register_user_with_different_passwords : TestItem = async function Register_user_with_different_passwords(baseUrl, client) {
// }
