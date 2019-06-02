import { Processor } from 'unified'

/**
 * remark の inlineTokenizers をすべて無効にする
 */
export function disableInlineTokenizer(this: Processor) {
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
}
