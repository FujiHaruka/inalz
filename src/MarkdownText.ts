import unified from 'unified'
import * as Unist from 'unist'
import { uniq } from 'fp-ts/lib/Array'
import { setoidString } from 'fp-ts/lib/Setoid'
import { disableInlineTokenizer } from './util/disableInlineTokenizer'

const HTML_COMMENT_PREFIX = '<!--'

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
        return [tree.value as string]
      case 'html':
        const text = tree.value as string
        // コメントだけは除外
        if (text.startsWith(HTML_COMMENT_PREFIX)) {
          return []
        } else {
          return [text]
        }
      default:
        return []
    }
  }
}

export const getTextsFromMarkdown = (markdown: string) => {
  const tree = _parseMarkdown(markdown)
  const texts = uniqStr(_compileToTexts(tree)) // ここで重複を除外
  return texts
}
