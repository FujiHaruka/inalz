import { LocaleItem } from '../core/LocaleItem'

export class LocaleItemMerge {
  mergeItems(oldItems: LocaleItem[], newItems: LocaleItem[]): LocaleItem[] {
    // 重複している item は oldItems を使う
    const equals = (itemA: LocaleItem, itemB: LocaleItem) =>
      itemA.getSourceText() === itemB.getSourceText()
    const duplicatedIndexPairs = newItems.flatMap((item, i) => {
      const j = oldItems.findIndex((itemB) => equals(item, itemB))
      if (j >= 0) {
        return [[i, j] as const]
      } else {
        return []
      }
    })
    const mergedItems = [...newItems]
    for (const [newIndex, oldIndex] of duplicatedIndexPairs) {
      mergedItems[newIndex] = oldItems[oldIndex]
    }

    // 重複していない oldItem は outdated にして後ろにつける
    const outdatedItems = oldItems
      .filter((item) => !newItems.find((itemB) => equals(item, itemB)))
      .map((item) => {
        item.meta = item.meta || {}
        item.meta.outdated = true
        return item
      })
    return mergedItems.concat(outdatedItems)
  }
}
