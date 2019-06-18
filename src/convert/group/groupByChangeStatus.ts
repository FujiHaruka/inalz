import { ChangeStatus, UniqKey, ItemGroup } from './Group'
import { indexFinder, groupIndexesByStatus, switchStatus } from './groupUtil'

/**
 * ChangeStatus によって group 分けする
 */
export const groupByChangeStatus = <T extends UniqKey>(
  prevItems: T[],
  nextItems: T[],
): ItemGroup<T>[] => {
  if (nextItems.length === 0) {
    return [
      {
        status: ChangeStatus.DEC,
        items: nextItems,
        prevItems,
      },
    ]
  }

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

  const groups: ItemGroup<T>[] = groupHeadIndexes.map((headIndex, i) => {
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
