import YAML from 'yaml'
import { LocaleComponent } from '../types/Locale'
import { Lang } from '../types/InalzConfig'
import { UniqKey } from '../convert/group/Group'
import { BUILTIN_ACTIONS } from '../Constants'
import { copy } from '../util/objectUtil'
import { InvalidLocaleItemError } from '../util/InalzError'

export class LocaleItem implements LocaleComponent.Item, UniqKey {
  lang: Lang
  texts: LocaleComponent.Item['texts']
  meta?: LocaleComponent.ItemMeta

  constructor(lang: Lang, item: LocaleComponent.Item) {
    this.lang = lang
    this.texts = item.texts
    this.meta = item.meta
    // 型チェックだけでは不十分なので
    const invalid = !this.getSourceText()
    if (invalid) {
      throw new InvalidLocaleItemError(`Source lang (${
        this.lang.source
      }) text is missing in locale item:
---
${this.toYaml()}
`)
    }
  }

  getText(targetLang: string) {
    const text = this.texts[targetLang]
    const exists = typeof text === 'string'
    return exists ? text : null
  }

  getSourceText(): string {
    return this.texts[this.lang.source]
  }

  setSourceText(text: string) {
    this.texts[this.lang.source] = text
  }

  setMeta(meta: LocaleComponent.ItemMeta) {
    this.meta = {
      ...(this.meta || {}),
      ...meta,
    }
  }

  isInitialState() {
    return this.lang.targets
      .map((target) => this.getText(target))
      .every((text) => text === BUILTIN_ACTIONS.DEFAULT)
  }

  toObject(): LocaleComponent.Item {
    if (this.meta) {
      return copy({
        // Keys are sorted with this order
        meta: this.meta,
        texts: this.texts,
      })
    } else {
      return copy({
        texts: this.texts,
      })
    }
  }

  toYaml(): string {
    return YAML.stringify(this.toObject())
  }

  get key() {
    return this.getSourceText()
  }

  copy() {
    return new LocaleItem({ ...this.lang }, this.toObject())
  }
}
