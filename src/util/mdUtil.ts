import unified, { Processor } from 'unified'
import * as Unist from 'unist'
import { EOL } from 'os'
import { RemarkStringifyOptions } from 'remark-stringify/types'
import { copy, bind } from './objectUtil'
import { Locale } from '../core/Locale'
import { BUILTIN_ACTIONS } from '../Constants'
import {
  InconsistentSourceTextError,
  InvalidLocaleItemLengthError,
} from './InalzError'

const IGNORE = BUILTIN_ACTIONS.IGNORE.slice(2)

const TextTypes = new Set(['text', 'html', 'yaml', 'toml', 'json'])
const FrontMatterOptions = ['yaml', 'toml', { type: 'json', fence: { open: '{', close: '}' } }]

const getStringValue = (node: Unist.Node) => {
  // 複数行のブロックではインデントを考慮する
  const hasIndent = node.position && node.position.indent!.some((n) => n > 1)
  if (hasIndent) {
    const indent = node.position!.indent!
    const value = (node.value as string)
      .split(EOL)
      .map((line, i) => ''.padStart(indent[i - 1] - 1) + line)
      .join(EOL)
    return value
  } else {
    return node.value as string
  }
}

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
      .use(require('remark-parse'))
      .use(require('remark-frontmatter'), FrontMatterOptions)
      .use(DisableInline.disableInlineTokenizer)
      .parse(text)
  },
  stringify(
    tree: Unist.Node,
    options: Partial<RemarkStringifyOptions> = {},
  ): string {
    return unified()
      .use(require('remark-stringify'), {
        listItemIndent: '1',
        fences: true,
        rule: '-',
        emphasis: '*',
        ...options,
      })
      .use(DisableInline.disableInlineEscape)
      .use(require('remark-frontmatter'), FrontMatterOptions)
      .stringify(tree)
  },
}

export const MdTreeProcessor = bind({
  toBlockTexts(tree: Unist.Node): string[] {
    const { children, type } = tree
    if (Array.isArray(children)) {
      return children.flatMap((child: Unist.Node) => this.toBlockTexts(child))
    } else {
      if (TextTypes.has(type)) {
        if (tree.value === IGNORE) {
          return []
        }
        const value = getStringValue(tree)
        return [value]
      } else {
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
      if (TextTypes.has(type)) {
        if (tree.value === IGNORE) {
          return 0
        }
        return 1
      } else {
        return 0
      }
    }
  },

  replaceByLocale(
    tree: Unist.Node,
    locale: Locale,
    targetLang: string,
  ): Unist.Node {
    const items = locale.items.filter(
      (item) => !(item.meta && item.meta.unused),
    )
    const texts = items.map((item) => item.getText(targetLang)!)
    return this._replace(tree, texts)
  },

  validateReplaceByLocale(tree: Unist.Node, locale: Locale): Unist.Node {
    const items = locale.items.filter(
      (item) => !(item.meta && item.meta.unused),
    )
    const count = this.countBlock(tree)
    if (count !== items.length) {
      throw new InvalidLocaleItemLengthError()
    }
    const texts = items.map((item) => item.getSourceText())
    this._validateReplaceMutably(tree, texts)
    return tree
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
      if (TextTypes.has(type)) {
        if (tree.value === IGNORE) {
          return
        }
        const newValue = texts.shift()
        if (newValue === undefined) {
          throw new Error('Failed to shift texts')
        }
        if (newValue === BUILTIN_ACTIONS.COPY) {
          return
        }
        tree.value = newValue
        return
      } else {
        return
      }
    }
  },

  _validateReplaceMutably(tree: Unist.Node, texts: string[]) {
    const { children, type } = tree
    if (Array.isArray(children)) {
      children.forEach((child) => this._validateReplaceMutably(child, texts))
    } else {
      if (TextTypes.has(type)) {
        if (tree.value === IGNORE) {
          return
        }
        const value = getStringValue(tree)
        const givenValue = texts.shift()
        if (value !== givenValue) {
          throw new InconsistentSourceTextError(`
source text in document: ${value}
source text in locale: ${givenValue}`)
        }
        return
      } else {
        return 0
      }
    }
  },
})
