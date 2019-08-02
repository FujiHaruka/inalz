import { relative } from 'path'
import { LocaleItemParser } from '../convert/LocaleItemParser'
import { splitIntoBlockTexts } from '../convert/Markdown'
import { mergeLocaleItems } from '../convert/mergeLocaleItems'
import { LocaleItem } from '../core/LocaleItem'
import {
  InalzConfigComponent,
  Lang,
  SingleInalzConfig,
} from '../types/InalzConfig'
import { fileExists, readFile, writeFile, readSource } from '../util/fsUtil'
import { deepEquals } from '../util/objectUtil'

export type SyncResult = {
  /** the locale file status */
  status: 'created' | 'updated' | 'unchanged' | 'failed'
  /** locale file path */
  localePath: string
  /** any error */
  err?: Error
}

export class SyncCommand {
  baseDir: string
  lang: Lang
  options: InalzConfigComponent.SyncOptions
  sourcePath: string
  localePath: string
  middlewareModules: InalzConfigComponent.MiddlewareModules

  constructor({
    baseDir,
    lang,
    document: { sourcePath, localePath },
    options,
    middlewareModules,
  }: SingleInalzConfig) {
    this.baseDir = baseDir
    this.lang = lang
    this.options = options
    this.sourcePath = sourcePath
    this.localePath = localePath
    this.middlewareModules = middlewareModules
  }

  async sync(): Promise<SyncResult> {
    const { lang, sourcePath, localePath } = this

    try {
      const srcText = await readSource(
        sourcePath,
        this.middlewareModules.processSource,
      )

      const texts = splitIntoBlockTexts(srcText, {
        lineIgnorePatterns: this.options.lineIgnorePatterns,
      })

      const parser = new LocaleItemParser(lang)
      const items: LocaleItem[] = texts.map((text) => parser.parseFromSrc(text))

      if (await fileExists(localePath)) {
        const oldItems = await parser.load(localePath)
        const mergedItems = mergeLocaleItems(oldItems, items)
        if (deepEquals(oldItems, mergedItems)) {
          return this.result('unchanged')
        }
        const yaml = parser.stringify(mergedItems)
        await writeFile(localePath, yaml, { mkdirp: true })
        return this.result('updated')
      } else {
        const yaml = parser.stringify(items)
        await writeFile(localePath, yaml, { mkdirp: true })
        return this.result('created')
      }
    } catch (err) {
      // catch any error
      return this.result('failed', err)
    }
  }

  result(status: SyncResult['status'], err?: Error): SyncResult {
    return {
      status,
      localePath: relative(this.baseDir, this.localePath),
      err,
    }
  }
}
