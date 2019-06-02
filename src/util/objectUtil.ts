import assert from 'assert'

export const copy = <T>(object: T) => JSON.parse(JSON.stringify(object)) as T

export const deepEquals = <T>(objA: T, objB: T) => {
  try {
    assert.deepStrictEqual(objA, objB)
    return true
  } catch (e) {
    return false
  }
}
