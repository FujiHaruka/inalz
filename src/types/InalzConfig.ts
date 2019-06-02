export interface InalzConfigInterface {
  lang: InalzConfigComponent.Lang
  documents: InalzConfigComponent.Document[]
  vocabularies?: string[]
}

export namespace InalzConfigComponent {
  export type Lang = {
    source: string
    targets: string[]
  }

  export type Document =
    | {
        linkMode: 'filename'
        contentDir: string
        localeDir: string
      }
    | {
        linkMode: 'directory'
        contentDir: string
        localeDir: string
      }
    | {
        linkMode: 'path'
        sourcePath: string
        targetPaths: string[]
        localePath: string
      }

  export type LinkMode = 'filename' | 'directory' | 'path'
}
