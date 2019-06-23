import { LocaleItem } from '../core/LocaleItem'
import { Lang } from '../types/InalzConfig'

describe('LocaleItem', () => {
  const lang: Lang = {
    source: 'en',
    targets: ['ja'],
  }
  it('invalid locale item', () => {
    expect(
      () =>
        new LocaleItem(lang, {
          texts: {
            // en: 'English',
            ja: '日本語',
          },
        }),
    ).toThrow()
  })
})
