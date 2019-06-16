import { ChangeStatus, UniqKey, ItemGroup } from '../types/Group'

const switchStatus = <T>(
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

const indexFinder = (items: UniqKey[]) => {
  const entries = items.map(({ key }, index) => [key, index] as const)
  const keyIndexes = Object.fromEntries(entries) as { [key: string]: number }
  return function findIndex(key: string) {
    return Number.isFinite(keyIndexes[key]) ? keyIndexes[key] : -1
  }
}

const groupIndexesByStatus = (statuses: ChangeStatus[]): number[] => {
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

/**
 * ChangeStatus によって group 分けする
 */
export const groupByChangeStatus = (
  prevItems: UniqKey[],
  nextItems: UniqKey[],
): ItemGroup[] => {
  // NOTE: items が一意でないと index が -1 以外単調増加になることを保証できない
  const findPrevIndex = indexFinder(prevItems)

  // Has the same length as nextItems
  const prevIndexes = nextItems.map((item) => findPrevIndex(item.key))
  const statuses = prevIndexes.map((index) =>
    index > -1 ? ChangeStatus.DEC : ChangeStatus.INC,
  )
  const groupIndexes = groupIndexesByStatus(statuses)

  const groupHeadIndexes = groupIndexes.flatMap((groupIndex, itemIndex) => {
    if (groupIndexes[itemIndex - 1] === groupIndex) {
      return []
    } else {
      return [itemIndex]
    }
  })

  const groups: ItemGroup[] = groupHeadIndexes.map((headIndex, i) => {
    const nextHeadIndex: number | undefined = groupHeadIndexes[i + 1]
    const status = statuses[headIndex]
    // nextHeadIndex が undefined でもちゃんと動く
    const items = nextItems.slice(headIndex, nextHeadIndex)

    const prevStart = switchStatus(
      status,
      function onDec() {
        // 最初のグループなら先頭の要素が削除されているかもしれない
        if (i === 0) {
          return 0
        }
        return prevIndexes[headIndex]
      },
      function onInc() {
        const beforeHeadPrevIndex = prevIndexes[headIndex - 1]
        return Number.isFinite(beforeHeadPrevIndex)
          ? beforeHeadPrevIndex + 1
          : 0
      },
    )
    const prevEnd = switchStatus(
      status,
      function onDec() {
        const tailPrevIndex = prevIndexes[nextHeadIndex - 1]
        return Number.isFinite(tailPrevIndex) ? tailPrevIndex + 1 : undefined
      },
      function onInc() {
        const afterTailPrevIndex = prevIndexes[nextHeadIndex]
        return Number.isFinite(afterTailPrevIndex)
          ? afterTailPrevIndex
          : undefined
      },
    )

    return {
      status,
      items,
      prevItems: prevItems.slice(prevStart, prevEnd),
    }
  })
  return groups
}
