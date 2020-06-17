import { DatabaseWindow } from "../utils/database"

export type HtmlTemplateTag = (literals: TemplateStringsArray, ...substs: string[]) => string
export interface CustomGlobal extends DatabaseWindow {
    M: {
        html: HtmlTemplateTag
    }
}

export declare const self: CustomGlobal
