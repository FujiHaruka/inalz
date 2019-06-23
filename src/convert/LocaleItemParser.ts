import YAML from 'yaml'
import { BUILTIN_ACTIONS } from '../Constants'
import { LocaleItem } from '../core/LocaleItem'
import { Lang } from '../types/InalzConfig'
import { fileExists, readFile } from '../util/fsUtil'
import {
  EmptyYamlDocumentError,
  InvalidLocaleItemError,
  LocaleNotFoundError,
  YamlParseError,
} from '../util/InalzError'
import { IOLocaleItem } from './IOLocaleItem'

const pickYamlParseErrors = (documents: YAML.ast.Document[]) =>
  documents
    .map((doc) => doc.errors)
    .map((errors, documentIndex) => ({
      documentIndex,
      error: errors[0] ? errors[0].message : null,
    }))
    .filter(({ error }) => Boolean(error))

export class LocaleItemParser {
  yamlPath?: string
  lang: Lang

  constructor(lang: Lang) {
    this.lang = lang
  }

  parse(yaml: string): LocaleItem[] {
    const documents = YAML.parseAllDocuments(yaml)
    const errors = pickYamlParseErrors(documents)
    if (errors.length > 0) {
      throw new YamlParseError(
        `Invalid yaml file: ${this.yamlPath}
For details:
${JSON.stringify(errors, null, 2)}`,
      )
    }
    const items = documents.map((document, index) =>
      this.validateItem(document, index),
    )
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

  private validateItem(document: YAML.ast.Document, index: number) {
    const json = document.toJSON()
    if (!json) {
      throw new EmptyYamlDocumentError(
        `Found empty document in ${this.yamlPath}`,
      )
    }
    const validation = IOLocaleItem.decode(json)

    if (validation.isLeft()) {
      const errors = validation.value
      throw new InvalidLocaleItemError(
        // TODO: error details
        `Invalid locale items in ${this.yamlPath}
Document:
${JSON.stringify({ document: json, index }, null, 2)}`,
      )
    }
    const item = new LocaleItem(this.lang, validation.value)
    return item
  }
}
