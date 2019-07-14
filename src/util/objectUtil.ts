import assert from 'assert'

/**
 * deep copy object
 */
export const copy = <T>(object: T) => JSON.parse(JSON.stringify(object)) as T

/**
 * return true if deepStrictEquals() is ok
 */
export const deepEquals = <T>(objA: T, objB: T) => {
  try {
    assert.deepStrictEqual(objA, objB)
    return true
  } catch (e) {
    return false
  }
}

/**
 * bind value functions to "this"
 */
export const bind = <T extends { [name: string]: Function }>(obj: T): T => {
  const bound = { ...obj }
  for (const name of Object.keys(obj) as [keyof T]) {
    bound[name] = bound[name].bind(bound)
  }
  return bound
}
