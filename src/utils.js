
export const group = (list, prop) => list.reduce((ac, l) => ({ ...ac, [l[prop]]: [...(ac[l[prop]] ? ac[l[prop]] : []), l] }), {})

export const objectLoop = (object, mapping) => Object.fromEntries(Object.entries(object).map(mapping))

export function mergeKey(object, id, props = {}) {
  const value = object[id] || props
  return {
    ...object,
    [id]: { ...value, ...props }
  }
}

export const swapListItem = (list, item, property = 'id') => list.map(i => i[property] === item[property] ? item : i)

export const filterOut = (list, item, property = 'id') => list.filter(i => i[property] !== item[property])

export const posmod = (n, p) => ((n % p) + p) % p
