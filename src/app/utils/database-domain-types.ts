import { String50, PositiveWholeNumber, String100 } from "./common-domain-types.js"

export namespace Domain.Recipe {
    export type LocationKind = "book" | "url" | "other"
    export type LocationBook = { _kind: "book", book: String50, page: PositiveWholeNumber } 
    export type LocationUrl = { _kind: "url", title: String50, url: String100 }
    export type LocationOther =  { _kind: "other", other: String100 }
    export type Location = LocationBook | LocationUrl | LocationOther

    export interface Recipe {
        name: String100
        location: Location
    }
}
