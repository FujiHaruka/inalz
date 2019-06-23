import { BUILTIN_ACTIONS } from '../Constants'
import { LocaleItemParser } from '../convert/LocaleItemParser'
import { Locale } from '../core/Locale'
import { InalzConfigComponent, Lang } from '../types/InalzConfig'
import { readFile, writeFile } from '../util/fsUtil'
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

  private replace = (
    text: string,
    sourceText: string,
    targetText: string,
  ): string => {
    if (targetText === BUILTIN_ACTIONS.COPY) {
      // Don't replace
      return text
    }
    return replaceAll(text, sourceText, targetText)
  }

  private replaceContent(
    targetLang: string,
    markdown: string,
    locale: Locale,
  ): string {
    const translated = locale.items.reduce((text, item) => {
      const sourceText = item.getSourceText()
      let targetText = item.getText(targetLang)
      if (typeof targetText !== 'string') {
        targetText = BUILTIN_ACTIONS.COPY
      }
      return this.replace(text, sourceText, targetText)
    }, markdown)
    return translated
  }
}
