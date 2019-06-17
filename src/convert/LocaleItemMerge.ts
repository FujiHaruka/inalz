import { LocaleItem } from '../core/LocaleItem'
import { groupByChangeStatus } from './group/groupByChangeStatus'
import { ItemGroup } from './group/Group'

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
    const groups = groupByChangeStatus(prevItems, nextItems)

    const findNextItemIndex = itemIndexFinder(nextItems)

    const mergedItems = groups.flatMap((group) => {
      return cond(
        group.status,
        () => {
          // 新しい item がないので既存の item を返す
          return group.prevItems.map((item) => {
            if (findNextItemIndex(item.getSourceText()) < 0) {
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
