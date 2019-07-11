import os from 'os'
import { BuildCommand } from '../command/BuildCommand'
import { Lang } from '../types/InalzConfig'
import { readFile } from '../util/fsUtil'
import { InalzConfigDefaultOptions } from '../config/InalzConfig'

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
    await new BuildCommand({
      baseDir: '',
      lang,
      document: {
        sourcePath,
        targetPaths,
        localePath,
      },
      options: InalzConfigDefaultOptions,
    }).build()

    expect(await readFile(targetPaths.ja)).toBe(await readFile(expectedPath))
  })

  it('02: issue #7', async () => {
    const sourcePath = 'misc/mock/translator/src02.md'
    const targetPaths = {
      ja: os.tmpdir() + '/inalz/translation/translation02.md',
    }
    const localePath = 'misc/mock/translator/locale02.yml'
    const expectedPath = 'misc/mock/translator/expected02.md'
    await new BuildCommand({
      baseDir: '',
      lang,
      document: {
        sourcePath,
        targetPaths,
        localePath,
      },
      options: InalzConfigDefaultOptions,
    }).build()

    expect(await readFile(targetPaths.ja)).toBe(await readFile(expectedPath))
  })

  it('replace method', () => {
    const builder = new BuildCommand({
      baseDir: '',
      lang,
      document: {
        sourcePath: 'sourcePath',
        targetPaths: {},
        localePath: '',
      },
      options: InalzConfigDefaultOptions,
    })
    builder.strict = true

    expect(() => builder.replace('hello', 'not matched', '', {})).toThrow()
  })
})
