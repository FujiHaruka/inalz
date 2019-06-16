import { LocaleItemMerge } from '../convert/LocaleItemMerge'
import { Lang } from '../types/InalzConfig'
import { Locale } from '../core/Locale'
import { LocaleItem } from '../core/LocaleItem'
import { LocaleComponent } from '../types/Locale'

describe('LocaleMerge', () => {
  it('mergeItems 01', () => {
    const lang: Lang = {
      source: 'en',
      targets: ['ja'],
    }
    const asItem = (item: LocaleComponent.Item) => new LocaleItem(lang, item)
    const itemsFromStr = (str: string) =>
      str
        .split('')
        .map((en) => ({
          texts: {
            en,
            ja: '',
          },
        }))
        .map(asItem)
    {
      const prevItems = itemsFromStr('abcdefghij')
      const nextItems = itemsFromStr('abxydfgzhwk')

      const items = new LocaleItemMerge().mergeItems(prevItems, nextItems)
      console.log(JSON.stringify(items, null, 2))
    }
    {
      const prevItems = itemsFromStr('abcdefghij')
      const nextItems = itemsFromStr('xyabclmnij')

      const items = new LocaleItemMerge().mergeItems(prevItems, nextItems)
      console.log(JSON.stringify(items, null, 2))
    }

    // const locale = new Locale(lang, items)
    // // has old item translation
    // expect(locale.getItem('Luke')!.getText('ja')).toBe('ルーク')
    // // new item is added
    // expect(locale.getItem('Mark')!.getText('ja')).toBe('__COPY__')
    // // old item is outdated
    // expect(locale.getItem('John')!.meta!.outdated).toBeTruthy()
  })
})
