import os from 'os'
import { Translator } from '../Translator'
import { Lang } from '../types/InalzConfig'
import { readFile } from '../util/fsUtil'

describe('Translator', () => {
  it('01', async () => {
    const sourcePath = 'misc/mock/translator/src01.md'
    const targetPaths = {
      ja: os.tmpdir() + '/inalz/translation/translation01.md',
    }
    const localePath = 'misc/mock/translator/locale01.yml'
    const expectedPath = 'misc/mock/translator/expected01.md'
    const lang: Lang = {
      source: 'en',
      targets: ['ja'],
    }
    const translator = new Translator(lang)
    await translator.translate({
      linkMode: 'path',
      sourcePath,
      targetPaths,
      localePath,
    })

    expect(await readFile(targetPaths.ja)).toBe(await readFile(expectedPath))
  })
})
