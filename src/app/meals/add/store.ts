import getDB, { DatabaseType } from "../../utils/database.js"
import { Domain } from "../../utils/database-domain-types.js"
import { tryCatch } from "../../utils/fp.js"

async function createRecipe_(recipe: Domain.Recipe.Recipe) {
    const db = await getDB()
    let location: DatabaseType.Location
    switch (recipe.location._kind) {
        case "book":
            location = { book: recipe.location.book.value, page: recipe.location.page.value }
            break
        case "url":
            location = { url: recipe.location.url.value, title: recipe.location.title.value }
            break
        case "other":
            location = recipe.location.other.value
            break
    }
    const timestamp = Date.now()
    return await db.put("recipe", {
        id: timestamp,
        name: recipe.name.value,
        location,
        lastUpdated: timestamp
    })
}

const createRecipe = (recipe: Domain.Recipe.Recipe) => tryCatch(() => createRecipe_(recipe), String)

export {
    createRecipe
}
