import { flow } from 'fp-ts/lib/function'
import { MdParser, MdTreeProcessor } from '../util/mdUtil'
import { Locale } from '../core/Locale'
import {
  replaceIgnoringPatterns,
  restoreIgnoredLines,
} from '../util/ignoreLineUtil'

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
    replaceIgnoringPatterns(markdown, ignoringRegs)[0]

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
  const [text, lines] = replaceIgnoringPatterns(markdown, ignoringRegs)
  const restore = (markdown: string) => restoreIgnoredLines(markdown, lines)

  return flow(
    MdParser.parse,
    (tree) => MdTreeProcessor.validateReplaceByLocale(tree, locale),
    (tree) => MdTreeProcessor.replaceByLocale(tree, locale, targetLang),
    MdParser.stringify,
    restore,
  )(text)
}
