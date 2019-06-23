import os from 'os'
import path from 'path'
import { BuildCommand } from '../command/BuildCommand'
import { Lang } from '../types/InalzConfig'
import { readFile } from '../util/fsUtil'

describe('BuildCommand', () => {
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
    const builder = new BuildCommand({ lang })
    await builder.build({
      sourcePath,
      targetPaths,
      localePath,
    })

    expect(await readFile(targetPaths.ja)).toBe(await readFile(expectedPath))
  })
})
