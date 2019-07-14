import unified, { Processor } from 'unified'
import * as Unist from 'unist'
import { EOL } from 'os'
import { copy, bind } from './objectUtil'
import { Locale } from '../core/Locale'
import { BUILTIN_ACTIONS } from '../Constants'

/**
 * remark で markdown の inline を無効にする
 */
const DisableInline = {
  disableInlineTokenizer(this: Processor) {
    this.Parser.prototype.inlineMethods.forEach((tokenizerName: string) => {
      // To avoid error
      if (tokenizerName === 'text') return

      const replacer = (() => true) as any
      const tokenizer = this.Parser.prototype.inlineTokenizers[tokenizerName]
      Object.keys(tokenizer).forEach((prop) => {
        replacer[prop] = tokenizer[prop]
      })
      this.Parser.prototype.inlineTokenizers[tokenizerName] = replacer
    })
  },

  disableInlineEscape(this: Processor) {
    const Compiler = this.Compiler
    const visitors = Compiler.prototype.visitors
    // See https://github.com/remarkjs/remark/blob/master/packages/remark-stringify/lib/visitors/text.js
    visitors.text = (node: Unist.Node) => node.value
  },
}

/**
 * Markdown parser
 */
export const MdParser = {
  parse(text: string): Unist.Node {
    return unified()
      .use(require('remark-parse')) // No type definition
      .use(DisableInline.disableInlineTokenizer)
      .parse(text)
  },
  stringify(tree: Unist.Node): string {
    return unified()
      .use(require('remark-stringify'), {
        listItemIndent: '1',
        fences: true,
        rule: '-',
        emphasis: '*',
      })
      .use(DisableInline.disableInlineEscape)
      .stringify(tree)
  },
}

export const MdTreeProcessor = bind({
  toBlockTexts(tree: Unist.Node): string[] {
    const { children, type } = tree
    if (Array.isArray(children)) {
      return children.flatMap((child: Unist.Node) => this.toBlockTexts(child))
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
  },

  countBlock(tree: Unist.Node): number {
    const { children, type } = tree
    if (Array.isArray(children)) {
      return children.reduce(
        (count, child: Unist.Node) => count + this.countBlock(child),
        0,
      )
    } else {
      switch (type) {
        case 'text':
        case 'html':
          return 1
        default:
          return 0
      }
    }
  },

  replaceByLocale(
    tree: Unist.Node,
    locale: Locale,
    targetLang: string,
  ): Unist.Node {
    // TODO: validation の時点でエラーにする
    const items = locale.items.filter(
      (item) => !(item.meta && item.meta.unused),
    )
    const texts = items.map((item) => item.getText(targetLang)!)
    return this._replace(tree, texts)
  },

  /**
   * Replace all values in tree with text in texts
   */
  _replace(tree: Unist.Node, texts: string[]): Unist.Node {
    const _tree = copy(tree)
    const _texts = [...texts]
    this._replaceMutably(_tree, _texts)
    return _tree
  },

  _replaceMutably(tree: Unist.Node, texts: string[]): void {
    const { children, type } = tree
    if (Array.isArray(children)) {
      children.forEach((child) => this._replaceMutably(child, texts))
    } else {
      switch (type) {
        case 'text':
        case 'html':
          const newValue = texts.shift()
          if (newValue === undefined) {
            throw new Error('Failed to shift texts')
          }
          if (newValue === BUILTIN_ACTIONS.COPY) {
            return
          }
          tree.value = newValue
          return
        default:
          return
      }
    }
  },
})
