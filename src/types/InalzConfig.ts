export type Lang = {
  source: string
  targets: string[]
}

export interface InalzConfigInterface {
  lang: Lang
  documents: InalzConfigComponent.Document[]
  options?: InalzConfigComponent.Options
}

export namespace InalzConfigComponent {
  export type Document = PathModeDocument

  export type PathModeDocument = {
    linkMode?: 'path'
    source: string
    targets: {
      [lang: string]: string
    }
    locale: string
  }

  export type SingleDocument = {
    sourcePath: string
    targetPaths: {
      [lang: string]: string
    }
    localePath: string
  }

  export type LinkMode = 'filename' | 'path'

  export type SyncOptions = {
    lineIgnorePatterns: string[]
    paragraphIgnorePatterns: string[]
  }
  export type BuildOptions = {}

  export type Options = Partial<SyncOptions> & Partial<BuildOptions>
}
