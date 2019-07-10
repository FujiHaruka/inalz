import { BUILTIN_ACTIONS } from '../Constants'
import { LocaleItemParser } from '../convert/LocaleItemParser'
import { Locale } from '../core/Locale'
import { Lang, SingleInalzConfig } from '../types/InalzConfig'
import { LocaleComponent } from '../types/Locale'
import { readFile, writeFile, fileExists } from '../util/fsUtil'
import { BuildFailedError } from '../util/InalzError'
import { replaceAll } from '../util/stringUtil'
import { LocaleItem } from '../core/LocaleItem'
import { relative } from 'path'

export type BuildResult = {
  /** the target file changed status */
  status: 'created' | 'updated' | 'unchanged' | 'failed'
  /** target file path */
  targetPath: string
  /** any error */
  err?: Error
}

const compareBySrcLength = (itemA: LocaleItem, itemB: LocaleItem): number =>
  itemB.getSourceText().length - itemA.getSourceText().length

export class BuildCommand {
  baseDir: string
  lang: Lang
  sourcePath: string
  targetPaths: { [lang: string]: string }
  localePath: string
  strict: boolean = false

  constructor({
    baseDir,
    lang,
    document: { sourcePath, targetPaths, localePath },
  }: SingleInalzConfig) {
    this.baseDir = baseDir
    this.lang = lang
    this.sourcePath = sourcePath
    this.targetPaths = targetPaths
    this.localePath = localePath
  }

  /**
   * Build tranlration document
   */
  async build(): Promise<BuildResult[]> {
    const { lang, sourcePath, localePath, targetPaths } = this
    const markdown = await readFile(sourcePath)
    const localeItems = await new LocaleItemParser(lang).load(localePath)
    const locale = new Locale(lang, localeItems)
    const results: BuildResult[] = []
    for (const [targetlang, targetPath] of Object.entries(targetPaths)) {
      try {
        const content = this.replaceContent(targetlang, markdown, locale)
        const alreadyExists = await fileExists(targetPath)
        let status: BuildResult['status'] = 'created'
        if (alreadyExists) {
          status = 'updated'
          const oldContent = await readFile(targetPath)
          const unchanged = oldContent === content
          if (unchanged) {
            results.push(this.result(targetPath, 'unchanged'))
            continue // 書き込まない
          }
        }
        await writeFile(targetPath, content, { mkdirp: true, mode: 0o644 })
        results.push(this.result(targetPath, status))
      } catch (err) {
        results.push(this.result(targetPath, 'failed', err))
      }
    }
    return results
  }

  replace(
    text: string,
    sourceText: string,
    targetText: string,
    meta: LocaleComponent.ItemMeta,
  ): string {
    if (targetText === BUILTIN_ACTIONS.COPY) {
      // Don't replace
      return text
    }
    const { result, replaceCount } = replaceAll(text, sourceText, targetText)
    // 使われているはずなのに置換されていない
    if (replaceCount === 0 && !meta.unused) {
      const message = `Source text is not used. Do you forget to execute "inalz sync" before building, or did you edited the source text?
  file: ${this.localePath}
  source text: >-
${
  // 各行の先頭ににスペース4つ足す
  sourceText
    .split('\n')
    .map((line) => '    ' + line)
    .join('\n')
}
`
      if (this.strict) {
        throw new BuildFailedError(message)
      } else {
        console.warn('[WARNING] ' + message)
      }
    }
    return result
  }

  result(
    targetPath: string,
    status: BuildResult['status'],
    err?: Error,
  ): BuildResult {
    return {
      status,
      targetPath: relative(this.baseDir, targetPath),
      err,
    }
  }

  private replaceContent(
    targetLang: string,
    markdown: string,
    locale: Locale,
  ): string {
    const translated = locale.items
      .sort(compareBySrcLength)
      .reduce((text, item) => {
        const sourceText = item.getSourceText()
        let targetText = item.getText(targetLang)
        if (typeof targetText !== 'string') {
          targetText = BUILTIN_ACTIONS.COPY
        }
        return this.replace(text, sourceText, targetText, item.meta || {})
      }, markdown)
    return translated
  }
}
