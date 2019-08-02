import { RemarkStringifyOptions } from 'remark-stringify/types'

export type Lang = {
  source: string
  targets: string[]
}

export interface InalzConfigInterface {
  lang: Lang
  documents: InalzConfigComponent.Document[]
  options?: Partial<InalzConfigComponent.Options>
  middlewares?: Partial<InalzConfigComponent.Middlewares>
}

export type ResolvedDocument = {
  sourcePath: string
  targetPaths: {
    [lang: string]: string
  }
  localePath: string
}

export type SingleInalzConfig = {
  baseDir: string
  lang: Lang
  document: ResolvedDocument
  options: InalzConfigComponent.Options
  middlewareModules: InalzConfigComponent.MiddlewareModules
}

export type InalzMiddleware = (
  text: string,
  meta: { filepath: string },
) => string

export namespace InalzConfigComponent {
  export type Document = {
    source: string
    targets: {
      [lang: string]: string
    }
    locale: string
  }

  export type SyncOptions = {
    lineIgnorePatterns: string[]
    documentExtension: string
  }
  export type BuildOptions = {
    lineIgnorePatterns: string[]
    markdownOptions: Partial<RemarkStringifyOptions>
  }

  export type Options = SyncOptions & BuildOptions

  export type Middlewares = {
    processSource: string[]
    processTarget: string[]
  }

  export type MiddlewareModules = {
    [P in keyof Middlewares]: InalzMiddleware[]
  }
}
