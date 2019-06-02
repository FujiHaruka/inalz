import { readFile } from '../util/fsUtil'
import { LocaleItemParser } from '../LocaleItemParser'

describe('LocaleItemParser', () => {
  const LANG = {
    source: 'en',
    targets: ['ja'],
  }
  it('parse valid locales successfuly', async () => {
    {
      const yaml = await readFile('misc/mock/locales/valid01.yml')
      const parser = new LocaleItemParser(LANG)
      const items = parser.parse(yaml)
      expect(items).toBeTruthy()
    }
  })

  it('failed to parse invalid locales', async () => {
    const parser = new LocaleItemParser(LANG)
    {
      const yaml = await readFile('misc/mock/locales/invalid01.yml')
      expect(() => parser.parse(yaml)).toThrow()
    }
    {
      const yaml = await readFile('misc/mock/locales/invalid02.yml')
      expect(() => parser.parse(yaml)).toThrow()
    }
    {
      const yaml = await readFile('misc/mock/locales/invalid03.yml')
      expect(() => parser.parse(yaml)).toThrow()
    }
  })
})
