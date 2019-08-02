import os from 'os'
import { BuildCommand } from '../command/BuildCommand'
import { Lang, InalzMiddleware } from '../types/InalzConfig'
import { readFile } from '../util/fsUtil'
import {
  InalzConfigDefaultOptions,
  InalzConfigDefaultMiddlewareModules,
} from '../config/InalzConfig'

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
    const results = await new BuildCommand({
      baseDir: '',
      lang,
      document: {
        sourcePath,
        targetPaths,
        localePath,
      },
      options: InalzConfigDefaultOptions,
      middlewareModules: InalzConfigDefaultMiddlewareModules,
    }).build()

    expect(results.filter(({ err }) => Boolean(err))).toEqual([])
    expect(await readFile(targetPaths.ja)).toBe(await readFile(expectedPath))
  })

  it('02: issue #7', async () => {
    const sourcePath = 'misc/mock/build/src02.md'
    const targetPaths = {
      ja: os.tmpdir() + '/inalz/translation/translation02.md',
    }
    const localePath = 'misc/mock/build/locale02.yml'
    const expectedPath = 'misc/mock/build/expected02.md'
    const results = await new BuildCommand({
      baseDir: '',
      lang,
      document: {
        sourcePath,
        targetPaths,
        localePath,
      },
      options: InalzConfigDefaultOptions,
      middlewareModules: InalzConfigDefaultMiddlewareModules,
    }).build()

    expect(results.filter(({ err }) => Boolean(err))).toEqual([])
    expect(await readFile(targetPaths.ja)).toBe(await readFile(expectedPath))
  })

  it('03', async () => {
    const sourcePath = 'misc/mock/build/src03.md'
    const targetPaths = {
      ja: os.tmpdir() + '/inalz/translation/translation03.md',
    }
    const localePath = 'misc/mock/build/locale03.yml'
    const expectedPath = 'misc/mock/build/expected03.md'
    const results = await new BuildCommand({
      baseDir: '',
      lang,
      document: {
        sourcePath,
        targetPaths,
        localePath,
      },
      options: {
        ...InalzConfigDefaultOptions,
        lineIgnorePatterns: [
          '^\\s*{% \\w+ %}\\s*$',
          '^{% sample lang="yaml" %}$',
        ],
      },
      middlewareModules: InalzConfigDefaultMiddlewareModules,
    }).build()
    expect(results.filter(({ err }) => Boolean(err))).toEqual([])
    expect(await readFile(targetPaths.ja)).toBe(await readFile(expectedPath))
  })

  it('04', async () => {
    const sourcePath = 'misc/mock/build/src04.md'
    const targetPaths = {
      ja: os.tmpdir() + '/inalz/translation/translation04.md',
    }
    const localePath = 'misc/mock/build/locale04.yml'
    const expectedPath = 'misc/mock/build/expected04.md'
    const results = await new BuildCommand({
      baseDir: '',
      lang,
      document: {
        sourcePath,
        targetPaths,
        localePath,
      },
      options: {
        ...InalzConfigDefaultOptions,
      },
      middlewareModules: InalzConfigDefaultMiddlewareModules,
    }).build()
    expect(results.filter(({ err }) => Boolean(err))).toEqual([])
    expect(await readFile(targetPaths.ja)).toBe(await readFile(expectedPath))
  })

  it('05: allow empty document', async () => {
    const sourcePath = 'misc/mock/build/src05.md'
    const targetPaths = {
      ja: os.tmpdir() + '/inalz/translation/translation05.md',
    }
    const localePath = 'misc/mock/build/locale05.yml'
    const expectedPath = 'misc/mock/build/src05.md'
    const results = await new BuildCommand({
      baseDir: '',
      lang,
      document: {
        sourcePath,
        targetPaths,
        localePath,
      },
      options: {
        ...InalzConfigDefaultOptions,
      },
      middlewareModules: InalzConfigDefaultMiddlewareModules,
    }).build()
    expect(results.filter(({ err }) => Boolean(err))).toEqual([])
    expect(await readFile(targetPaths.ja)).toBe(await readFile(expectedPath))
  })

  it('06: processTarget middleware', async () => {
    const sourcePath = 'misc/mock/build/src06.md'
    const targetPaths = {
      ja: os.tmpdir() + '/inalz/translation/translation06.md',
    }
    const localePath = 'misc/mock/build/locale06.yml'
    const expectedPath = 'misc/mock/build/expected06.md'

    const appendHeaderLine: InalzMiddleware = (text, meta) =>
      'HEADER\n\n' + text
    const results = await new BuildCommand({
      baseDir: '',
      lang,
      document: {
        sourcePath,
        targetPaths,
        localePath,
      },
      options: InalzConfigDefaultOptions,
      middlewareModules: {
        processSource: [],
        processTarget: [appendHeaderLine],
      },
    }).build()

    expect(results.filter(({ err }) => Boolean(err))).toEqual([])
    expect(await readFile(targetPaths.ja)).toBe(await readFile(expectedPath))
  })
})
