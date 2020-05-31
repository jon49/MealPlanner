import { DatabaseType } from "../../../utils/database.js"
import ISODate from "../../../utils/ISODate.js";
import { IDType } from "../../../utils/common-domain-types.js"

export interface RecipeDomain {
   id: RecipeId
   name: string
   location: DatabaseType.Location
}

export interface RecipeDateDomain {
   date: ISODate
   mealTimeId: MealTimeId
   recipeId: RecipeId
   quantity: number
}

export interface MealTimeId extends IDType<"meal-time"> {
   value: number
}

export interface RecipeId extends IDType<"recipe"> {
   value: number
}

export interface RecipeAndDateDomain extends RecipeDomain {
   date: ISODate
}
