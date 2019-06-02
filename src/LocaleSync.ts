import { fileExists, writeFile, readFile } from './util/fsUtil'
import { deepEquals } from './util/objectUtil'
import { getTextsFromMarkdown } from './MarkdownText'
import { LocaleItemParser } from './LocaleItemParser'
import { LocaleItemMerge } from './LocaleItemMerge'
import { InalzConfigComponent } from './types/InalzConfig'
import { BUILTIN_ACTIONS } from './Constants'
import { LocaleComponent } from './types/Locale'

export class LocaleSync {
  lang: InalzConfigComponent.Lang

  constructor(lang: InalzConfigComponent.Lang) {
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
    const texts = getTextsFromMarkdown(srcText)
    const items: LocaleComponent.Item[] = texts
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

    let yaml: string
    if (localeFileExists) {
      const oldItems = await LocaleItemParser.load(localePath)
      const mergedItems = LocaleItemMerge.mergeItems(lang, oldItems, items)
      if (deepEquals(oldItems, mergedItems)) {
        return
      }
      yaml = LocaleItemParser.stringify(mergedItems)
    } else {
      yaml = LocaleItemParser.stringify(items)
    }

    await writeFile(localePath, yaml, { mkdirp: true })
  }
}
