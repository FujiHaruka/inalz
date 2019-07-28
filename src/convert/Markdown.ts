import { flow } from 'fp-ts/lib/function'
import { RemarkStringifyOptions } from 'remark-stringify/types'
import { MdParser, MdTreeProcessor } from '../util/mdUtil'
import { Locale } from '../core/Locale'
import {
  replaceIgnoringPatterns,
  restoreIgnoredLines,
} from '../util/ignoreLineUtil'

export const splitIntoBlockTexts = (
  markdown: string,
  options: { lineIgnorePatterns?: string[] } = {},
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
  options: {
    lineIgnorePatterns?: string[]
    markdownOptions?: Partial<RemarkStringifyOptions>
  } = {},
) => {
  const { lineIgnorePatterns = [], markdownOptions = {} } = options
  const ignoringRegs = lineIgnorePatterns.map((pattern) => new RegExp(pattern))
  const [text, lines] = replaceIgnoringPatterns(markdown, ignoringRegs)
  const restore = (markdown: string) => restoreIgnoredLines(markdown, lines)

  return flow(
    MdParser.parse,
    (tree) => MdTreeProcessor.validateReplaceByLocale(tree, locale),
    (tree) => MdTreeProcessor.replaceByLocale(tree, locale, targetLang),
    (tree) => MdParser.stringify(tree, markdownOptions),
    restore,
  )(text)
}
