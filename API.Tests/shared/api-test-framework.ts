import * as Colors from "https://deno.land/std@0.83.0/fmt/colors.ts"

interface TestItemExpectation {
    /** Max expected time in milliseconds */
    maxTime?: number
    chain?: TestItem
}

export interface TestItem {
    (baseUrl: string, client: HttpClientTest) : Promise<TestItemExpectation>
}

interface Options {
    headers?: Record<string, string>
    body: BodyInit
}

export class HttpClientTest {
    _time?: number
    response?: Response
    async postAsync<R>(url: string, {body, headers = {}}: Options) : Promise<R> {
        const start = Date.now()
        const length = typeof body === "string" ? body.length : 0
        var headersObj = new Headers({
            "Content-Type": "application/json",
            "Content-Length": ""+length,
            ...headers
        })
        var response = await fetch(url, {
            method: "POST",
            body,
            headers: headersObj
        })
        this.response = response

        const end = Date.now()
        if (this._time) {
            this._time += end - start
        } else {
            this._time = end - start
        }

        let data : R = <any>{}
        if (response.headers.get("content-type")?.startsWith("application/json")) {
            data = await response.json()
        } else if (!response.ok) {
            const text = await response.text()
            throw text
        }

        return <R>data
    }
    get time() {
        return this._time ?? -1
    }
    clearTime() {
        this._time = undefined
    }
}

export const check = (message: string, predicate: () => boolean) => {
    if(!predicate()) throw message
}

export const isBetween = (value: number, before: number, after: number) =>
    before < value && value < after

export const isNull = (value: any) => value === undefined || value === null

export const isNonEmptyUUID = (value: string) =>
        /[\d\S]{8}-[\d\S]{4}-[\d\S]{4}-[\d\S]{4}-[\d\S]{12}/.test(value)
        && value !== "00000000-0000-0000-0000-000000000000"


async function runTest(baseUrl: string, f: TestItem) {
    const client = new HttpClientTest()
    const result = await f(baseUrl, client)
    .catch(x => {
        console.error(Colors.red(`ERROR! ${f.name}: ${x}`))
        return "Error"
    })
    if (typeof result !== "string") {
        if (client.time < (result.maxTime ?? Infinity)) {
            console.log(`${f.name} <> ${client.time}ms`)
        } else {
            console.warn(Colors.brightGreen(Colors.bold(`${f.name} <> ${client.time}ms expected under ${result.maxTime}ms`)))
        }
        if (result.chain) {
            runTest(baseUrl, result.chain)
        }
    }
}

export const run = async (baseUrl: string, tests: TestItem[]) => {
    for await (const f of tests) {
        await runTest(baseUrl, f)
    }
}
