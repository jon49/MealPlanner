import { Location } from "../../../utils/database.js";
import { ISODate } from "../../../utils/utils.js";
import { IDType } from "../../../utils/common-domain-types.js"

export interface RecipeDomain {
   id: RecipeId
   name: string
   location: Location
}

export interface RecipeDateDomain {
   date: ISODate
   categoryId: CategoryId
   recipeId: RecipeId
   quantity: number
}

export interface CategoryId extends IDType<"category"> {
   value: number
}

export interface RecipeId extends IDType<"recipe"> {
   value: number
}

export interface RecipeAndDateDomain extends RecipeDomain {
   date: ISODate
}
