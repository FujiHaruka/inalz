import YAML from 'yaml'
import * as t from 'io-ts'
import { Left } from 'fp-ts/lib/Either'
import { LocaleComponent } from '../types/Locale'
import { IOLocaleItem } from './IOLocaleItem'
import { readFile } from '../util/fsUtil'
import { LocaleItem } from '../core/LocaleItem'
import { Lang } from '../types/InalzConfig'
import { BUILTIN_ACTIONS } from '../Constants'

export class LocaleItemParser {
  lang: Lang

  constructor(lang: Lang) {
    this.lang = lang
  }

  parse(yaml: string): LocaleItem[] {
    const itemValidations = YAML.parseAllDocuments(yaml)
      .map((doc) => doc.toJSON())
      .filter(Boolean)
      .map((item) => IOLocaleItem.decode(item))

    if (itemValidations.some((item) => item.isLeft())) {
      const errors = itemValidations
        .filter((item): item is Left<
          t.ValidationError[],
          LocaleComponent.Item
        > => item.isLeft())
        .flatMap((e) => e.value)
      throw new Error(JSON.stringify(errors))
    }
    const items = itemValidations
      .map((e) => e.value as LocaleComponent.Item)
      .map((item) => new LocaleItem(this.lang, item))
    return items
  }

  parseFromSrc(text: string): LocaleItem {
    const { lang } = this
    const texts = Object.assign(
      {
        [lang.source]: text,
      },
      ...lang.targets.map((target) => ({
        [target]: BUILTIN_ACTIONS.DEFAULT,
      })),
    ) as { [lang: string]: string }
    const item = new LocaleItem(lang, { texts })
    return item
  }

  stringify(items: LocaleItem[]): string {
    return items.map((item) => YAML.stringify(item.toRaw())).join('---\n')
  }

  async load(yamlPath: string): Promise<LocaleItem[]> {
    const yaml = await readFile(yamlPath)
    return this.parse(yaml)
  }
}
