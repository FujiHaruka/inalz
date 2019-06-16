import { LocaleItem } from '../core/LocaleItem'

enum ChangeStatus {
  /** unchanged or removed */
  NO_NEW = 'n',
  /** editted or added */
  HAS_NEW = 'h',
}

type ItemGroup = {
  status: ChangeStatus
  items: LocaleItem[]
  prevItems: LocaleItem[]
}

const cond = <T>(
  status: ChangeStatus,
  onNoNew: () => T,
  onHasNew: () => T,
): T => {
  switch (status) {
    case ChangeStatus.NO_NEW:
      return onNoNew()
    case ChangeStatus.HAS_NEW:
      return onHasNew()
    default:
      throw new Error("won't reach here")
  }
}

const mapForFindItem = (items: LocaleItem[]) => {
  const entries = items
    .filter((item) => Boolean(item.getSourceText()))
    .map((item, index) => [item.getSourceText()!, index] as const)
  return Object.fromEntries(entries) as { [src: string]: number }
}

const itemIndexFinder = (items: LocaleItem[]) => {
  const mapped = mapForFindItem(items)
  return (srcText: string) =>
    Number.isFinite(mapped[srcText]) ? mapped[srcText] : -1
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

const findClosest = (item: LocaleItem, items: LocaleItem[]) => {
  // TODO: implement
  return items[0]
}

const dropItem = (target: LocaleItem, items: LocaleItem[]) => {
  return items.filter((item) => item.getSourceText() !== target.getSourceText())
}

const merge = (group: ItemGroup) => {
  const items: LocaleItem[] = []
  let prevItems = [...group.prevItems]
  for (const item of group.items) {
    const prevItem = findClosest(item, prevItems)
    if (prevItem) {
      prevItems = dropItem(prevItem, prevItems)
      // merge
      prevItem.texts[prevItem.lang.source] = item.getSourceText() || ''
      prevItem.meta = prevItem.meta || {}
      prevItem.meta.outdated = true
      items.push(prevItem)
    } else {
      items.push(item)
    }
  }
  return items
}

export class LocaleItemMerge {
  mergeItems(prevItems: LocaleItem[], nextItems: LocaleItem[]) {
    // FIXME: index が -1 以外単調増加にならないと
    const findPrevItemIndex = itemIndexFinder(prevItems)
    const findNextItemIndex = itemIndexFinder(nextItems)

    // Has the same length as nextItems
    const prevIndexes = nextItems.map((item) =>
      findPrevItemIndex(item.getSourceText()!),
    )
    const statuses = prevIndexes.map((index) =>
      index > -1 ? ChangeStatus.NO_NEW : ChangeStatus.HAS_NEW,
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

      const prevStart = cond(
        status,
        () => {
          return prevIndexes[headIndex]
        },
        () => {
          const beforeHeadPrevIndex = prevIndexes[headIndex - 1]
          return Number.isFinite(beforeHeadPrevIndex)
            ? beforeHeadPrevIndex + 1
            : 0
        },
      )
      const prevEnd = cond(
        status,
        () => {
          const tailPrevIndex = prevIndexes[nextHeadIndex - 1]
          return Number.isFinite(tailPrevIndex) ? tailPrevIndex + 1 : undefined
        },
        () => {
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

    const mergedItems = groups.flatMap((group) => {
      return cond(
        group.status,
        () => {
          // 新しい item がないので既存の item を返す
          return group.prevItems.map((item) => {
            if (findNextItemIndex(item.getSourceText()!) < 0) {
              item.meta = item.meta || {}
              // TODO: あとでsortして後ろに回す
              item.meta.unused = true
            }
            return item
          })
        },
        () => {
          // edit or add
          const isAdd = group.prevItems.length === 0
          if (isAdd) {
            return group.items
          }
          return merge(group)
        },
      )
    })

    return mergedItems
  }
}
