export interface InalzConfigInterface {
  lang: InalzConfigComponent.Lang
  documents: InalzConfigComponent.Document[]
}

export namespace InalzConfigComponent {
  export type Lang = {
    source: string
    targets: string[]
  }

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
    sourcePath: string
    targetPaths: {
      [lang: string]: string
    }
    localePath: string
  }

  export type LinkMode = 'filename' | 'directory' | 'path'
}
