import os from 'os'
import path from 'path'
import { Translator } from '../command/Translator'
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
    const cwd = path.resolve(__dirname, '../..')
    const translator = new Translator(cwd, { lang })
    await translator.translate({
      sourcePath,
      targetPaths,
      localePath,
    })

    expect(await readFile(targetPaths.ja)).toBe(await readFile(expectedPath))
  })
})
