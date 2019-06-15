import { LocaleComponent } from '../types/Locale'
import { Lang } from '../types/InalzConfig'

export class LocaleItem implements LocaleComponent.Item {
  lang: Lang
  texts: LocaleComponent.Item['texts']
  meta?: LocaleComponent.Item['meta']
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
  getSourceText(): string | null {
    const text = this.texts[this.lang.source]
    const exists = typeof text === 'string'
    return exists ? text : null
  }
  toRaw(): LocaleComponent.Item {
    const item: LocaleComponent.Item = {
      texts: this.texts,
    }
    if (this.meta) {
      item.meta = this.meta
    }
    return item
  }
}
