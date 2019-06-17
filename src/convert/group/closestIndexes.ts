import Levenshtein from 'fast-levenshtein'

const findMinIndex = (nums: number[]) => {
  let index = -1
  let min = Infinity
  nums.forEach((n, i) => {
    if (n < min) {
      min = n
      index = i
    }
  })
  return index
}

export const closestFinder = (strings: string[]) => {
  if (strings.length === 0) {
    throw new Error(`length === 0`)
  }
  return function find(str: string) {
    const distances = strings.map((s) => Levenshtein.get(s, str))
    const index = findMinIndex(distances)
    return {
      index,
      distance: distances[index],
    }
  }
}

/**
 * find closest pairs and output indexes
 * 1. 各 prev について編集距離が最小のものを見つける
 * 2. 各 next についてそれを指す prev のうち編集距離最小のものを選ぶ
 * 3. next に対応する prev index を出力する。存在しなければ -1
 */
export const closestIndexes = (prevs: string[], nexts: string[]): number[] => {
  if (nexts.length === 0) {
    return []
  }
  if (prevs.length === 0) {
    return Array(nexts.length).fill(-1)
  }
  const findClosest = closestFinder(nexts)
  const closestIndexesForPrevs = prevs
    .map(findClosest)
    .map(({ distance, index }, prevIndex) => ({
      distance,
      nextIndex: index,
      prevIndex,
    }))
  const pairs = nexts.map((_, index) => {
    const prevCandidates = closestIndexesForPrevs.filter(
      ({ nextIndex }) => nextIndex === index,
    )
    if (prevCandidates.length === 0) {
      return -1
    }
    const i = findMinIndex(prevCandidates.map(({ distance }) => distance))
    return prevCandidates[i].prevIndex
  })
  return pairs
}
