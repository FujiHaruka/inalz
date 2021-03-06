import fs from 'fs'
import os, { EOL } from 'os'
import path from 'path'
import { SyncCommand } from '../command/SyncCommand'
import { LocaleItemParser } from '../convert/LocaleItemParser'
import { Lang, InalzMiddleware } from '../types/InalzConfig'
import { rmIfExists } from '../util/fsUtil'
import {
  InalzConfigDefaultOptions,
  InalzConfigDefaultMiddlewareModules,
} from '../config/InalzConfig'

describe('SyncCommand', () => {
  const lang: Lang = {
    source: 'en',
    targets: ['ja'],
  }

  it('01', async () => {
    const sourcePath = 'misc/testdata/sync/src01.md'
    const expectedLocPath = 'misc/testdata/sync/loc01.yml'
    const localePath = path.join(os.tmpdir(), 'locale01.yml')

    await rmIfExists(localePath)
    const syncer = new SyncCommand({
      baseDir: '',
      lang,
      document: { sourcePath, localePath, targetPaths: {} },
      options: InalzConfigDefaultOptions,
      middlewareModules: InalzConfigDefaultMiddlewareModules,
    })
    const result = await syncer.sync()
    expect(result.err).toBeUndefined()

    const parser = new LocaleItemParser(lang)
    const items = await parser.load(localePath)
    const expected = await parser.load(expectedLocPath)
    expect(items).toEqual(expected)
  })

  it('02', async () => {
    const sourcePath = 'misc/testdata/sync/src02.md'
    const expectedLocPath = 'misc/testdata/sync/loc02.yml'
    const localePath = path.join(os.tmpdir(), 'locale02.yml')

    await rmIfExists(localePath)
    const syncer = new SyncCommand({
      baseDir: '',
      lang,
      document: { sourcePath, localePath, targetPaths: {} },
      options: InalzConfigDefaultOptions,
      middlewareModules: InalzConfigDefaultMiddlewareModules,
    })
    const result = await syncer.sync()
    expect(result.err).toBeUndefined()

    const parser = new LocaleItemParser(lang)
    const items = await parser.load(localePath)
    const expected = await parser.load(expectedLocPath)
    expect(items.length).toBe(expected.length)
    expect(items).toEqual(expected)
  })

  it('03: merge', async () => {
    const sourcePath = 'misc/testdata/sync/src03.md'
    const workingLocPath = 'misc/testdata/sync/loc03.working.yml'
    const expectedLocPath = 'misc/testdata/sync/loc03.yml'
    const localePath = path.join(os.tmpdir(), 'loc03.yml')

    await rmIfExists(localePath)
    await fs.promises.copyFile(workingLocPath, localePath)
    const syncer = new SyncCommand({
      baseDir: '',
      lang,
      document: { sourcePath, localePath, targetPaths: {} },
      options: InalzConfigDefaultOptions,
      middlewareModules: InalzConfigDefaultMiddlewareModules,
    })
    const result = await syncer.sync()
    expect(result.err).toBeUndefined()

    const parser = new LocaleItemParser(lang)
    const items = await parser.load(localePath)
    const expected = await parser.load(expectedLocPath)
    expect(items).toEqual(expected)
  })

  it('04: merge', async () => {
    const sourcePath = 'misc/testdata/sync/src04.md'
    const workingLocPath = 'misc/testdata/sync/loc04.working.yml'
    const expectedLocPath = 'misc/testdata/sync/loc04.yml'
    const localePath = path.join(os.tmpdir(), 'loc04.yml')

    await rmIfExists(localePath)
    await fs.promises.copyFile(workingLocPath, localePath)
    const syncer = new SyncCommand({
      baseDir: '',
      lang,
      document: { sourcePath, localePath, targetPaths: {} },
      options: {
        ...InalzConfigDefaultOptions,
        lineIgnorePatterns: ['<!--.+-->'],
      },
      middlewareModules: InalzConfigDefaultMiddlewareModules,
    })
    const result = await syncer.sync()
    expect(result.err).toBeUndefined()

    const parser = new LocaleItemParser(lang)
    const items = await parser.load(localePath)
    const expected = await parser.load(expectedLocPath)
    expect(items).toEqual(expected)
  })

  it('05: merge 2 (add duplicated paragraph)', async () => {
    const sourcePath = 'misc/testdata/sync/src05.md'
    const workingLocPath = 'misc/testdata/sync/loc05.working.yml'
    const expectedLocPath = 'misc/testdata/sync/loc05.yml'
    const localePath = path.join(os.tmpdir(), 'loc05.yml')

    await rmIfExists(localePath)
    await fs.promises.copyFile(workingLocPath, localePath)
    const syncer = new SyncCommand({
      baseDir: '',
      lang,
      document: { sourcePath, localePath, targetPaths: {} },
      options: InalzConfigDefaultOptions,
      middlewareModules: InalzConfigDefaultMiddlewareModules,
    })
    const result = await syncer.sync()
    expect(result.err).toBeUndefined()

    const parser = new LocaleItemParser(lang)
    const items = await parser.load(localePath)
    const expected = await parser.load(expectedLocPath)
    expect(items).toEqual(expected)
  })

  it('06: merge 3 (add duplicated paragraph)', async () => {
    const sourcePath = 'misc/testdata/sync/src06.md'
    const workingLocPath = 'misc/testdata/sync/loc06.yml'
    const localePath = path.join(os.tmpdir(), 'loc06.yml')

    await rmIfExists(localePath)
    await fs.promises.copyFile(workingLocPath, localePath)
    const syncer = new SyncCommand({
      baseDir: '',
      lang,
      document: { sourcePath, localePath, targetPaths: {} },
      options: InalzConfigDefaultOptions,
      middlewareModules: InalzConfigDefaultMiddlewareModules,
    })
    const result = await syncer.sync()
    expect(result.err).toBeUndefined()
    expect(result.status).toBe('unchanged')
  })

  it('07: allow empty document', async () => {
    const sourcePath = 'misc/testdata/sync/src07.md'
    const localePath = path.join(os.tmpdir(), 'loc07.yml')

    await rmIfExists(localePath)
    const syncer = new SyncCommand({
      baseDir: '',
      lang,
      document: { sourcePath, localePath, targetPaths: {} },
      options: InalzConfigDefaultOptions,
      middlewareModules: InalzConfigDefaultMiddlewareModules,
    })
    const result = await syncer.sync()
    expect(result.err).toBeUndefined()

    const parser = new LocaleItemParser(lang)
    const items = await parser.load(localePath)
    expect(items).toEqual([])
  })

  it('08: processSource middleware', async () => {
    const sourcePath = 'misc/testdata/sync/src08.md'
    const expectedLocPath = 'misc/testdata/sync/loc08.yml'
    const localePath = path.join(os.tmpdir(), 'locale08.yml')

    const removeFirstLine: InalzMiddleware = (text, meta) =>
      text
        .split(EOL)
        .slice(1)
        .join(EOL)

    await rmIfExists(localePath)
    const syncer = new SyncCommand({
      baseDir: '',
      lang,
      document: { sourcePath, localePath, targetPaths: {} },
      options: InalzConfigDefaultOptions,
      middlewareModules: {
        processSource: [removeFirstLine],
        processTarget: [],
      },
    })
    const result = await syncer.sync()
    expect(result.err).toBeUndefined()

    const parser = new LocaleItemParser(lang)
    const items = await parser.load(localePath)
    const expected = await parser.load(expectedLocPath)
    expect(items).toEqual(expected)
  })

  it('09: support front matter', async () => {
    const sourcePath = 'misc/testdata/sync/src09.md'
    const expectedLocPath = 'misc/testdata/sync/loc09.yml'
    const localePath = path.join(os.tmpdir(), 'locale09.yml')

    await rmIfExists(localePath)
    const syncer = new SyncCommand({
      baseDir: '',
      lang,
      document: { sourcePath, localePath, targetPaths: {} },
      options: InalzConfigDefaultOptions,
      middlewareModules: InalzConfigDefaultMiddlewareModules,
    })
    const result = await syncer.sync()
    expect(result.err).toBeUndefined()

    const parser = new LocaleItemParser(lang)
    const items = await parser.load(localePath)
    const expected = await parser.load(expectedLocPath)
    expect(items).toEqual(expected)
  })
})
