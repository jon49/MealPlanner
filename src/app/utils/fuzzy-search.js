// @ts-check

;(function() {
   /**
    * @typedef SearchValue
    * @type {string|{title: string, [key: string]: string}}
    */
   /**
    * @typedef Search
    * @property {string} compareValue
    * @property {string|SearchValue} value
    * @property {string | number } id
    */
   /**
    * @typedef {Search & {similarity: number}} SearchParsed
    */

   /**
    * @type {DocumentFragment|undefined}
    */
   let $content

   const $style = document.createElement("style")
   $style.setAttribute("type", "text/css")
   $style.innerHTML = `
   fuzzy-search .search-box {
      display: flex;
      border: solid gray 1px;
      border-radius: 1em 1em 0 0;
      margin: 0 0 -1px 0;
      padding: 0.5em;
   }
   fuzzy-search .search-box > * {
    background-color: inherit;
    margin: 0;
   }
   fuzzy-search input {
    width: 100%;
    border: none !important;
    min-width: 20em;
   }
   fuzzy-search ul {
      width: 100%;
      border: gray solid 1px;
      border-radius: 0 0 1em 1em;
      list-style: none;
      padding: 0;
      margin: 0;
      overflow: hidden;
   }
   fuzzy-search li {
      width: 100%;
      padding: 0.5em;
   }`
   document.head.append($style)

   const arrowUp = "ArrowUp"
      , arrowDown = "ArrowDown"
      , enter = "Enter"
      , shift = "Shift"
      , _escape = "Escape"
      , key = { arrowUp, arrowDown, enter, shift, _escape }
      , commandKeys = [ arrowUp, arrowDown, enter ]
      , $input = document.createElement("input")
      , $list = document.createElement("ul")

   /** @type {HTMLLIElement|undefined} $currentSelected */
   let $currentSelected,
       ignoreMouse = true

   /**** EVENTS ****/

   /**
    * @param {HTMLLIElement} target 
    */
   const selectNew =
      target => {
         if (target !== $currentSelected) {
            if ($currentSelected) {
               $currentSelected.classList.remove("highlight")
               $currentSelected.removeAttribute("aria-selected")
            }
            $currentSelected = target
            $currentSelected.classList.add("highlight")
            $currentSelected.setAttribute("aria-selected", "true")
            $input.setAttribute("aria-activedescendant", $currentSelected.id)
            $input.value = $currentSelected.dataset.title
         }
      }

   /**
    * @param {{ $fuzzySearch: FuzzySearch }} param0
    * @returns {(arg0: KeyboardEvent) => (false|undefined|void)}
    */
   const handleKeyDown =
      ({ $fuzzySearch }) =>
      e => {
         if (commandKeys.some(x => e.key === x)) {
            if (!e.shiftKey && key.arrowDown === e.key) {
               if (!$list.firstElementChild) {
                  $input.dispatchEvent(new KeyboardEvent("keydown", { key: key.escape }))
                  return
               }
               /**
                * @type {Element | undefined | null}
                */
               let nextChosen
               if ($currentSelected) {
                  nextChosen = ($currentSelected.nextElementSibling || $list.querySelector("li:first-child"))
               } else {
                  nextChosen = $list.querySelector("li:first-child")
               }
               if (nextChosen instanceof HTMLLIElement)
                  selectNew(nextChosen)
            }
            if (e.key === key.arrowUp) {
               /**
                * @type {(Element | undefined | null)}
                */
               let nextChosen
               if ($currentSelected) {
                  nextChosen = ($currentSelected.previousElementSibling || $list.querySelector("li:last-child"))
               } else {
                  nextChosen = $list.querySelector("li:last-child")
               }
               if (nextChosen instanceof HTMLLIElement)
                  selectNew(nextChosen)
            }
            if (e.key === key.enter) {
               if ($currentSelected && $currentSelected instanceof HTMLLIElement) {
                  selectValue($currentSelected, $fuzzySearch)
               }
            }
            e.preventDefault()
            return false
         }
      }

   /**
    * Handles Focus Event
    * @param {Event} e 
    */
   function handleFocus(e) {
      const search = e.target
      if (search && search instanceof HTMLInputElement && search.value.length > 0) {
         search.select()
         search.dispatchEvent(new KeyboardEvent("keyup"))
      }
   }

   /**
    * Handles Keyup event
    * @param {{ searchList: Search[], limit: number }} param0 
    * @returns {(e: KeyboardEvent) => void | undefined}
    */
   const handleKeyup =
      ({ searchList, limit }) =>
      e => {
         if (commandKeys.some(x => e.key === x) || e.key === key.shift) {
            return
         }

         if (e.target && e.target instanceof HTMLInputElement) {
            const value = e.target.value.toLowerCase()
            const fuzzy =
               searchList.map(x =>
                  ({ similarity: fuzzySearch(value, x.compareValue).similarity
                  , compareValue: x.compareValue
                  , value: x.value
                  , id: x.id }))
            fuzzy.sort((a, b) => a.similarity > b.similarity ? -1 : 1)
            createULList(fuzzy, { limit })
         }
      }

   /**
    * @param {{ $fuzzySearch: FuzzySearch }} param0
    * @returns {(e: Event) => void}
    */
   const handleClick =
      ({ $fuzzySearch }) =>
      e => {
         e.preventDefault()
         var target = e.target
         if (target instanceof HTMLLIElement) {
            selectValue(target, $fuzzySearch)
         } else if (target instanceof HTMLElement) {
            const li = target.closest("li")
            if (li instanceof HTMLLIElement) {
               selectValue(li, $fuzzySearch)
            }
         }
      }

   /**
    * @param {HTMLLIElement} li 
    * @param {FuzzySearch} $fuzzySearch
    */
   function selectValue(li, $fuzzySearch) {
      var id = li.dataset.id
      $input.value = li.textContent || ""
      $list.innerHTML = ""
      $fuzzySearch.dispatchEvent(new CustomEvent("selected", { 
         detail: { value: $input.value, id }
      }))
   }

   /**
    * @param {MouseEvent} e
    */
   const liMouseEnter =
      e => {
         if (ignoreMouse) {
            ignoreMouse = false
            return
         }
         e.target instanceof HTMLLIElement && selectNew(e.target)
      }

   /**** HTML CREATION ****/

   /**
    * Create <li> tag
    * @param {(e: MouseEvent) => void} mouseOverEvent
    * @param {{ value: SearchValue, id: string | number }} param1
    */
   function createLI(mouseOverEvent, { value, id }) {
      const li = document.createElement("li")
      let title
      if (typeof value === "string") {
         li.innerText = value
         title = value
         li.dataset.title = title
      } else if ($content instanceof DocumentFragment) {
         const content = $content.cloneNode(true)
         if (content instanceof DocumentFragment) {
            Object.keys(value).forEach(key => {
               const el = content.querySelector(`[name=${key}]`)
               if (value[key]) {
                  el.textContent = value[key]
               }
            })
            title = value.title
            li.dataset.title = title
            li.appendChild(content)
         }
      } else {
         throw new Error("Value is not string and the template is not set.")
      }
      li.dataset.id = "" + id
      ;[["role", "option"]
      , ["id", "_" + id]
      , ["aria-label", title]
      ].forEach(xs => li.setAttribute(xs[0], xs[1]))
      li.addEventListener("mouseenter", mouseOverEvent)
      li.classList.add("cursor-pointer")
      return li
   }

   /**
    * @param {SearchParsed[]} list 
    * @param {{ limit: number }} options 
    */
   function createULList(list = [], { limit }) {
      let items = document.createDocumentFragment()
      let index = 0
      while (true) {
         const data = list[index]
         if (!data || data.similarity === 0 || index === limit)
            break
         index++
         items.append(createLI(liMouseEnter, data))
      }

      if ($list.children.length > 0) {
         for (let li of $list.children) {
            if (li instanceof HTMLLIElement) {
               li.removeEventListener("mouseenter", liMouseEnter)
            }
         }
      }
      if (index === 0) {
         $list.innerHTML = "<p>No items found.</p>"
      } else {
         $list.innerHTML = ""
         ignoreMouse = true
         $list.append(items)
      }
   }

   /**
    * Web component
    */
   class FuzzySearch extends HTMLElement {
      constructor() {
         super()
      }

      connectedCallback() {
         if (this.hasAttribute("autofocus")) {
            $input.focus()
         }
      }

      get emptyMessage() { return this.getAttribute("empty-message") || "Awaiting data." }
      get placeholder() { return this.getAttribute("placeholder") || "" }
      get label() { return this.getAttribute("label") || "Search" }
      get limit() {
         return (isNaN(+this.getAttribute("limit")))
            ? 10
         : +this.getAttribute("limit")
      }

      /**
       * @param {string} query
       */
      set template(query) {
         if (!(query?.length > 0)) {
            throw new Error("Query string has no value.")
         }
         const template = document.querySelector(query)
         if (!(template instanceof HTMLTemplateElement)) {
            throw new Error("Could not find template!")
         }
         $content = template.content
      }

      /**
       * @param {Search[]?} list
       */
      set searchList(list) {
         if (list instanceof Array && list.length > 0
            && list[0].id
            && list[0].value
            && list[0].compareValue?.length > 0) {
            /**
             * @type {Search[]}
             */
            this.__searchList = list
            this.__setup()
         } else {
            throw new Error("Search list was not created correctly.")
         }
      }

      noList() {
         const $p = document.createElement("p")
         $p.textContent = this.emptyMessage
         this.innerHTML = ""
         this.appendChild($p)
      }

      __setup() {
         if (this.__destroy) {
            this.__destroy()
         }
         this.innerHTML = ""

         const searchId = `q${this.id || ""}`
         const listId = `s_${this.id || ""}`

         const $form = document.createElement("form")
         $form.setAttribute("autocomplete", "off")
         $form.classList.add("fuzzy-search")
         const $label = document.createElement("label")
         $label.textContent = this.label
         $label.setAttribute("for", searchId)

         ;[["name", "q"]
         , ["id", searchId]
         , ["type", "search"]
         , ["maxlength", "1000"]
         , ["autocapitalize", "off"]
         , ["autocomplete", "off"]
         , ["spellcheck", "false"]
         , ["title", this.placeholder]
         , ["placeholder", this.placeholder]
         , ["autofocus", "autofocus"]
         , ["aria-controls", listId]
         , ["aria-autocomplete", "both"]
         , ["aria-owns", "sw_as"]
         ].forEach(x => $input.setAttribute(x[0], x[1]))

         ;[["id", listId]
         , ["aria-expanded", "true"]
         , ["role", "combobox"]
         , ["aria-label", "Suggestions"]
         , ["aria-live", "polite"]
         ].forEach(x => $list.setAttribute(x[0], x[1]))

         const handleKeyDownBound = handleKeyDown({ $fuzzySearch: this })
         const handleKeyupBound = handleKeyup({ limit: this.limit, searchList: this.__searchList })
         const handleClickBound = handleClick({ $fuzzySearch: this })

         $input.addEventListener("keydown", handleKeyDownBound)
         $input.addEventListener("focus", handleFocus)
         $input.addEventListener("keyup", handleKeyupBound)
         $list.addEventListener("click", handleClickBound)

         const $div = document.createElement("div")
         $div.classList.add("search-box")
         $div.appendChild($label)
         $div.appendChild($input)
         $form.appendChild($div)
         $form.appendChild($list)
         this.appendChild($form)

         this.__destroy = () => {
            $input.removeEventListener("keydown", handleKeyDownBound)
            $input.removeEventListener("focus", handleFocus)
            $input.removeEventListener("keyup", handleKeyupBound)
            $list.removeEventListener("click", handleClickBound)
         }
      }

      disconnectedCallback() {
         this.__destroy()
      }
   }
   customElements.define("fuzzy-search", FuzzySearch)

   /**** ALGORITHM ****/

   // https://github.com/tad-lispy/node-damerau-levenshtein
   // ts-ignore
   function fuzzySearch(__this, that, limit) {

      var thisLength = __this.length,
            thatLength = that.length,
            matrix = [];

      // If the limit is not defined it will be calculate from this and that args.
      limit = (limit || ((thatLength > thisLength ? thatLength : thisLength)))+1;

      for (var i = 0; i < limit; i++) {
         matrix[i] = [i];
         matrix[i].length = limit;
      }
      for (i = 0; i < limit; i++) {
         matrix[0][i] = i;
      }

      if (Math.abs(thisLength - thatLength) > (limit || 100)){
         return prepare (limit || 100);
      }
      if (thisLength === 0){
         return prepare (thatLength);
      }
      if (thatLength === 0){
         return prepare (thisLength);
      }

      // Calculate matrix.
      var j, this_i, that_j, cost, min, t;
      for (i = 1; i <= thisLength; ++i) {
         this_i = __this[i-1];

         // Step 4
         for (j = 1; j <= thatLength; ++j) {
            // Check the jagged ld total so far
            if (i === j && matrix[i][j] > 4) return prepare (thisLength);

            that_j = that[j-1];
            cost = (this_i === that_j) ? 0 : 1; // Step 5
            // Calculate the minimum (much faster than Math.min(...)).
            min    = matrix[i - 1][j    ] + 1; // Deletion.
            if ((t = matrix[i    ][j - 1] + 1   ) < min) min = t;   // Insertion.
            if ((t = matrix[i - 1][j - 1] + cost) < min) min = t;   // Substitution.

            // Update matrix.
            matrix[i][j] = (i > 1 && j > 1 && this_i === that[j-2] && __this[i-2] === that_j && (t = matrix[i-2][j-2]+cost) < min) ? t : min; // Transposition.
         }
      }

      return prepare (matrix[thisLength][thatLength]);

      function prepare(steps) {
         var length = Math.max(thisLength, thatLength)
         var relative = length === 0
            ? 0
            : (steps / length);
         var similarity = 1 - relative
         return { steps, relative, similarity }
      }
   }
})();
