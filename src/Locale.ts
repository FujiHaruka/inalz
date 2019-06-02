import { LocaleInterface, LocaleComponent } from './types/Locale'
import { InalzConfigComponent } from './types/InalzConfig'

export class Locale implements LocaleInterface {
  lang: InalzConfigComponent.Lang
  items: LocaleItem[]

  // item に高速にアクセスするため
  private textToIndex: Map<string, number>

  constructor(lang: InalzConfigComponent.Lang, items: LocaleComponent.Item[]) {
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
  lang: InalzConfigComponent.Lang
  texts: LocaleComponent.Item['texts']
  meta?: LocaleComponent.Item['meta']

  constructor(lang: InalzConfigComponent.Lang, item: LocaleComponent.Item) {
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
}
