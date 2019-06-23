import { uniq } from 'fp-ts/lib/Array'
import { setoidString } from 'fp-ts/lib/Setoid'
import unified from 'unified'
import * as Unist from 'unist'
import { disableInlineTokenizer } from '../util/disableInlineTokenizer'

const HTML_COMMENT_PREFIX = new RegExp('<!--')

const uniqStr = uniq(setoidString)

const _parseMarkdown = (markdown: string) => {
  return unified()
    .use(require('remark-parse')) // No type definition
    .use(disableInlineTokenizer)
    .parse(markdown)
}

const _compileToTexts = (tree: Unist.Node): string[] => {
  const { children, type } = tree
  if (Array.isArray(children)) {
    return children.flatMap((child: Unist.Node) => _compileToTexts(child))
  } else {
    switch (type) {
      case 'text':
      case 'html':
        return [tree.value as string]
      default:
        return []
    }
  }
}

export type ParseMarkdownTextsOptions = {
  paragraphIgnorePatterns?: string[]
}

export const parseMarkdownTexts = (
  markdown: string,
  options: ParseMarkdownTextsOptions = {},
) => {
  const { paragraphIgnorePatterns = [] } = options
  const ignoreRegExps = [HTML_COMMENT_PREFIX].concat(
    (paragraphIgnorePatterns || []).map((pattern) => new RegExp(pattern)),
  )

  const tree = _parseMarkdown(markdown)
  const texts = uniqStr(_compileToTexts(tree)) // ここで重複を除外
  const filtered = texts.filter((text) =>
    ignoreRegExps.every((reg) => !reg.test(text)),
  )
  return filtered
}
