export type Lang = {
  source: string
  targets: string[]
}

export interface InalzConfigInterface {
  lang: Lang
  documents: InalzConfigComponent.Document[]
  paragraphIgnorePatterns?: string[]
}

export namespace InalzConfigComponent {
  export type Document =
    | FilenameModeDocument
    | DirectoryModeDocument
    | PathModeDocument

  export type FilenameModeDocument = {
    linkMode: 'filename'
    contentDir: string
    localeDir: string
  }

  export type DirectoryModeDocument = {
    linkMode: 'directory'
    contentDir: string
    localeDir: string
  }

  export type PathModeDocument = {
    linkMode: 'path'
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

  export type LinkMode = 'filename' | 'directory' | 'path'
}
