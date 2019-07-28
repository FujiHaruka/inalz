import { BUILTIN_ACTIONS } from '../Constants'
import { LocaleItemParser } from '../convert/LocaleItemParser'
import { Locale } from '../core/Locale'
import {
  Lang,
  SingleInalzConfig,
  InalzConfigComponent,
} from '../types/InalzConfig'
import { LocaleComponent } from '../types/Locale'
import { readFile, writeFile, fileExists } from '../util/fsUtil'
import { BuildFailedError } from '../util/InalzError'
import { relative } from 'path'
import { replaceMarkdownWithLocale } from '../convert/Markdown'

export type BuildResult = {
  /** the target file changed status */
  status: 'created' | 'updated' | 'unchanged' | 'failed'
  /** target file path */
  targetPath: string
  /** any error */
  err?: Error
}

export class BuildCommand {
  baseDir: string
  lang: Lang
  sourcePath: string
  targetPaths: { [lang: string]: string }
  localePath: string
  options: InalzConfigComponent.BuildOptions

  constructor({
    baseDir,
    lang,
    document: { sourcePath, targetPaths, localePath },
    options,
  }: SingleInalzConfig) {
    this.baseDir = baseDir
    this.lang = lang
    this.sourcePath = sourcePath
    this.targetPaths = targetPaths
    this.localePath = localePath
    this.options = options
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
    for (const [targetLang, targetPath] of Object.entries(targetPaths)) {
      try {
        const content = replaceMarkdownWithLocale(
          markdown,
          locale,
          targetLang,
          {
            lineIgnorePatterns: this.options.lineIgnorePatterns,
            markdownOptions: this.options.markdownOptions,
          },
        )
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
}
