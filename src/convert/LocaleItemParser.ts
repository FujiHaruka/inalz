import YAML from 'yaml'
import { BUILTIN_ACTIONS } from '../Constants'
import { LocaleItem } from '../core/LocaleItem'
import { Lang } from '../types/InalzConfig'
import { fileExists, readFile } from '../util/fsUtil'
import {
  InvalidLocaleItemError,
  LocaleNotFoundError,
  YamlParseError,
} from '../util/InalzError'
import { IOLocaleItem } from './IOLocaleItem'
import { isLeft } from 'fp-ts/lib/Either'
import { LocaleComponent } from '../types/Locale'

const EMPTY_ITEMS_MESSAGE =
  '# There is no locale items, but this file has a meaning for "build" command.\n'

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

  /**
   * yaml string -> LocaleItem[]
   * used by "build"
   */
  parseYaml(yaml: string): LocaleItem[] {
    const { lang } = this
    const documents = YAML.parseAllDocuments(yaml)
    const errors = pickYamlParseErrors(documents)
    if (errors.length > 0) {
      throw new YamlParseError(
        `Invalid yaml file: ${this.yamlPath}
For details:
${JSON.stringify(errors, null, 2)}`,
      )
    }
    const items = documents
      .map((document, index) => this.validateItem(document, index))
      .filter((item): item is LocaleComponent.Item => Boolean(item))
      .map((item) => new LocaleItem(lang, item))
    return items
  }

  /**
   * markdown paragraph text -> LocaleItem
   * used by "sync"
   */
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
    if (items.length === 0) {
      // 空の場合はそのままだと空ファイルになるのでコメントだけ残す
      return EMPTY_ITEMS_MESSAGE
    }
    return items.map((item) => YAML.stringify(item.toObject())).join('---\n')
  }

  async load(yamlPath: string): Promise<LocaleItem[]> {
    if (!(await fileExists(yamlPath))) {
      throw new LocaleNotFoundError(`Locale file not found: ${yamlPath}`)
    }
    const yaml = await readFile(yamlPath)
    this.yamlPath = yamlPath
    return this.parseYaml(yaml)
  }

  private validateItem(
    document: YAML.ast.Document,
    index: number,
  ): LocaleComponent.Item | null {
    const json = document.toJSON()
    if (!json) {
      // 空 yaml は valid
      return null
    }
    const validation = IOLocaleItem.decode(json)

    if (isLeft(validation)) {
      throw new InvalidLocaleItemError(
        // TODO: error details
        `Invalid locale items in ${this.yamlPath}
Document:
${JSON.stringify({ document: json, index }, null, 2)}`,
      )
    }
    return validation.right
  }
}
