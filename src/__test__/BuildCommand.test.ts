import os from 'os'
import { BuildCommand } from '../command/BuildCommand'
import { Lang } from '../types/InalzConfig'
import { readFile } from '../util/fsUtil'

describe('BuildCommand', () => {
  const lang: Lang = {
    source: 'en',
    targets: ['ja'],
  }

  it('01', async () => {
    const sourcePath = 'misc/mock/translator/src01.md'
    const targetPaths = {
      ja: os.tmpdir() + '/inalz/translation/translation01.md',
    }
    const localePath = 'misc/mock/translator/locale01.yml'
    const expectedPath = 'misc/mock/translator/expected01.md'
    await new BuildCommand(
      { lang },
      {
        sourcePath,
        targetPaths,
        localePath,
      },
    ).build()

    expect(await readFile(targetPaths.ja)).toBe(await readFile(expectedPath))
  })

  it('replace method', () => {
    const builder = new BuildCommand(
      {
        lang,
      },
      {
        sourcePath: 'sourcePath',
        targetPaths: {},
        localePath: '',
      },
    )
    builder.strict = true

    expect(() => builder.replace('hello', 'not matched', '', {})).toThrow()
  })
})
