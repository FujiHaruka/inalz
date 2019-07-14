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
    const sourcePath = 'misc/mock/build/src01.md'
    const targetPaths = {
      ja: os.tmpdir() + '/inalz/translation/translation01.md',
    }
    const localePath = 'misc/mock/build/locale01.yml'
    const expectedPath = 'misc/mock/build/expected01.md'
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
    const sourcePath = 'misc/mock/build/src02.md'
    const targetPaths = {
      ja: os.tmpdir() + '/inalz/translation/translation02.md',
    }
    const localePath = 'misc/mock/build/locale02.yml'
    const expectedPath = 'misc/mock/build/expected02.md'
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
})
