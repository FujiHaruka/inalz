import { ItemGroup, UniqKey } from './Group'
import { switchStatus, indexFinder } from './groupUtil'
import { LocaleItem } from '../../core/LocaleItem'
import { closestIndexes } from './closestIndexes'

const mapKey = (items: UniqKey[]) => items.map((i) => i.key)

export const mergeLocaleGroup = (group: ItemGroup<LocaleItem>) =>
  switchStatus(
    group.status,
    function onDec() {
      const findIndex = indexFinder(group.items)
      // 新しい item がないが、unused な item はありえる
      return group.prevItems.map((item) => {
        const isUnused = findIndex(item.key) < 0
        if (isUnused) {
          item.setMeta({ unused: true })
        }
        return item
      })
    },
    function onInc() {
      const prevIndexes = closestIndexes(
        mapKey(group.prevItems),
        mapKey(group.items),
      )
      const unusedItems = group.prevItems
        .filter((_, i) => !prevIndexes.includes(i))
        .map((item) => {
          item.setMeta({ unused: true })
          return item
        })
      return prevIndexes
        .map((prevIndex, i) => {
          if (prevIndex < 0) {
            // 対応する prevItem がないので新規 item
            const item = group.items[i]
            return item
          } else {
            // 対応する prevItem があるので marge
            const item = group.prevItems[prevIndex]
            const newItem = group.items[i]
            item.setSourceText(newItem.getSourceText())
            if (!item.isInitialState()) {
              item.setMeta({ outdated: true })
            }
            return item
          }
        })
        .concat(unusedItems)
    },
  )
