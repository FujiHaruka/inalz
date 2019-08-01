import glob from 'fast-glob'
import path from 'path'
import YAML from 'yaml'
import {
  InalzConfigComponent,
  Lang,
  ResolvedDocument,
  SingleInalzConfig,
} from '../types/InalzConfig'
import { firstExistsFile, readFile, statOrNull } from '../util/fsUtil'
import { InalzConfigError } from '../util/InalzError'
import { replaceExt, resolveDocumentPath } from '../util/pathUtil'
import { IOInalzConfig } from './IOInalzConfig'
import { isLeft } from 'fp-ts/lib/Either'
import { deepEquals } from '../util/objectUtil'
import { printWarning } from '../util/logUtil'

export const InalzConfigDefaultOptions: InalzConfigComponent.Options = {
  lineIgnorePatterns: [],
  documentExtension: '.md',
  markdownOptions: {},
}

export const InalzConfigDefaultMiddlewares: InalzConfigComponent.Middlewares = {
  preSync: [],
  postBuild: [],
}

export const InalzConfigDefaultMiddlewareModules: InalzConfigComponent.MiddlewareModules = {
  preSync: [],
  postBuild: [],
}

export class InalzConfig {
  configDir: string
  configPath: string

  lang: Lang = null as any
  documents: ResolvedDocument[] = null as any
  options: InalzConfigComponent.Options = InalzConfigDefaultOptions
  middlewares: InalzConfigComponent.Middlewares = null as any
  middlewareModules: InalzConfigComponent.MiddlewareModules = null as any

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
    this.options = { ...this.options, ...(conf.options || {}) }
    this.middlewares = {
      ...InalzConfigDefaultMiddlewares,
      ...(conf.middlewares || {}),
    }
    const requireMw = this.requireMiddleware.bind(this)
    this.middlewareModules = {
      preSync: this.middlewares.preSync.map(requireMw),
      postBuild: this.middlewares.postBuild.map(requireMw),
    }
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

  static validate(config: any, options: { strict?: boolean } = {}) {
    const { strict = false } = options
    const validation = IOInalzConfig.decode(config)
    if (isLeft(validation)) {
      throw new InalzConfigError(
        // TODO: error details
        `Invaid inalz config`,
      )
    }
    const { lang, documents } = validation.right
    const targets = new Set(lang.targets)
    for (const document of documents) {
      for (const targetLang of Object.keys(document.targets)) {
        if (!targets.has(targetLang)) {
          throw new InalzConfigError(
            `Invalid inalz config: "${targetLang}" is not in lang.targets`,
          )
        }
      }
    }
    const validConfig = validation.right
    const equals = deepEquals(config, validConfig)
    if (!equals) {
      const deepDiff = require('deep-diff') // no type def
      const additional = deepDiff(validConfig, config)
        .filter((d: any) => d.kind === 'N')
        .map((d: any) => d.path.join('.'))
      if (strict) {
        throw new InalzConfigError(
          `Detected additional fields in inalz config: ${JSON.stringify(
            additional,
          )}`,
        )
      } else {
        printWarning(
          `Detected additional fields in inalz config. They are just ignored: ${JSON.stringify(
            additional,
          )}`,
        )
      }
    }
    return validConfig
  }

  each(callback: (config: SingleInalzConfig) => any) {
    return this.documents
      .map(
        (document): SingleInalzConfig => ({
          baseDir: this.configDir,
          lang: this.lang,
          document,
          options: this.options,
          middlewareModules: this.middlewareModules,
        }),
      )
      .map((config) => callback(config))
  }

  async resolveDocument(
    document: InalzConfigComponent.Document,
  ): Promise<ResolvedDocument[]> {
    const sourcePath = path.resolve(this.configDir, document.source)
    const stat = await statOrNull(sourcePath)
    if (!stat) {
      throw new InalzConfigError(
        `Source path in inalz config is not directory or file: ${sourcePath}`,
      )
    }
    const isDirectory = stat.isDirectory()
    const isFile = stat.isFile()

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
    console.warn(
      `[WARNING] sourcePath is neither directory nor file: ${sourcePath}`,
    )
    return []
  }

  private async resolvePathMode(
    document: InalzConfigComponent.Document,
  ): Promise<ResolvedDocument[]> {
    const sourceDir = path.resolve(this.configDir, document.source)
    const pattern = path.resolve(
      sourceDir,
      `**/*${this.options.documentExtension}`,
    )
    const sourcePaths: string[] = await glob(pattern)
    const documents = sourcePaths.map((sourcePath) => ({
      sourcePath,
      targetPaths: Object.fromEntries(
        this.lang.targets.map((target) => [
          target,
          path.resolve(
            this.configDir,
            document.targets[target],
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

  private requireMiddleware(
    name: string,
  ): InalzConfigComponent.MiddlewareModules {
    const isRelativePath = name.startsWith('./')
    if (isRelativePath) {
      return require(path.resolve(this.configDir, name))
    } else {
      return require(name)
    }
  }
}
