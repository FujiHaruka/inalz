import { readFile } from '../util/fsUtil'
import { LocaleItemParser } from '../LocaleItemParser'

describe('LocaleItemParser', () => {
  it('parse valid locales successfuly', async () => {
    {
      const yaml = await readFile('misc/mock/locales/valid01.yml')
      const items = LocaleItemParser.parse(yaml)
      expect(items).toBeTruthy()
    }
  })

  it('failed to parse invalid locales', async () => {
    {
      const yaml = await readFile('misc/mock/locales/invalid01.yml')
      expect(() => LocaleItemParser.parse(yaml)).toThrow()
    }
    {
      const yaml = await readFile('misc/mock/locales/invalid02.yml')
      expect(() => LocaleItemParser.parse(yaml)).toThrow()
    }
    {
      const yaml = await readFile('misc/mock/locales/invalid03.yml')
      expect(() => LocaleItemParser.parse(yaml)).toThrow()
    }
  })
})
