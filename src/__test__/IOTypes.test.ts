import { IOInalzConfig, IOLocaleItem } from '../IOTypes'
import {
  InalzConfigInterface,
  InalzConfigComponent,
} from '../types/InalzConfig'
import { copy } from '../util/objectUtil'
import { LocaleComponent } from '../types/Locale'

describe('IOTypes', () => {
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
          sourcePath: 'path/to/source.md',
          targetPaths: {
            ja: 'path/to/target.md',
          },
          localePath: 'path/to/locale.yml',
        },
      ],
      vocabularies: ['path/to/vocabulary.yml'],
    }
    {
      const validation = IOInalzConfig.decode(CONFIG)
      expect(validation.isRight()).toBeTruthy()
    }
    {
      const config = copy(CONFIG)
      delete config.vocabularies
      const validation = IOInalzConfig.decode(config)
      expect(validation.isRight()).toBeTruthy()
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
          sourcePath: 'path/to/source.md',
          targetPaths: {
            ja: 'path/to/target.md',
          },
          localePath: 'path/to/locale.yml',
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
