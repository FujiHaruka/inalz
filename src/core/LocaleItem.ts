import { LocaleComponent } from '../types/Locale'
import { Lang } from '../types/InalzConfig'
import { UniqKey } from '../convert/group/Group'

export class LocaleItem implements LocaleComponent.Item, UniqKey {
  lang: Lang
  texts: LocaleComponent.Item['texts']
  meta?: LocaleComponent.ItemMeta

  constructor(lang: Lang, item: LocaleComponent.Item) {
    this.lang = lang
    this.texts = item.texts
    this.meta = item.meta
  }

  getText(targetLang: string) {
    const text = this.texts[targetLang]
    const exists = typeof text === 'string'
    return exists ? text : null
  }

  getSourceText(): string {
    return this.texts[this.lang.source]
  }

  setMeta(meta: LocaleComponent.ItemMeta) {
    this.meta = {
      ...(this.meta || {}),
      ...meta,
    }
  }

  toObject(): LocaleComponent.Item {
    const item: LocaleComponent.Item = {
      texts: this.texts,
    }
    if (this.meta) {
      item.meta = this.meta
    }
    return item
  }

  get key() {
    return this.getSourceText()
  }
}
