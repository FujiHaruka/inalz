import { LocaleInterface, LocaleComponent } from '../types/Locale'
import { Lang } from '../types/InalzConfig'
import { LocaleItem } from './LocaleItem'

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
