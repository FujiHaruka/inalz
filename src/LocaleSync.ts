import { fileExists, writeFile, readFile } from './util/fsUtil'
import { deepEquals } from './util/objectUtil'
import { MarkdownText } from './MarkdownText'
import { LocaleItemParser } from './LocaleItemParser'
import { LocaleItemMerge } from './LocaleItemMerge'
import { Lang, InalzConfigComponent } from './types/InalzConfig'
import { BUILTIN_ACTIONS } from './Constants'
import { LocaleItem } from './Locale'

export class LocaleSync {
  lang: Lang
  options: InalzConfigComponent.SyncOptions

  static DEFAULT_OPTIONS: InalzConfigComponent.SyncOptions = {
    paragraphIgnorePatterns: [],
    enableLinkVariable: false,
  }
  static constructOptions = ({
    paragraphIgnorePatterns = [],
    enableLinkVariable = false,
  }: Partial<
    InalzConfigComponent.SyncOptions
  >): InalzConfigComponent.SyncOptions => ({
    paragraphIgnorePatterns,
    enableLinkVariable,
  })

  constructor(
    lang: Lang,
    options: Partial<InalzConfigComponent.SyncOptions> = {},
  ) {
    this.lang = lang
    this.options = LocaleSync.constructOptions(options)
  }

  async sync(sourcePath: string, localePath: string) {
    const { lang } = this

    const srcText = await readFile(sourcePath)
    const texts = new MarkdownText({
      paragraphIgnorePatterns: this.options.paragraphIgnorePatterns,
    }).parseTexts(srcText)

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
    if (await fileExists(localePath)) {
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
