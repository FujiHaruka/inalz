import { flow } from 'fp-ts/lib/function'
import unified from 'unified'
import * as Unist from 'unist'
import { disableInlineTokenizer } from '../util/disableInlineTokenizer'
import { EOL } from 'os'

const HTML_COMMENT_PREFIX = new RegExp('<!--')

const parseMarkdown = (markdown: string) => {
  return unified()
    .use(require('remark-parse')) // No type definition
    .use(disableInlineTokenizer)
    .parse(markdown)
}

const compileToTexts = (tree: Unist.Node): string[] => {
  const { children, type } = tree
  if (Array.isArray(children)) {
    return children.flatMap((child: Unist.Node) => compileToTexts(child))
  } else {
    switch (type) {
      case 'text':
      case 'html':
        // 複数行のブロックではインデントを考慮する
        const hasIndent =
          tree.position && tree.position.indent!.some((n) => n > 1)
        if (hasIndent) {
          const indent = tree.position!.indent!
          const value = (tree.value as string)
            .split(EOL)
            .map((line, i) => ''.padStart(indent[i - 1] - 1) + line)
            .join(EOL)
          return [value]
        } else {
          return [tree.value as string]
        }
      default:
        return []
    }
  }
}

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
    parseMarkdown,
    compileToTexts,
    filter,
  )(markdown)
}
