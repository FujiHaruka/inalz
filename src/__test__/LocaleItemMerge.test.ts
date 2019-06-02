import { LocaleComponent } from '../types/Locale'
import { LocaleItemMerge } from '../LocaleItemMerge'
import { InalzConfigComponent } from '../types/InalzConfig'
import { Locale } from '../Locale'

describe('LocaleMerge', () => {
  it('mergeItems', () => {
    const lang: InalzConfigComponent.Lang = {
      source: 'en',
      targets: ['ja'],
    }
    const oldItems: LocaleComponent.Item[] = [
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
    ]
    const newItems: LocaleComponent.Item[] = [
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
    ]
    const items = LocaleItemMerge.mergeItems(lang, oldItems, newItems)

    const locale = new Locale(lang, items)
    // has old item translation
    expect(locale.getTranslation('ja', 'Luke')).toBe('ルーク')
    // new item is added
    expect(locale.getTranslation('ja', 'Mark')).toBe('__COPY__')
    // old item is outdated
    expect(locale.getItem('John')!.meta!.outdated).toBeTruthy()
  })
})
