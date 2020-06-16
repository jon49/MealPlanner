export type HtmlTemplateTag = (literals: TemplateStringsArray, ...substs: string[]) => string
export interface HTMLTemplateTag_ extends (Window & typeof globalThis) {
    html: HtmlTemplateTag
}

export declare const self: HTMLTemplateTag_
