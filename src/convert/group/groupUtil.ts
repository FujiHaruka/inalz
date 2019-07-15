import { ChangeStatus, UniqKey } from './Group'

export const switchStatus = <T>(
  status: ChangeStatus,
  onDec: () => T,
  onInc: () => T,
): T => {
  switch (status) {
    case ChangeStatus.DEC:
      return onDec()
    case ChangeStatus.INC:
      return onInc()
    default:
      throw new Error("won't reach here")
  }
}

/**
 * findIndex() 関数を返す。
 * 内部的に副作用がある。同じ key をもつ item が複数あるとき、次の index を探すようにする
 * そのため、同一 key による findIndx(key) を複数回実行すると返り値が変わり、最終的に undefined になる
 */
export const indexFinder = (items: UniqKey[]) => {
  const keyIndexes = Object.fromEntries(
    items.map(({ key }) => [key, [] as number[]]),
  )
  items.forEach(({ key }, index) => keyIndexes[key].push(index))
  return function findIndex(key: string) {
    const index = (keyIndexes[key] || []).shift()
    return index === undefined ? -1 : index
  }
}

export const groupIndexesByStatus = (statuses: ChangeStatus[]): number[] => {
  let groupIndex = -1
  let groupStatus = (null as any) as ChangeStatus
  const indexes = statuses.map((status) => {
    const changed = groupStatus !== status
    if (changed) {
      groupStatus = status
      groupIndex += 1
    }
    return groupIndex
  })
  return indexes
}
