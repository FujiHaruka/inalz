export type Lang = {
  source: string
  targets: string[]
}

export interface InalzConfigInterface {
  lang: Lang
  documents: InalzConfigComponent.Document[]
  options: InalzConfigComponent.Options
  plugins: InalzConfigComponent.Plugins
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

  export type LinkMode = 'filename' | 'directory' | 'path'

  export type SyncOptions = {
    paragraphIgnorePatterns: string[]
    enableLinkVariable: boolean
  }
  export type BuildOptions = {}

  export type Options = Partial<SyncOptions> & Partial<BuildOptions>

  export type Plugins = {
    [name: string]: PluginSettings
  }

  export type PluginSettings = null | {
    [key: string]: YamlScalar
  }

  export type YamlScalar = string | number | null | boolean
}
