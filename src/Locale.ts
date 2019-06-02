import { LocaleInterface, LocaleComponent } from './types/Locale'
import { InalzConfigComponent } from './types/InalzConfig'

export class Locale implements LocaleInterface {
  lang: InalzConfigComponent.Lang
  items: LocaleComponent.Item[]

  // item に高速にアクセスするため
  private textToIndex: Map<string, number>

  constructor(lang: InalzConfigComponent.Lang, items: LocaleComponent.Item[]) {
    this.lang = lang
    this.items = items
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

  getTranslation(lang: string, text: string) {
    const item = this.getItem(text)
    if (!item) {
      return null
    }
    return item.texts[lang] || null
  }
}
