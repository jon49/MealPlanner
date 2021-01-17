Metadata
- etag: string
- versionId: string
- location: string
- oldVersions: string[]

LastUpdated
- table id: int
- id: int
- last updated: utc int

Schema (JSON)
- version: string (Major.Minor.Patch)
- [Table Id]: [{ columnName , type, validation, foreignKeys }]
- Table Names: { [id: int]: name: string }

Unit (e.g., The units used in ingredients, like Tbsp, tsp, cups, can, etc)
- id: int
- name: string

Ingredient
- id: int
- name: string
- unit ids: int[]

Location - interface (values are mutually exclusive)
- book?: { book: string, page: int }
- url?: { title: string, url: string }
- other?: string

IngredientUnit
- unit id: int
- quantity: int

Direction
- Id : int
- Description: string
- Ingredients: IngredientUnit[]

Recipe
- id: int
- name: string
- active: bool
- rating: int (out of 5)
- description: string
- location: Location
- season id: int
- directions: id[] -> Direction Ids
- category: int (category id) <- Should index this one?

Category (e.g., Dinner, Lunch, etc)
- id: int
- name: string

Season
id: int
name: string
from: Date (Inclusive)
to: Date (Inclusive)

Setting
- UseFavorites: int (number of times to use favorites in a week)

RecipeDateDinner (When the recipe was used last)
- Date: date <- composite primary key with category id
- Category Id: int
- Recipe Id: int
- Quantity: float (e.g., doubled, tripled)

NutritionInformationType (e.g., carbs, protein, fat, calories)
- id: int
- name: int

NutritionInformation
- recipe id: int
- ingredient id: int
- date: date
- type: { [type id:int]: float }


