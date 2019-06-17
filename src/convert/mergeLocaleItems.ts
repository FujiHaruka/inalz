import { LocaleItem } from '../core/LocaleItem'
import { groupByChangeStatus } from './group/groupByChangeStatus'
import { mergeLocaleGroup } from './group/mergeLocaleGroup'

export const mergeLocaleItems = (
  prevItems: LocaleItem[],
  nextItems: LocaleItem[],
): LocaleItem[] => {
  const groups = groupByChangeStatus(prevItems, nextItems)
  const items = groups.flatMap(mergeLocaleGroup)
  // TODO: unused をソートで後ろに
  return items
}
