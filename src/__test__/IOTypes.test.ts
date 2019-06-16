import * as t from 'io-ts'
import { IOInalzConfig } from '../config/IOInalzConfig'
import { IOLocaleItem } from '../convert/IOLocaleItem'
import { InalzConfigInterface } from '../types/InalzConfig'
import { copy } from '../util/objectUtil'
import { LocaleComponent } from '../types/Locale'

describe('IOTypes', () => {
  it('IOInalzConfig static type checking', () => {
    type IOInalzConfigType = t.TypeOf<typeof IOInalzConfig>

    const x: InalzConfigInterface = (null as any) as IOInalzConfigType
    const y: IOInalzConfigType = (null as any) as InalzConfigInterface

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
          linkMode: 'filename',
          contentDir: 'dir/to/contents',
          localeDir: 'dir/to/locales',
        },
        {
          linkMode: 'directory',
          contentDir: 'dir/to/contents',
          localeDir: 'dir/to/locales',
        },
        {
          linkMode: 'path',
          source: 'path/to/source.md',
          targets: {
            ja: 'path/to/target.md',
          },
          locale: 'path/to/locale.yml',
        },
      ],
      options: {
        paragraphIgnorePatterns: ['^ignore'],
      },
    }
    {
      const validation = IOInalzConfig.decode(CONFIG)
      expect(validation.isRight()).toBeTruthy()
      if (validation.isLeft()) {
        throw new Error()
      }
      expect(validation.value.options!.paragraphIgnorePatterns).toEqual([
        '^ignore',
      ])
    }
    {
      const config = copy(CONFIG)
      delete config.lang
      const validation = IOInalzConfig.decode(config)
      expect(validation.isLeft()).toBeTruthy()
    }
    {
      const config = copy(CONFIG)
      config.documents = [
        {
          linkMode: 'directory', // invalid linkMode
          source: 'path/to/source.md',
          targets: {
            ja: 'path/to/target.md',
          },
          locale: 'path/to/locale.yml',
        } as any,
      ]
      const validation = IOInalzConfig.decode(config)
      expect(validation.isLeft()).toBeTruthy()
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
      expect(validation.isRight()).toBeTruthy()
    }
    {
      const item = copy(ITEM)
      delete item.meta
      const validation = IOLocaleItem.decode(item)
      expect(validation.isRight()).toBeTruthy()
    }
    {
      const item = copy(ITEM)
      item.texts = ['text'] as any
      const validation = IOLocaleItem.decode(item)
      expect(validation.isLeft()).toBeTruthy()
    }
  })
})
