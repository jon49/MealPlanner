type AddRecipeFormField = "recipe-name" | "book" | "book-page" | "url" | "other" | "url-title" | "use-url-as-title"
export type SourceValue = "url" | "book" | "other"
export interface Page {
    addRecipeFormId: "_add-recipe"
    previousRecipes: "_previous-recipes"
    mealTime: "meal-time"
}

type FormField_ = { [K in AddRecipeFormField]: HTMLInputElement }
export interface HTMLAddRecipeForm extends HTMLFormElement, FormField_ {
    source: RadioNodeList
    "meal-times": RadioNodeList | HTMLInputElement
}
