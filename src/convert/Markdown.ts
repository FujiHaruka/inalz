import { flow } from 'fp-ts/lib/function'
import { MdParser, MdTreeProcessor } from '../util/mdHelper'
import { Locale } from '../core/Locale'
import { removeIgnoredLine, restoreIgnoredLine } from '../util/ignoreLineHelper'

export type ParseMarkdownTextsOptions = {
  lineIgnorePatterns?: string[]
}

export const splitIntoBlockTexts = (
  markdown: string,
  options: ParseMarkdownTextsOptions = {},
): string[] => {
  const { lineIgnorePatterns = [] } = options
  const ignoringRegs = lineIgnorePatterns.map((pattern) => new RegExp(pattern))
  const remove = (markdown: string) =>
    removeIgnoredLine(markdown, ignoringRegs)[0]

  return flow(
    remove,
    MdParser.parse,
    MdTreeProcessor.toBlockTexts,
  )(markdown)
}

export const replaceMarkdownWithLocale = (
  markdown: string,
  locale: Locale,
  targetLang: string,
  options: ParseMarkdownTextsOptions = {},
) => {
  const { lineIgnorePatterns = [] } = options
  const ignoringRegs = lineIgnorePatterns.map((pattern) => new RegExp(pattern))
  const [text, lines] = removeIgnoredLine(markdown, ignoringRegs)
  const restore = (markdown: string) => restoreIgnoredLine(markdown, lines)

  return flow(
    MdParser.parse,
    (tree) => MdTreeProcessor.validateReplaceByLocale(tree, locale),
    (tree) => MdTreeProcessor.replaceByLocale(tree, locale, targetLang),
    MdParser.stringify,
    restore,
  )(text)
}
