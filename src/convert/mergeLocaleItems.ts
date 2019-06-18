import { LocaleItem } from '../core/LocaleItem'
import { groupByChangeStatus } from './group/groupByChangeStatus'
import { mergeLocaleGroup } from './group/mergeLocaleGroup'

const numeric = (item: LocaleItem) => {
  if (item.meta && item.meta.unused) {
    return 1
  } else {
    return 0
  }
}

const compareByUnused = (itemA: LocaleItem, itemB: LocaleItem) =>
  numeric(itemA) - numeric(itemB)

export const mergeLocaleItems = (
  prevItems: LocaleItem[],
  nextItems: LocaleItem[],
): LocaleItem[] => {
  const groups = groupByChangeStatus(prevItems, nextItems)
  const items = groups.flatMap(mergeLocaleGroup).sort(compareByUnused)
  return items
}
