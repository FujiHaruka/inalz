import * as t from 'io-ts'
import { IOInalzConfig } from '../config/IOInalzConfig'
import { IOLocaleItem } from '../convert/IOLocaleItem'
import { InalzConfigInterface } from '../types/InalzConfig'
import { LocaleComponent } from '../types/Locale'
import { copy } from '../util/objectUtil'
import { isRight, isLeft } from 'fp-ts/lib/Either'

describe('IOTypes', () => {
  it('IOInalzConfig static type checking', () => {
    type IOInalzConfigType = t.TypeOf<typeof IOInalzConfig>

    const x: InalzConfigInterface = (null as any) as IOInalzConfigType
    const y: IOInalzConfigType = (null as any) as InalzConfigInterface

    // meaningless
    expect(x).toBe(null)
    expect(y).toBe(null)
  })

  it('IOLocaleItem static type checking', () => {
    type IOLocaleItemType = t.TypeOf<typeof IOLocaleItem>

    const x: LocaleComponent.Item = (null as any) as IOLocaleItemType
    const y: IOLocaleItemType = (null as any) as LocaleComponent.Item

    // meaningless
    expect(x).toBe(null)
    expect(y).toBe(null)
  })

  it('IOInalzConfig', () => {
    const CONFIG: InalzConfigInterface = {
      lang: {
        source: 'en',
        targets: ['ja'],
      },
      documents: [
        {
          source: 'path/to/source.md',
          targets: {
            ja: 'path/to/target.md',
          },
          locale: 'path/to/locale.yml',
        },
        {
          source: 'path2/to/source.md',
          targets: {
            ja: 'path2/to/target.md',
          },
          locale: 'path2/to/locale.yml',
        },
      ],
      options: {
        paragraphIgnorePatterns: ['^ignore'],
      },
    }
    {
      const validation = IOInalzConfig.decode(CONFIG)
      expect(isRight(validation)).toBeTruthy()
      if (isLeft(validation)) {
        throw new Error()
      }
      expect(validation.right.options!.paragraphIgnorePatterns).toEqual([
        '^ignore',
      ])
    }
    {
      const config = copy(CONFIG)
      delete config.lang
      const validation = IOInalzConfig.decode(config)
      expect(isLeft(validation)).toBeTruthy()
    }
  })

  it('IOLocaleItem', () => {
    const ITEM: LocaleComponent.Item = {
      meta: {
        outdated: false,
        warnings: ['some warning'],
      },
      texts: {
        en: 'hello',
        ja: 'ハロー',
      },
    }
    {
      const validation = IOLocaleItem.decode(ITEM)
      expect(isRight(validation)).toBeTruthy()
    }
    {
      const item = copy(ITEM)
      delete item.meta
      const validation = IOLocaleItem.decode(item)
      expect(isRight(validation)).toBeTruthy()
    }
    {
      const item = copy(ITEM)
      item.texts = ['text'] as any
      const validation = IOLocaleItem.decode(item)
      expect(isLeft(validation)).toBeTruthy()
    }
  })
})
