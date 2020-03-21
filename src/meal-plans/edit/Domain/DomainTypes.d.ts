import { Location } from "../../../utils/database.js";
import { ISODate } from "../../../utils/utils.js";

export interface RecipeDomain {
   id: RecipeId
   name: string
   location: Location
   lastUpdated: number
}

export interface RecipeDateDomain {
   date: ISODate
   categoryId: CategoryId
   recipeId: RecipeId
   quantity: number
   lastUpdated: number
}

export interface CategoryId {
   isCategoryId: true
   value: number
}

export interface RecipeId {
   isRecipeId: true
   value: number
}

export interface RecipeAndDateDomain extends RecipeDomain {
   date: ISODate
}
