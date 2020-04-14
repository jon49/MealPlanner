export function random(start : number, end : number) {
	return ((Math.random() * (end - start + 1))|0) + start
}

export function range(start : number, count : number) {
  var array = new Array(count)
  for (var i = start; i < count + start; i++)
    array[i - start] = i
  return array
}
