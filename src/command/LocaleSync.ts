import { fileExists, writeFile, readFile } from '../util/fsUtil'
import { deepEquals } from '../util/objectUtil'
import { parseMarkdownTexts } from '../convert/Markdown'
import { LocaleItemParser } from '../convert/LocaleItemParser'
import { LocaleItemMerge } from '../convert/LocaleItemMerge'
import { Lang, InalzConfigComponent } from '../types/InalzConfig'
import { LocaleItem } from '../core/LocaleItem'

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
    const texts = parseMarkdownTexts(srcText, {
      paragraphIgnorePatterns: this.options.paragraphIgnorePatterns,
    })

    const parser = new LocaleItemParser(lang)
    const items: LocaleItem[] = texts.map((text) => parser.parseFromSrc(text))

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
