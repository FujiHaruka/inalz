import { Lang } from './InalzConfig'

export interface LocaleInterface {
  lang: Lang
  items: LocaleComponent.Item[]
}

export namespace LocaleComponent {
  export type Item = {
    meta?: ItemMeta
    texts: { [lang: string]: string }
  }

  export type ItemMeta = {
    outdated?: boolean
    warnings?: string[]
  }
}
