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
    const sourcePath = 'misc/testdata/build/src01.md'
    const targetPaths = {
      ja: os.tmpdir() + '/inalz/translation/translation01.md',
    }
    const localePath = 'misc/testdata/build/locale01.yml'
    const expectedPath = 'misc/testdata/build/expected01.md'
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
    const sourcePath = 'misc/testdata/build/src02.md'
    const targetPaths = {
      ja: os.tmpdir() + '/inalz/translation/translation02.md',
    }
    const localePath = 'misc/testdata/build/locale02.yml'
    const expectedPath = 'misc/testdata/build/expected02.md'
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
    const sourcePath = 'misc/testdata/build/src03.md'
    const targetPaths = {
      ja: os.tmpdir() + '/inalz/translation/translation03.md',
    }
    const localePath = 'misc/testdata/build/locale03.yml'
    const expectedPath = 'misc/testdata/build/expected03.md'
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
    const sourcePath = 'misc/testdata/build/src04.md'
    const targetPaths = {
      ja: os.tmpdir() + '/inalz/translation/translation04.md',
    }
    const localePath = 'misc/testdata/build/locale04.yml'
    const expectedPath = 'misc/testdata/build/expected04.md'
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
    const sourcePath = 'misc/testdata/build/src05.md'
    const targetPaths = {
      ja: os.tmpdir() + '/inalz/translation/translation05.md',
    }
    const localePath = 'misc/testdata/build/locale05.yml'
    const expectedPath = 'misc/testdata/build/src05.md'
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
    const sourcePath = 'misc/testdata/build/src06.md'
    const targetPaths = {
      ja: os.tmpdir() + '/inalz/translation/translation06.md',
    }
    const localePath = 'misc/testdata/build/locale06.yml'
    const expectedPath = 'misc/testdata/build/expected06.md'

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

  it('07: support front matter', async () => {
    const sourcePath = 'misc/testdata/build/src07.md'
    const targetPaths = {
      ja: os.tmpdir() + '/inalz/translation/translation07.md',
    }
    const localePath = 'misc/testdata/build/locale07.yml'
    const expectedPath = 'misc/testdata/build/expected07.md'

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
})
