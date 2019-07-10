import glob from 'fast-glob'
import path from 'path'
import YAML from 'yaml'
import { LANG_PATH_PARAM } from '../Constants'
import { InalzConfigComponent, Lang } from '../types/InalzConfig'
import { firstExistsFile, readFile, statOrNull } from '../util/fsUtil'
import { InalzConfigError } from '../util/InalzError'
import { replaceExt, resolveDocumentPath } from '../util/pathUtil'
import { replaceAll } from '../util/stringUtil'
import { IOInalzConfig } from './IOInalzConfig'

const replaceLangParam = (dir: string, lang: string) =>
  replaceAll(dir, LANG_PATH_PARAM, lang).result

export class InalzConfig {
  configDir: string
  configPath: string

  lang: Lang = null as any
  documents: InalzConfigComponent.SingleDocument[] = null as any
  options: InalzConfigComponent.Options = {}

  private constructor(configPath: string) {
    configPath = path.resolve(process.cwd(), configPath)
    this.configDir = path.dirname(configPath)
    this.configPath = configPath
  }

  private async load() {
    const yml = await readFile(this.configPath)
    const config = YAML.parse(yml)
    const conf = InalzConfig.validate(config)
    this.lang = conf.lang
    this.documents = (await Promise.all(
      conf.documents.map((document) => this.resolveDocument(document)),
    ))
      .flat()
      .map((document) => resolveDocumentPath(this.configDir, document))
    this.options = conf.options || {}
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
      throw new InalzConfigError(
        `inalz config file ("inalz.yml") is not found in ${configDir}`,
      )
    }
    return InalzConfig.load(found)
  }

  static validate(config: any) {
    const validation = IOInalzConfig.decode(config)
    if (validation.isLeft()) {
      throw new InalzConfigError(
        // TODO: error details
        `Invaid inalz config`,
      )
    }
    const { lang, documents } = validation.value
    const targets = new Set(lang.targets)
    const pathModeDocs = documents.filter(
      (d) => d.linkMode === 'path',
    ) as InalzConfigComponent.PathModeDocument[]
    for (const document of pathModeDocs) {
      for (const targetLang of Object.keys(document.targets)) {
        if (!targets.has(targetLang)) {
          throw new InalzConfigError(
            `Invalid inalz config: "${targetLang}" is not in lang.targets`,
          )
        }
      }
    }
    return validation.value
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
        case 'path':
          return document.source
      }
    })()
    const sourcePath = path.resolve(
      this.configDir,
      replaceLangParam(sourcePathWithParam, this.lang.source),
    )
    const stat = await statOrNull(sourcePath)
    if (!stat) {
      throw new InalzConfigError(
        `Source path in inalz config is not directory or file: ${sourcePath}`,
      )
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
        console.warn(`Source path is neither directory nor file: ${sourcePath}`)
        return []
      }
      default:
        throw new InalzConfigError(
          `Invalid linkMode "${(document as any).linkMode}"`,
        )
    }
  }

  private async resolvePathMode(
    document: InalzConfigComponent.PathModeDocument,
  ): Promise<InalzConfigComponent.SingleDocument[]> {
    const sourceDir = path.resolve(
      this.configDir,
      replaceLangParam(document.source, this.lang.source),
    )
    const pattern = path.resolve(sourceDir, '**/*.md')
    const sourcePaths: string[] = await glob(pattern)
    const documents = sourcePaths.map((sourcePath) => ({
      sourcePath,
      targetPaths: Object.fromEntries(
        this.lang.targets.map((target) => [
          target,
          path.resolve(
            this.configDir,
            replaceLangParam(document.targets[target], target),
            path.relative(sourceDir, sourcePath),
          ),
        ]),
      ),
      localePath: replaceExt(
        path.resolve(
          this.configDir,
          document.locale,
          path.relative(sourceDir, sourcePath),
        ),
        '.yml',
      ),
    }))
    return documents
  }
}
