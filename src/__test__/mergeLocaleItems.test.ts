import { BUILTIN_ACTIONS } from '../Constants'
import { mergeLocaleItems } from '../convert/mergeLocaleItems'
import { LocaleItem } from '../core/LocaleItem'
import { Lang } from '../types/InalzConfig'
import { LocaleComponent } from '../types/Locale'

describe('mergeLocaleItems', () => {
  const lang: Lang = {
    source: 'en',
    targets: ['ja'],
  }
  const toPlain = (items: LocaleItem[]) => items.map((item) => item.toObject())
  const toInstance = (items: LocaleComponent.Item[]) =>
    items.map((item) => new LocaleItem(lang, item))
  const filterUsed = (items: LocaleItem[]) =>
    items.filter((item) => !(item.meta && item.meta.unused))

  it('01', () => {
    const prevItems: LocaleItem[] = []
    const nextItems: LocaleItem[] = []
    const items = mergeLocaleItems(prevItems, nextItems)
    expect(items).toEqual([])
  })

  it('02', () => {
    const prevItems: LocaleItem[] = []
    const nextItems: LocaleItem[] = toInstance([
      {
        texts: {
          en: 'a',
          ja: BUILTIN_ACTIONS.DEFAULT,
        },
      },
      {
        texts: {
          en: 'b',
          ja: BUILTIN_ACTIONS.DEFAULT,
        },
      },
    ])
    const items = mergeLocaleItems(prevItems, nextItems)
    expect(filterUsed(items).length).toBe(nextItems.length)
    expect(toPlain(items)).toEqual([
      {
        texts: {
          en: 'a',
          ja: BUILTIN_ACTIONS.DEFAULT,
        },
      },
      {
        texts: {
          en: 'b',
          ja: BUILTIN_ACTIONS.DEFAULT,
        },
      },
    ])
  })

  it('03', () => {
    const prevItems: LocaleItem[] = toInstance([
      {
        texts: {
          en: 'a',
          ja: 'あ',
        },
      },
      {
        texts: {
          en: 'b',
          ja: 'い',
        },
      },
    ])
    const nextItems: LocaleItem[] = []
    const items = mergeLocaleItems(prevItems, nextItems)
    expect(filterUsed(items).length).toBe(nextItems.length)
    expect(toPlain(items)).toEqual([
      {
        meta: {
          unused: true,
        },
        texts: {
          en: 'a',
          ja: 'あ',
        },
      },
      {
        meta: {
          unused: true,
        },
        texts: {
          en: 'b',
          ja: 'い',
        },
      },
    ])
  })

  it('04', () => {
    const prevItems: LocaleItem[] = toInstance([
      {
        texts: {
          en: 'a',
          ja: 'あ',
        },
      },
      {
        texts: {
          en: 'b',
          ja: 'い',
        },
      },
    ])
    const nextItems: LocaleItem[] = toInstance([
      {
        texts: {
          en: 'a',
          ja: BUILTIN_ACTIONS.DEFAULT,
        },
      },
      {
        texts: {
          en: 'bc',
          ja: BUILTIN_ACTIONS.DEFAULT,
        },
      },
    ])
    const items = mergeLocaleItems(prevItems, nextItems)
    expect(filterUsed(items).length).toBe(nextItems.length)
    expect(toPlain(items)).toEqual([
      { texts: { en: 'a', ja: 'あ' } },
      { texts: { en: 'bc', ja: 'い' }, meta: { outdated: true } },
    ])
  })

  it('05', () => {
    const prevItems: LocaleItem[] = toInstance([
      {
        texts: {
          en: 'aaaa',
          ja: 'あ',
        },
      },
      {
        texts: {
          en: 'bbbb',
          ja: 'い',
        },
      },
      {
        texts: {
          en: 'cccc',
          ja: 'う',
        },
      },
      {
        texts: {
          en: 'dddd',
          ja: 'え',
        },
      },
    ])
    const nextItems: LocaleItem[] = toInstance([
      {
        texts: {
          en: 'aaab',
          ja: BUILTIN_ACTIONS.DEFAULT,
        },
      },
      {
        texts: {
          en: 'bbbb',
          ja: BUILTIN_ACTIONS.DEFAULT,
        },
      },
      {
        texts: {
          en: 'cccx',
          ja: BUILTIN_ACTIONS.DEFAULT,
        },
      },
      {
        texts: {
          en: 'dddx',
          ja: BUILTIN_ACTIONS.DEFAULT,
        },
      },
    ])
    const items = mergeLocaleItems(prevItems, nextItems)
    expect(filterUsed(items).length).toBe(nextItems.length)
    expect(toPlain(items)).toEqual([
      { texts: { en: 'aaab', ja: 'あ' }, meta: { outdated: true } },
      { texts: { en: 'bbbb', ja: 'い' } },
      { texts: { en: 'cccx', ja: 'う' }, meta: { outdated: true } },
      { texts: { en: 'dddx', ja: 'え' }, meta: { outdated: true } },
    ])
  })

  it('06', () => {
    const prevItems: LocaleItem[] = toInstance([
      {
        texts: {
          en: 'aaaa',
          ja: 'あ',
        },
      },
      {
        texts: {
          en: 'bbbb',
          ja: 'い',
        },
      },
      {
        texts: {
          en: 'cccc',
          ja: 'う',
        },
      },
      {
        texts: {
          en: 'dddd',
          ja: 'え',
        },
      },
    ])
    const nextItems: LocaleItem[] = toInstance([
      {
        texts: {
          en: 'aaab',
          ja: BUILTIN_ACTIONS.DEFAULT,
        },
      },
      {
        texts: {
          en: 'dddx',
          ja: BUILTIN_ACTIONS.DEFAULT,
        },
      },
    ])
    const items = mergeLocaleItems(prevItems, nextItems)
    expect(filterUsed(items).length).toBe(nextItems.length)
    expect(toPlain(items)).toEqual([
      { texts: { en: 'aaab', ja: 'あ' }, meta: { outdated: true } },
      { texts: { en: 'dddx', ja: 'え' }, meta: { outdated: true } },
      { texts: { en: 'bbbb', ja: 'い' }, meta: { unused: true } },
      { texts: { en: 'cccc', ja: 'う' }, meta: { unused: true } },
    ])
  })

  it('07', () => {
    const prevItems: LocaleItem[] = toInstance([
      {
        texts: {
          en: 'aaaa',
          ja: 'あ',
        },
      },
      {
        texts: {
          en: 'bbbb',
          ja: 'い',
        },
      },
      {
        texts: {
          en: 'cccc',
          ja: 'う',
        },
      },
      {
        texts: {
          en: 'dddd',
          ja: 'え',
        },
      },
      {
        texts: {
          en: 'hello',
          ja: 'ハロー',
        },
      },
      {
        texts: {
          en: 'eeee',
          ja: 'お',
        },
      },
      {
        texts: {
          en: 'ffff',
          ja: 'か',
        },
      },
    ])
    const nextItems: LocaleItem[] = toInstance([
      {
        texts: {
          en: 'aaab',
          ja: BUILTIN_ACTIONS.DEFAULT,
        },
      },
      {
        texts: {
          en: 'bbbx',
          ja: BUILTIN_ACTIONS.DEFAULT,
        },
      },
      {
        texts: {
          en: 'dddx',
          ja: BUILTIN_ACTIONS.DEFAULT,
        },
      },
      {
        texts: {
          en: 'hello',
          ja: BUILTIN_ACTIONS.DEFAULT,
        },
      },
      {
        texts: {
          en: 'ffff',
          ja: BUILTIN_ACTIONS.DEFAULT,
        },
      },
    ])
    const items = mergeLocaleItems(prevItems, nextItems)
    expect(filterUsed(items).length).toBe(nextItems.length)
    // console.log(JSON.stringify(toPlain(items)))
    expect(toPlain(items)).toEqual([
      { texts: { en: 'aaab', ja: 'あ' }, meta: { outdated: true } },
      { texts: { en: 'bbbx', ja: 'い' }, meta: { outdated: true } },
      { texts: { en: 'dddx', ja: 'え' }, meta: { outdated: true } },
      { texts: { en: 'hello', ja: 'ハロー' } },
      { texts: { en: 'ffff', ja: 'か' } },
      { texts: { en: 'cccc', ja: 'う' }, meta: { unused: true } },
      { texts: { en: 'eeee', ja: 'お' }, meta: { unused: true } },
    ])
  })
})
