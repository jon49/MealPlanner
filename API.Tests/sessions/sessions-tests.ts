import { check, isBetween, isNonEmptyUUID, isNull, TestItem } from "../shared/api-test-framework.ts"

export const url = "api/sessions"

interface QueryResultSessionData
    { userId?: number
      expiration: number }

const getSessionChain =
    (newSession: NewSession) : TestItem =>
    async function Get_Session(baseUrl, client) {
    var data = await client.postAsync<QueryResultSessionData>(`${baseUrl}/${url}?sessionId=${newSession.id}`, {body:""})
    check(
        `User Id should be null - ${data.userId}`,
        () => isNull(data.userId))
    check(
        `Expiration should be the same as the original expiration.\nOriginal: ${newSession}\nRetrieved: ${data}`,
        () => newSession.expiration === data.expiration)
    return { maxTime: 8 }
}

export interface NewSession {
    id: string
    expiration: number
}

export const Create_New_Session : TestItem = async function Create_New_Session(baseUrl, client) {
    const now = new Date()
    const oneMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate() + 1)

    var data = await client.postAsync<NewSession>(`${baseUrl}/${url}`, { body: "" })
    check(
        `Session ID is not valid ${data}`,
        () => isNonEmptyUUID(data.id))

    check(
        `Expiration ID is outside of constraints ${JSON.stringify(data)}
Should be between ${+now/1e3} and ${+oneMonth/1e3} for ${data.expiration}`,
        () => isBetween(data.expiration, +now/1e3 - 1, +oneMonth/1e3)
    )

    return {
        maxTime: 70,
        chain: getSessionChain(data)
    }
}

export const Hydrate : TestItem = async function Hydrate(baseUrl, client) {
    var data = await client.getAsync<{}>(`${baseUrl}/${url}/hydrate`, { })
    return {
        maxTime: 8
    }
}

