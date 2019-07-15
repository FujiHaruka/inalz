import fs from 'fs'
import os from 'os'
import path from 'path'
import { SyncCommand } from '../command/SyncCommand'
import { LocaleItemParser } from '../convert/LocaleItemParser'
import { Lang } from '../types/InalzConfig'
import { rmIfExists } from '../util/fsUtil'
import { InalzConfigDefaultOptions } from '../config/InalzConfig'

describe('SyncCommand', () => {
  const lang: Lang = {
    source: 'en',
    targets: ['ja'],
  }

  it('01', async () => {
    const sourcePath = 'misc/mock/sync/src01.md'
    const expectedLocPath = 'misc/mock/sync/loc01.yml'
    const localePath = path.join(os.tmpdir(), 'locale01.yml')

    await rmIfExists(localePath)
    const syncer = new SyncCommand({
      baseDir: '',
      lang,
      document: { sourcePath, localePath, targetPaths: {} },
      options: InalzConfigDefaultOptions,
    })
    const result = await syncer.sync()
    expect(result.err).toBeUndefined()

    const parser = new LocaleItemParser(lang)
    const items = await parser.load(localePath)
    const expected = await parser.load(expectedLocPath)
    expect(items).toEqual(expected)
  })

  it('02', async () => {
    const sourcePath = 'misc/mock/sync/src02.md'
    const expectedLocPath = 'misc/mock/sync/loc02.yml'
    const localePath = path.join(os.tmpdir(), 'locale02.yml')

    await rmIfExists(localePath)
    const syncer = new SyncCommand({
      baseDir: '',
      lang,
      document: { sourcePath, localePath, targetPaths: {} },
      options: InalzConfigDefaultOptions,
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
    const sourcePath = 'misc/mock/sync/src03.md'
    const workingLocPath = 'misc/mock/sync/loc03.working.yml'
    const expectedLocPath = 'misc/mock/sync/loc03.yml'
    const localePath = path.join(os.tmpdir(), 'loc03.yml')

    await rmIfExists(localePath)
    await fs.promises.copyFile(workingLocPath, localePath)
    const syncer = new SyncCommand({
      baseDir: '',
      lang,
      document: { sourcePath, localePath, targetPaths: {} },
      options: InalzConfigDefaultOptions,
    })
    const result = await syncer.sync()
    expect(result.err).toBeUndefined()

    const parser = new LocaleItemParser(lang)
    const items = await parser.load(localePath)
    const expected = await parser.load(expectedLocPath)
    expect(items).toEqual(expected)
  })

  it('04: merge', async () => {
    const sourcePath = 'misc/mock/sync/src04.md'
    const workingLocPath = 'misc/mock/sync/loc04.working.yml'
    const expectedLocPath = 'misc/mock/sync/loc04.yml'
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
    })
    const result = await syncer.sync()
    expect(result.err).toBeUndefined()

    const parser = new LocaleItemParser(lang)
    const items = await parser.load(localePath)
    const expected = await parser.load(expectedLocPath)
    expect(items).toEqual(expected)
  })

  it('05: merge 2 (add duplicated paragraph)', async () => {
    const sourcePath = 'misc/mock/sync/src05.md'
    const workingLocPath = 'misc/mock/sync/loc05.working.yml'
    const expectedLocPath = 'misc/mock/sync/loc05.yml'
    const localePath = path.join(os.tmpdir(), 'loc05.yml')

    await rmIfExists(localePath)
    await fs.promises.copyFile(workingLocPath, localePath)
    const syncer = new SyncCommand({
      baseDir: '',
      lang,
      document: { sourcePath, localePath, targetPaths: {} },
      options: InalzConfigDefaultOptions,
    })
    const result = await syncer.sync()
    expect(result.err).toBeUndefined()

    const parser = new LocaleItemParser(lang)
    const items = await parser.load(localePath)
    const expected = await parser.load(expectedLocPath)
    expect(items).toEqual(expected)
  })
})
