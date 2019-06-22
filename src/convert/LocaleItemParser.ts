import YAML from 'yaml'
import * as t from 'io-ts'
import { Left } from 'fp-ts/lib/Either'
import { LocaleComponent } from '../types/Locale'
import { IOLocaleItem } from './IOLocaleItem'
import { readFile, fileExists } from '../util/fsUtil'
import { LocaleItem } from '../core/LocaleItem'
import { Lang } from '../types/InalzConfig'
import { BUILTIN_ACTIONS } from '../Constants'
import {
  YamlParseError,
  LocaleNotFoundError,
  InvalidLocaleItemError,
} from '../util/InalzError'

export class LocaleItemParser {
  yamlPath?: string
  lang: Lang

  constructor(lang: Lang) {
    this.lang = lang
  }

  parse(yaml: string): LocaleItem[] {
    const documents = YAML.parseAllDocuments(yaml)
    const errors = documents
      .map((doc) => doc.errors)
      .map((errors, documentIndex) => ({
        documentIndex,
        error: errors[0] ? errors[0].message : null,
      }))
      .filter(({ error }) => Boolean(error))
    if (errors.length > 0) {
      throw new YamlParseError(
        `Invalid yaml file: ${this.yamlPath}
For details:
${JSON.stringify(errors, null, 2)}`,
      )
    }
    const itemValidations = documents
      .map((doc) => doc.toJSON())
      .filter(Boolean)
      .map((item) => IOLocaleItem.decode(item))

    if (itemValidations.some((item) => item.isLeft())) {
      const errors = itemValidations
        .map((validation, documentIndex) => ({
          validation,
          documentIndex,
        }))
        .filter(
          ({ validation }) =>
            validation.isLeft() && validation.value.length > 0,
        )
        .map(({ validation, documentIndex }) => ({
          documentIndex,
          document: documents[documentIndex],
          // error: (validation.value as t.Errors)[0],
        }))
      throw new InvalidLocaleItemError(
        // TODO: error details
        `There is invalid locale items in ${this.yamlPath}
For details:
${JSON.stringify(errors, null, 2)}`,
      )
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
    return items.map((item) => YAML.stringify(item.toObject())).join('---\n')
  }

  async load(yamlPath: string): Promise<LocaleItem[]> {
    if (!(await fileExists(yamlPath))) {
      throw new LocaleNotFoundError(`Locale file not found: ${yamlPath}`)
    }
    const yaml = await readFile(yamlPath)
    this.yamlPath = yamlPath
    return this.parse(yaml)
  }
}
