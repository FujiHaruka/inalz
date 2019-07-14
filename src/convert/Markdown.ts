import { flow } from 'fp-ts/lib/function'
import { EOL } from 'os'
import { MdParser, MdTreeProcessor } from '../util/mdHelper'
import { Locale } from '../core/Locale'

const HTML_COMMENT_PREFIX = new RegExp('<!--')

const removeIgnoredLines = (text: string, regs: RegExp[]) =>
  regs.length === 0
    ? text
    : text
        .split(EOL)
        .filter((line) => regs.every((reg) => !reg.test(line)))
        .join(EOL)

export type ParseMarkdownTextsOptions = {
  lineIgnorePatterns?: string[]
  paragraphIgnorePatterns?: string[]
}

export const splitIntoBlockTexts = (
  markdown: string,
  options: ParseMarkdownTextsOptions = {},
): string[] => {
  const { paragraphIgnorePatterns = [], lineIgnorePatterns = [] } = options
  const lineIgnoreRegExps = lineIgnorePatterns.map(
    (pattern) => new RegExp(pattern),
  )
  const paragraphIgnoreRegExps = [HTML_COMMENT_PREFIX].concat(
    paragraphIgnorePatterns.map((pattern) => new RegExp(pattern)),
  )
  const remove = (markdown: string) =>
    removeIgnoredLines(markdown, lineIgnoreRegExps)
  const filter = (texts: string[]) =>
    texts.filter((text) =>
      paragraphIgnoreRegExps.every((reg) => !reg.test(text)),
    )

  return flow(
    remove,
    MdParser.parse,
    MdTreeProcessor.toBlockTexts,
    filter,
  )(markdown)
}

export const replaceMarkdownWithLocale = (
  markdown: string,
  locale: Locale,
  targetLang: string,
) => {
  return flow(
    MdParser.parse,
    (tree) => MdTreeProcessor.replaceByLocale(tree, locale, targetLang),
    MdParser.stringify,
  )(markdown)
}
