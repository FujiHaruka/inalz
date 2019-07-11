import { SingleInalzConfig, Lang } from '../types/InalzConfig'
import { LocaleItemParser } from '../convert/LocaleItemParser'
import { countBy } from '../util/arrayUtil'
import { relative } from 'path'

export type ValidateResult = {
  localePath: string
  unused: number
  outdated: number
  err?: Error
}

export class ValidateCommand {
  baseDir: string
  lang: Lang
  localePath: string

  constructor({ baseDir, lang, document: { localePath } }: SingleInalzConfig) {
    this.baseDir = baseDir
    this.lang = lang
    this.localePath = localePath
  }

  async validate(): Promise<ValidateResult> {
    const { lang, baseDir, localePath } = this
    const parser = new LocaleItemParser(lang)

    try {
      const items = await parser.load(localePath)
      const unused = countBy(items, (item) =>
        Boolean(item.meta && item.meta.unused),
      )
      const outdated = countBy(items, (item) =>
        Boolean(item.meta && item.meta.outdated),
      )
      return {
        localePath: relative(baseDir, localePath),
        unused,
        outdated,
      }
    } catch (err) {
      return {
        localePath: relative(baseDir, localePath),
        unused: 0,
        outdated: 0,
        err,
      }
    }
  }
}
