import { BUILTIN_ACTIONS } from '../Constants'
import { LocaleItemParser } from '../convert/LocaleItemParser'
import { readFile } from '../util/fsUtil'

describe('LocaleItemParser', () => {
  const LANG = {
    source: 'en',
    targets: ['ja'],
  }
  it('parse valid locales successfuly', async () => {
    {
      const yaml = await readFile('misc/mock/locales/valid01.yml')
      const parser = new LocaleItemParser(LANG)
      const items = parser.parseYaml(yaml)
      expect(items).toBeTruthy()
    }
  })

  it('failed to parse invalid locales', async () => {
    const parser = new LocaleItemParser(LANG)
    {
      const yaml = await readFile('misc/mock/locales/invalid01.yml')
      expect(() => parser.parseYaml(yaml)).toThrow()
    }
    {
      const yaml = await readFile('misc/mock/locales/invalid02.yml')
      expect(() => parser.parseYaml(yaml)).toThrow()
    }
    {
      const yaml = await readFile('misc/mock/locales/invalid03.yml')
      expect(() => parser.parseYaml(yaml)).toThrow()
    }
  })

  it('parseFromSrc', () => {
    const parser = new LocaleItemParser(LANG)
    const item = parser.parseFromSrc('src text')
    expect(item.texts).toEqual({
      en: 'src text',
      ja: BUILTIN_ACTIONS.DEFAULT,
    })
  })
})
