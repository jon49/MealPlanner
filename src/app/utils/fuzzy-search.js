// @ts-check

;(function() {
   /**
    * @typedef Search
    * @property {string} compareValue
    * @property {string} value
    * @property {string | number } id
    */

   const tab = "Tab"
      , arrowUp = "ArrowUp"
      , arrowDown = "ArrowDown"
      , enter = "Enter"
      , shift = "Shift"
      , _escape = "Escape"
   const key = { tab, arrowUp, arrowDown, enter, shift, _escape }

   const commandKeys = [ tab, arrowUp, arrowDown, enter ]

   /**** EVENTS ****/

   /**
    * @param {{$list: HTMLUListElement, $input: HTMLInputElement, $fuzzySearch: FuzzySearch }} param0
    * @returns {(KeyboardEvent) => (false|undefined|void)}
    */
   const handleKeyDown =
      ({ $list, $input, $fuzzySearch }) =>
      e => {
         if (commandKeys.some(x => e.key === x)) {
            if (!e.shiftKey && [key.tab, key.arrowDown].some(x => x === e.key)) {
               if (!$list.firstElementChild) {
                  $input.dispatchEvent(new KeyboardEvent("keydown", { key: key.escape }))
                  return
               }
               var currentChosen = $list.querySelector("li.highlight")
               /**
                * @type {Element | undefined | null}
                */
               let nextChosen
               if (currentChosen) {
                  currentChosen.classList.remove("highlight")
                  nextChosen = (currentChosen.nextElementSibling || $list.querySelector("li:first-child"))
               } else {
                  nextChosen = $list.querySelector("li:first-child")
               }
               if (nextChosen) {
                  nextChosen.classList.add("highlight")
               }
            }
            if (e.key === key.arrowUp || (e.shiftKey && e.key === key.tab)) {
               var currentChosen = $list.querySelector("li.highlight")
               /**
                * @type {(Element | undefined | null)}
                */
               let nextChosen
               if (currentChosen) {
                  currentChosen.classList.remove("highlight")
                  nextChosen = (currentChosen.previousElementSibling || $list.querySelector("li:last-child"))
               } else {
                  nextChosen = $list.querySelector("li:last-child")
               }
               if (nextChosen) {
                  nextChosen.classList.add("highlight")
               }
            }
            if (e.key === key.enter) {
               var currentChosen = $list.querySelector("li.highlight")
               if (currentChosen && currentChosen instanceof HTMLLIElement) {
                  selectValue(currentChosen, $input, $list, $fuzzySearch)
               }
            }
            e.preventDefault()
            return false
         }
      }

   /**
    * Handles Blur Event
    * @param {HTMLUListElement} $list
    * @returns {(e: Event) => void}
    */
   const handleBlur =
      $list =>
      e => {
         setTimeout(() => {
            $list.innerHTML = ""
         }, 2e2)
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
    * @param {{ searchList: Search[], limit: number, $list: HTMLUListElement }} param0 
    * @returns {(e: KeyboardEvent) => void | undefined}
    */
   const handleKeyup =
      ({ $list, searchList, limit }) =>
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
            createULList(fuzzy, {
               limit: limit,
               $list: $list
            })
         }
      }

   /**
    * @param {HTMLUListElement} $list 
    * @returns {() => void}
    */
   const handleMouseEnter =
      $list =>
      () => {
         var currentChosen = $list.querySelector("li.highlight")
         if (currentChosen) {
            currentChosen.classList.remove("highlight")
         }
      }

   /**
    * @param {{ $input: HTMLInputElement, $list: HTMLUListElement, $fuzzySearch: FuzzySearch }} param0
    * @returns {(e: Event) => void}
    */
   const handleClick =
      ({ $input, $list, $fuzzySearch }) =>
      e => {
         e.preventDefault()
         var target = e.target
         if (target instanceof HTMLLIElement) {
            selectValue(target, $input, $list, $fuzzySearch)
         }
      }

   /**
    * @param {HTMLLIElement} li 
    * @param {HTMLInputElement} $input
    * @param {HTMLUListElement} $list
    * @param {FuzzySearch} $fuzzySearch
    */
   function selectValue(li, $input, $list, $fuzzySearch) {
      var id = li.dataset.id
      $input.value = li.textContent || ""
      $list.innerHTML = ""
      $fuzzySearch.dispatchEvent(new CustomEvent("selected", { 
         detail: { value: $input.value, id }
      }))
   }

   /**** HTML CREATION ****/

   /**
    * Create <li> tag
    * @param {{ value: string, id: string | number }} param0 
    */
   function createLI({ value, id }) {
      const li = document.createElement("li")
      li.innerText = value
      li.dataset.id = "" + id
      return li
   }

   /**
    * @param {{ similarity: number, value: string, id: string | number }[]} list 
    * @param {{ limit: number, $list: HTMLUListElement }} options 
    */
   function createULList(list = [], { limit, $list }) {
      let items = document.createDocumentFragment()
      let index = 0
      while (true) {
         const data = list[index]
         if (!data || data.similarity === 0 || index === limit)
            break
         index++
         items.append(createLI(data))
      }

      $list.innerHTML = ""
      if (index === 0) {
         $list.innerHTML = "<p>No items found.</p>"
      } else {
         $list.append(items)
      }
   }

   /**
    * Web component
    */
   class FuzzySearch extends HTMLElement {
      constructor() {
         super()
         this.limit =
            (isNaN(+this.dataset.limit))
               ? 10
            : +this.dataset.limit
         this.label = this.dataset.label || "Search"
         this.placeholder = this.dataset.placeholder || ""
         this.emptyMessage = this.dataset.emptyMessage || "Awaiting data."
         let style = this.dataset.style || document.getElementById("my-style")
         if (!style) {
            const $style = document.createElement("style")
            $style.innerHTML = ".highlight, li:hover { background-color: pink; } li { cursor: pointer; }"
            style = $style
         }
         this.attachShadow({mode: 'open'})

         if (style instanceof HTMLStyleElement) {
            this.__style = style
            this.shadowRoot.appendChild(style)
         }
      }

      /**
       * @param {{ value: string, id: string | number }[]?} list
       */
      set searchList(list) {
         if (list instanceof Array && list.length > 0
            && list[0].id
            && list[0].value && list[0].value.length > 0) {
            /**
             * @type {Search[]}
             */
            this.__searchList = []
            for (var item of list) {
               if (item.id && item.value && item.value.length > 0) {
                  var newItem = { id: item.id, value: item.value, compareValue: item.value.toLowerCase() }
                  this.__searchList.push(newItem)
               }
            }
            this.__setup()
         } else {
            this.noList()
         }
      }

      noList() {
         const $p = document.createElement("p")
         $p.textContent = this.emptyMessage
         this.shadowRoot.innerHTML = ""
         this.shadowRoot.appendChild($p)
      }

      __setup() {
         if (this.__destroy) {
            this.__destroy()
         }
         this.shadowRoot.innerHTML = ""
         this.shadowRoot.appendChild(this.__style)

         const name = `__search${this.id || ""}`

         const $form = document.createElement("form")
         $form.setAttribute("autocomplete", "off")
         const $label = document.createElement("label")
         $label.textContent = this.label
         $label.setAttribute("for", name)

         const $input = document.createElement("input")
         $input.setAttribute("autocomplete", "off")
         $input.setAttribute("placeholder", this.placeholder)
         $input.setAttribute("name", name)

         const $list = document.createElement("ul")

         const handleKeyDownBound = handleKeyDown({ $input, $list, $fuzzySearch: this })
         const handleBlurBound = handleBlur($list)
         const handleKeyupBound = handleKeyup({ $list, limit: this.limit, searchList: this.__searchList })
         const handleMouseEnterBound = handleMouseEnter($list)
         const handleClickBound = handleClick({ $list, $input, $fuzzySearch: this })

         $input.addEventListener("keydown", handleKeyDownBound)
         $input.addEventListener("blur", handleBlurBound)
         $input.addEventListener("focus", handleFocus)
         $input.addEventListener("keyup", handleKeyupBound)
         $list.addEventListener("mouseenter", handleMouseEnterBound)
         $list.addEventListener("click", handleClickBound)

         $form.appendChild($label)
         $form.appendChild($input)
         $form.appendChild($list)
         this.shadowRoot.appendChild($form)

         this.__destroy = () => {
            $input.removeEventListener("keydown", handleKeyDownBound)
            $input.removeEventListener("blur", handleBlurBound)
            $input.removeEventListener("focus", handleFocus)
            $input.removeEventListener("keyup", handleKeyupBound)
            $list.removeEventListener("mouseenter", handleMouseEnterBound)
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
