export type Lang = {
  source: string
  targets: string[]
}

export interface InalzConfigInterface {
  lang: Lang
  documents: InalzConfigComponent.Document[]
  options?: Partial<InalzConfigComponent.Options>
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
}

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
    paragraphIgnorePatterns: string[]
    documentExtension: string
  }
  export type BuildOptions = {}

  export type Options = SyncOptions & BuildOptions
}
