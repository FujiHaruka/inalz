import { fileExists, writeFile, readFile } from './util/fsUtil'
import { deepEquals } from './util/objectUtil'
import { MarkdownText } from './MarkdownText'
import { LocaleItemParser } from './LocaleItemParser'
import { LocaleItemMerge } from './LocaleItemMerge'
import { Lang } from './types/InalzConfig'
import { BUILTIN_ACTIONS } from './Constants'
import { LocaleItem } from './Locale'

export class LocaleSync {
  lang: Lang

  constructor(lang: Lang) {
    this.lang = lang
  }

  async sync(
    sourcePath: string,
    localePath: string,
    options: { merge?: boolean } = {},
  ) {
    const { merge = true } = options

    const localeFileExists = await fileExists(localePath)
    if (!merge && localeFileExists) {
      throw new Error(`Locale file already exists: ${localePath}`)
    }
    const { lang } = this

    const srcText = await readFile(sourcePath)
    const texts = new MarkdownText({ paragraphIgnorePatterns: [] }).parseTexts(
      srcText,
    )
    const items: LocaleItem[] = texts
      .map(
        (text) =>
          Object.assign(
            {
              [lang.source]: text,
            },
            ...lang.targets.map((target) => ({
              [target]: BUILTIN_ACTIONS.DEFAULT,
            })),
          ) as { [lang: string]: string },
      )
      .map((texts) => ({ texts }))
      .map((item) => new LocaleItem(lang, item))

    const parser = new LocaleItemParser(lang)
    let yaml: string
    if (localeFileExists) {
      const oldItems = await parser.load(localePath)
      const mergedItems = new LocaleItemMerge().mergeItems(oldItems, items)
      if (deepEquals(oldItems, mergedItems)) {
        return
      }
      yaml = parser.stringify(mergedItems)
    } else {
      yaml = parser.stringify(items)
    }

    await writeFile(localePath, yaml, { mkdirp: true })
  }
}
