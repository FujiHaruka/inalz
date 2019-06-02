import YAML from 'yaml'
import * as t from 'io-ts'
import { Left } from 'fp-ts/lib/Either'
import { LocaleComponent } from './types/Locale'
import { IOLocaleItem } from './IOTypes'
import { readFile } from './util/fsUtil'

export const LocaleItemParser = {
  parse(yaml: string): LocaleComponent.Item[] {
    const itemValidations = YAML.parseAllDocuments(yaml)
      .map((doc) => doc.toJSON())
      .filter(Boolean)
      .map((item) => IOLocaleItem.decode(item))

    if (itemValidations.some((item) => item.isLeft())) {
      const errors = itemValidations
        .filter(
          (item): item is Left<t.ValidationError[], LocaleComponent.Item> =>
            item.isLeft(),
        )
        .flatMap((e) => e.value)
      throw new Error(JSON.stringify(errors, null, '  '))
    }
    const items = itemValidations.map((e) => e.value as LocaleComponent.Item)
    return items
  },

  stringify(items: LocaleComponent.Item[]): string {
    return items.map((item) => YAML.stringify(item)).join('---\n')
  },

  async load(yamlPath: string): Promise<LocaleComponent.Item[]> {
    const yaml = await readFile(yamlPath)
    return this.parse(yaml)
  },
}
