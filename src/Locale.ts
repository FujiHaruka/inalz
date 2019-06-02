import { LocaleInterface, LocaleComponent } from './types/Locale'
import { Lang } from './types/InalzConfig'

export class Locale implements LocaleInterface {
  lang: Lang
  items: LocaleItem[]

  // item に高速にアクセスするため
  private textToIndex: Map<string, number>

  constructor(lang: Lang, items: LocaleComponent.Item[]) {
    this.lang = lang
    this.items = items.map((item) => new LocaleItem(lang, item))
    this.textToIndex = new Map(
      items.map((item, index) => [item.texts[lang.source], index]),
    )
  }

  getItem(text: string) {
    const index = this.textToIndex.get(text)
    if (typeof index === 'undefined') {
      return null
    }
    return this.items[index]
  }
}

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
    const exists = Boolean(text)
    return exists ? text : null
  }

  getSourceText(): string | null {
    const text = this.texts[this.lang.source]
    const exists = Boolean(text)
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
