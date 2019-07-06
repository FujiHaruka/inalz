import { LocaleItemParser } from '../convert/LocaleItemParser'
import { parseMarkdownTexts } from '../convert/Markdown'
import { mergeLocaleItems } from '../convert/mergeLocaleItems'
import { LocaleItem } from '../core/LocaleItem'
import { InalzConfigComponent, Lang } from '../types/InalzConfig'
import { fileExists, readFile, writeFile } from '../util/fsUtil'
import { deepEquals } from '../util/objectUtil'
import { countBy } from '../util/arrayUtil'

export type SyncResult = {
  /** the locale file has been created / updated / unchanged */
  status: 'created' | 'updated' | 'unchanged'
  /** number of outdated documents */
  outdated: number
  /** number of outdated documents */
  unused: number
}

export class SyncCommand {
  lang: Lang
  options: InalzConfigComponent.SyncOptions

  static constructOptions = ({
    paragraphIgnorePatterns = [],
  }: Partial<
    InalzConfigComponent.SyncOptions
  >): InalzConfigComponent.SyncOptions => ({
    paragraphIgnorePatterns,
  })

  constructor(
    lang: Lang,
    options: Partial<InalzConfigComponent.SyncOptions> = {},
  ) {
    this.lang = lang
    this.options = SyncCommand.constructOptions(options)
  }

  async sync(sourcePath: string, localePath: string): Promise<SyncResult> {
    const { lang } = this

    const srcText = await readFile(sourcePath)
    const texts = parseMarkdownTexts(srcText, {
      paragraphIgnorePatterns: this.options.paragraphIgnorePatterns,
    })

    const parser = new LocaleItemParser(lang)
    const items: LocaleItem[] = texts.map((text) => parser.parseFromSrc(text))

    if (await fileExists(localePath)) {
      const oldItems = await parser.load(localePath)
      const mergedItems = mergeLocaleItems(oldItems, items)
      if (deepEquals(oldItems, mergedItems)) {
        return {
          status: 'unchanged',
          outdated: 0,
          unused: 0,
        }
      }
      const yaml = parser.stringify(mergedItems)
      await writeFile(localePath, yaml, { mkdirp: true })
      const outdated = countBy(mergedItems, (item) =>
        Boolean(item.meta && item.meta.outdated),
      )
      const unused = countBy(mergedItems, (item) =>
        Boolean(item.meta && item.meta.unused),
      )
      return {
        status: 'updated',
        outdated,
        unused,
      }
    } else {
      const yaml = parser.stringify(items)
      await writeFile(localePath, yaml, { mkdirp: true })
      return {
        status: 'created',
        outdated: 0,
        unused: 0,
      }
    }
  }
}
