import { ErrorWithUserMessage } from "./utils.js"

interface Search {
   compareValue: string
   value: string
   id: string | number
}

type SearchList = Omit<Search, "compareValue">[]
interface SearchOptions {
   limit: number
   searchListEl: HTMLDivElement
}

export default function CreateSearch(searchList: SearchList, input: HTMLInputElement) {
   const userErrorMessage = "Oops! Something went wrong. Jon will notified to fix this!"
   if (!input) {
      return new ErrorWithUserMessage(userErrorMessage, "CreateSearch `input` is null.")
   }
   const set = input.dataset
   const limit = set.limit === undefined ? 9 : (parseInt(set.limit) || 10) - 1

   const searchListString: string | undefined = set.list
   if (!searchListString) {
      return new ErrorWithUserMessage(userErrorMessage, "Data `list` attribute not found in input for search.")
   }
   const $searchList: HTMLElement | null = document.getElementById(searchListString)
   if (!$searchList || !($searchList instanceof HTMLDivElement)) {
      return new ErrorWithUserMessage(userErrorMessage, `Could not find 'div' with id: ${searchListString} for search.`)
   }
   var options: SearchOptions = { limit, searchListEl: $searchList }

   return new Search(searchList, input, options)
}

function Setup(search: SearchList, input: HTMLInputElement, options: SearchOptions) {
      const searchList = search.map(x => ({ ...x, compareValue: x.value.toLowerCase() }))
      const limit = options.limit
      const searchListEl = options.searchListEl
      const handleKeyDownBound = handleKeyDown.bind({ appendTo: searchListEl, input })
      const handleBlurBound = handleBlur.bind({ appendTo: searchListEl })
      const handleKeyupBound = handleKeyup.bind({ searchList, limit, listResult: searchListEl })
      var result = new Promise<{ id: string | number }>()

      input.addEventListener("keydown", handleKeyDownBound)
      input.addEventListener("blur", handleBlurBound)
      input.addEventListener("focus", handleFocus)
      input.addEventListener("keyup", handleKeyupBound)

      result.finally(() => {
         input.removeEventListener("keydown", handleKeyDownBound)
         input.removeEventListener("blur", handleBlurBound)
         input.removeEventListener("focus", handleFocus)
         input.removeEventListener("keyup", handleKeyupBound)
      })
      return result

}




