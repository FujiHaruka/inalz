import YAML from 'yaml'
import path from 'path'
import glob from 'fast-glob'
import { readFile, firstExistsFile, statOrNull } from './util/fsUtil'
import { InalzConfigComponent, Lang } from './types/InalzConfig'
import { IOInalzConfig } from './IOTypes'
import { replaceExt } from './util/pathUtil'
import { LANG_PATH_PARAM } from './Constants'
import { replaceAll } from './util/stringUtil'

const replaceLangParam = (dir: string, lang: string) =>
  replaceAll(dir, LANG_PATH_PARAM, lang)

export class InalzConfig {
  configPath: string

  lang: Lang = null as any
  documents: InalzConfigComponent.SingleDocument[] = null as any
  paragraphIgnorePatterns: string[] = []

  private constructor(configPath: string) {
    this.configPath = configPath
  }

  private async load() {
    const yml = await readFile(this.configPath)
    const config = YAML.parse(yml)
    const validation = IOInalzConfig.decode(config)
    if (validation.isLeft()) {
      throw new Error(`Invaid inalz config ${path.basename(this.configPath)}`)
    }
    const conf = validation.value
    this.lang = conf.lang
    this.documents = (await Promise.all(
      conf.documents.map((document) => this.resolveDocument(document)),
    )).flat()
    this.paragraphIgnorePatterns = conf.paragraphIgnorePatterns || []
  }

  static async load(configPath: string) {
    const config = new InalzConfig(configPath)
    await config.load()
    return config
  }

  /**
   * Find and load the config file on `configDir`
   */
  static async findAndLoad(configDir: string) {
    const baseName = 'inalz'
    const paths = ['.yml', '.yaml', '.json']
      .map((ext) => baseName + ext)
      .map((name) => path.join(configDir, name))
    const found = await firstExistsFile(paths)
    if (!found) {
      throw new Error(
        `inalz config file is not found such as "inalz.yml" in ${configDir}`,
      )
    }
    return InalzConfig.load(found)
  }

  /**
   * resolve `Document` to "path" linkMode
   */
  async resolveDocument(
    document: InalzConfigComponent.Document,
  ): Promise<InalzConfigComponent.SingleDocument[]> {
    if (!document.linkMode) {
      document.linkMode = 'path'
    }
    const sourcePathWithParam = (() => {
      switch (document.linkMode) {
        case 'filename':
        case 'directory':
          return document.contentDir
        case 'path':
          return document.source
      }
    })()
    const sourcePath = replaceLangParam(sourcePathWithParam, this.lang.source)
    const stat = await statOrNull(sourcePath)
    if (!stat) {
      console.warn(`Path not found ${sourcePath}`)
      return []
    }
    const isDirectory = stat.isDirectory()
    const isFile = stat.isFile()

    switch (document.linkMode) {
      case 'path': {
        if (isFile) {
          return [
            {
              sourcePath: document.source,
              targetPaths: document.targets,
              localePath: document.locale,
            },
          ]
        }
        if (isDirectory) {
          return this.resolvePathMode(document)
        }
        return []
      }
      case 'filename': {
        if (!isDirectory) {
          console.warn(
            `document contentDir is not directory: ${document.contentDir}`,
          )
          return []
        }
        return this.resolveFilenameMode(document)
      }
      case 'directory': {
        if (!isDirectory) {
          console.warn(
            `document contentDir is not directory: ${document.contentDir}`,
          )
          return []
        }
        return this.resolveDirectoryMode(document)
      }
      default:
        throw new Error(`Invalid linkMode "${(document as any).linkMode}"`)
    }
  }

  private async resolveFilenameMode(
    document: InalzConfigComponent.FilenameModeDocument,
  ): Promise<InalzConfigComponent.SingleDocument[]> {
    const pattern = path.join(
      document.contentDir,
      `**/*.${this.lang.source}.md`,
    )
    const files: string[] = await glob(pattern)
    const targetsExtensions = this.lang.targets.map((target) => `.${target}.md`)
    const isTarget = (file: string) =>
      Boolean(targetsExtensions.find((ext) => file.endsWith(ext)))
    const sourcePaths = files.filter((file) => !isTarget(file))
    const documents = sourcePaths.map((sourcePath) => ({
      sourcePath,
      targetPaths: Object.fromEntries(
        this.lang.targets.map((target) => [
          target,
          replaceExt(sourcePath, `.${target}.md`, { depth: 2 }),
        ]),
      ),
      localePath: replaceExt(
        path.join(
          document.localeDir,
          path.relative(document.contentDir, sourcePath),
        ),
        '.yml',
        { depth: 2 },
      ),
    }))
    return documents
  }

  private async resolveDirectoryMode(
    document: InalzConfigComponent.DirectoryModeDocument,
  ): Promise<InalzConfigComponent.SingleDocument[]> {
    if (!document.contentDir.includes(LANG_PATH_PARAM)) {
      throw new Error(
        `Invalid inalz config: if linkMode is "directory", contentDir path must include "${LANG_PATH_PARAM}" parameter`,
      )
    }
    const sourceDir = replaceLangParam(document.contentDir, this.lang.source)
    const pattern = path.join(sourceDir, '**/*.md')
    const sourcePaths: string[] = await glob(pattern)
    const documents = sourcePaths.map((sourcePath) => ({
      sourcePath,
      targetPaths: Object.fromEntries(
        this.lang.targets.map((target) => [
          target,
          path.join(
            replaceLangParam(document.contentDir, target),
            path.relative(sourceDir, sourcePath),
          ),
        ]),
      ),
      localePath: replaceExt(
        path.join(document.localeDir, path.relative(sourceDir, sourcePath)),
        '.yml',
      ),
    }))
    return documents
  }

  private async resolvePathMode(
    document: InalzConfigComponent.PathModeDocument,
  ): Promise<InalzConfigComponent.SingleDocument[]> {
    const sourceDir = replaceLangParam(document.source, this.lang.source)
    const pattern = path.join(sourceDir, '**/*.md')
    const sourcePaths: string[] = await glob(pattern)
    const documents = sourcePaths.map((sourcePath) => ({
      sourcePath,
      targetPaths: Object.fromEntries(
        this.lang.targets.map((target) => [
          target,
          path.join(
            replaceLangParam(document.targets[target], target),
            path.relative(sourceDir, sourcePath),
          ),
        ]),
      ),
      localePath: replaceExt(
        path.join(document.locale, path.relative(sourceDir, sourcePath)),
        '.yml',
      ),
    }))
    return documents
  }
}
