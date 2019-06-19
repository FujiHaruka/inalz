import path from 'path'
import { Locale } from '../core/Locale'
import { LocaleItem } from '../core/LocaleItem'
import { BUILTIN_ACTIONS } from '../Constants'
import { writeFile, readFile } from '../util/fsUtil'
import { InalzConfigComponent, Lang } from '../types/InalzConfig'
import { LocaleItemParser } from '../convert/LocaleItemParser'
import { replaceAll } from '../util/stringUtil'

export class Translator {
  lang: Lang

  constructor({ lang }: { lang: Lang }) {
    this.lang = lang
  }

  /**
   * Translate document and output file
   */
  async translate({
    sourcePath,
    targetPaths,
    localePath,
  }: InalzConfigComponent.SingleDocument) {
    const markdown = await readFile(sourcePath)
    const localeYaml = await readFile(localePath)
    const localeItems = new LocaleItemParser(this.lang).parse(localeYaml)
    const locale = new Locale(this.lang, localeItems)
    for (const [targetlang, targetPath] of Object.entries(targetPaths)) {
      const content = this.translateContent(targetlang, markdown, locale)
      await writeFile(targetPath, content, { mkdirp: true, mode: 0o644 })
    }
  }

  private replaceByLocaleItem = (
    text: string,
    item: LocaleItem,
    targetLang: string,
  ): string => {
    const targetText = item.getText(targetLang)
    const sourceText = item.getSourceText()
    if (typeof targetText !== 'string') {
      throw new Error(
        `Target text of ${targetLang} is not string.
Source text of locale item is:
${item.getSourceText()}`,
      )
    }
    if (typeof sourceText !== 'string') {
      throw new Error(`Source text is not string`)
    }
    if (targetText === BUILTIN_ACTIONS.COPY) {
      // Don't replace
      return text
    }
    return replaceAll(text, sourceText, targetText)
  }

  private translateContent(
    targetlang: string,
    markdown: string,
    locale: Locale,
  ): string {
    const translated = locale.items.reduce(
      (text, item) => this.replaceByLocaleItem(text, item, targetlang),
      markdown,
    )
    return translated
  }
}
