export function random(start : number, end : number) {
	return ((Math.random() * (end - start + 1))|0) + start
}

export function range(start : number, count : number) {
  var array = new Array(count)
  for (var i = start; i < count + start; i++)
    array[i - start] = i
  return array
}

export function anchor(link : string, text :string ) : HTMLAnchorElement {
   var a = document.createElement("a")
   var href = !link.startsWith("http") && link[0] !== "/" ? `//${link}` : link
   a.href = href
   a.textContent = text
   return a
}
