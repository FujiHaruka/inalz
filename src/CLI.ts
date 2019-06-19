import commander from 'commander'
import { InalzConfig } from './config/InalzConfig'
import { LocaleSync } from './command/LocaleSync'
import { Translator } from './command/Translator'
import { enableYamlOptions } from './util/enableYamlOptions'

interface BaseOptions {
  cwd: string
}

interface SyncOptions extends BaseOptions {}

interface BuildOptions extends BaseOptions {}

interface CLIActions {
  sync: (options: SyncOptions) => Promise<void>
  build: (options: BuildOptions) => Promise<void>
}

export const CLIActions: CLIActions = {
  async sync(options) {
    const { cwd } = options
    const config = await InalzConfig.findAndLoad(cwd)
    await Promise.all(
      config.documents.map(({ sourcePath, localePath }) =>
        new LocaleSync(config.lang, config.options).sync(
          sourcePath,
          localePath,
        ),
      ),
    )
  },
  async build(options) {
    const { cwd } = options
    const config = await InalzConfig.findAndLoad(cwd)
    const translator = new Translator(config)
    await Promise.all(
      config.documents.map((document) => translator.translate(document)),
    )
  },
}

export const CLI = (actions: CLIActions) => (argv: string[]) => {
  enableYamlOptions()

  commander.version(require('../package.json').version, '-v, --version')

  commander
    .command('sync')
    .description('Sync documents with locale files')
    .action((options) => actions.sync({ ...options, cwd: process.cwd() }))

  commander
    .command('build')
    .description('Build translations with locale files')
    .action((options) => actions.build({ ...options, cwd: process.cwd() }))

  commander.parse(argv)

  if (commander.args.length === 0) {
    commander.outputHelp()
  }
}
