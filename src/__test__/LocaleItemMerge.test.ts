import { LocaleItemMerge } from '../convert/LocaleItemMerge'
import { Lang } from '../types/InalzConfig'
import { Locale } from '../core/Locale'
import { LocaleItem } from '../core/LocaleItem'

describe('LocaleMerge', () => {
  it('mergeItems', () => {
    const lang: Lang = {
      source: 'en',
      targets: ['ja'],
    }
    const oldItems: LocaleItem[] = [
      {
        texts: {
          en: 'John',
          ja: 'ジョン',
        },
      },
      {
        texts: {
          en: 'Luke',
          ja: 'ルーク',
        },
      },
    ].map((item) => new LocaleItem(lang, item))
    const newItems: LocaleItem[] = [
      {
        texts: {
          en: 'Luke',
          ja: '__COPY__',
        },
      },
      {
        texts: {
          en: 'Mark',
          ja: '__COPY__',
        },
      },
    ].map((item) => new LocaleItem(lang, item))
    const items = new LocaleItemMerge().mergeItems(oldItems, newItems)

    const locale = new Locale(lang, items)
    // has old item translation
    expect(locale.getItem('Luke')!.getText('ja')).toBe('ルーク')
    // new item is added
    expect(locale.getItem('Mark')!.getText('ja')).toBe('__COPY__')
    // old item is outdated
    expect(locale.getItem('John')!.meta!.outdated).toBeTruthy()
  })
})
