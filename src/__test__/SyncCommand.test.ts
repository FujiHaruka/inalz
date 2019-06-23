import fs from 'fs'
import os from 'os'
import path from 'path'
import { SyncCommand } from '../command/SyncCommand'
import { LocaleItemParser } from '../convert/LocaleItemParser'
import { Lang } from '../types/InalzConfig'
import { rmIfExists } from '../util/fsUtil'

describe('SyncCommand', () => {
  const lang: Lang = {
    source: 'en',
    targets: ['ja'],
  }

  it('01', async () => {
    const srcPath = 'misc/mock/sync/src01.md'
    const expectedLocPath = 'misc/mock/sync/loc01.yml'
    const localePath = path.join(os.tmpdir(), 'locale01.yml')

    await rmIfExists(localePath)
    const syncer = new SyncCommand(lang)
    await syncer.sync(srcPath, localePath)

    const parser = new LocaleItemParser(lang)
    const items = await parser.load(localePath)
    const expected = await parser.load(expectedLocPath)
    expect(items).toEqual(expected)
  })

  it('02', async () => {
    const srcPath = 'misc/mock/sync/src02.md'
    const expectedLocPath = 'misc/mock/sync/loc02.yml'
    const localePath = path.join(os.tmpdir(), 'locale02.yml')

    await rmIfExists(localePath)
    const syncer = new SyncCommand(lang)
    await syncer.sync(srcPath, localePath)

    const parser = new LocaleItemParser(lang)
    const items = await parser.load(localePath)
    const expected = await parser.load(expectedLocPath)
    expect(items).toEqual(expected)
  })

  it('03: merge', async () => {
    const srcPath = 'misc/mock/sync/src03.md'
    const workingLocPath = 'misc/mock/sync/loc03.working.yml'
    const expectedLocPath = 'misc/mock/sync/loc03.yml'
    const localePath = path.join(os.tmpdir(), 'loc03.yml')

    await rmIfExists(localePath)
    await fs.promises.copyFile(workingLocPath, localePath)
    const syncer = new SyncCommand(lang)
    await syncer.sync(srcPath, localePath)

    const parser = new LocaleItemParser(lang)
    const items = await parser.load(localePath)
    const expected = await parser.load(expectedLocPath)
    expect(items).toEqual(expected)
  })

  it('04: merge', async () => {
    const srcPath = 'misc/mock/sync/src04.md'
    const workingLocPath = 'misc/mock/sync/loc04.working.yml'
    const expectedLocPath = 'misc/mock/sync/loc04.yml'
    const localePath = path.join(os.tmpdir(), 'loc04.yml')

    await rmIfExists(localePath)
    await fs.promises.copyFile(workingLocPath, localePath)
    const syncer = new SyncCommand(lang)
    await syncer.sync(srcPath, localePath)

    const parser = new LocaleItemParser(lang)
    const items = await parser.load(localePath)
    const expected = await parser.load(expectedLocPath)
    expect(items).toEqual(expected)
  })
})
