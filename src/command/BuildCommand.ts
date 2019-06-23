import path from 'path'
import { Locale } from '../core/Locale'
import { LocaleItem } from '../core/LocaleItem'
import { BUILTIN_ACTIONS } from '../Constants'
import { writeFile, readFile } from '../util/fsUtil'
import { InalzConfigComponent, Lang } from '../types/InalzConfig'
import { LocaleItemParser } from '../convert/LocaleItemParser'
import { replaceAll } from '../util/stringUtil'

export class BuildCommand {
  lang: Lang

  constructor({ lang }: { lang: Lang }) {
    this.lang = lang
  }

  /**
   * Build tranlration document
   */
  async build({
    sourcePath,
    targetPaths,
    localePath,
  }: InalzConfigComponent.SingleDocument) {
    const markdown = await readFile(sourcePath)
    const localeItems = await new LocaleItemParser(this.lang).load(localePath)
    const locale = new Locale(this.lang, localeItems)
    for (const [targetlang, targetPath] of Object.entries(targetPaths)) {
      const content = this.replaceContent(targetlang, markdown, locale)
      await writeFile(targetPath, content, { mkdirp: true, mode: 0o644 })
    }
  }

  // FIXME: 文字列を置換するだけにする
  private replaceByLocaleItem = (
    text: string,
    item: LocaleItem,
    targetLang: string,
  ): string => {
    const targetText = item.getText(targetLang)
    const sourceText = item.getSourceText()
    // TODO: ここでバリデーションはおかしい
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

  private replaceContent(
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
