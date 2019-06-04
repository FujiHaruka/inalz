import commander from 'commander'
import { InalzConfig } from './InalzConfig'
import { LocaleSync } from './LocaleSync'
import { Translator } from './Translator'
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
        new LocaleSync(config.lang).sync(sourcePath, localePath, {
          merge: true,
        }),
      ),
    )
  },
  async build(options) {
    const { cwd } = options
    const config = await InalzConfig.findAndLoad(cwd)
    const translator = new Translator(config.lang)
    await Promise.all(
      config.documents.map((document) => translator.translate(document)),
    )
  },
}

export const CLI = (actions: CLIActions) => (argv: string[]) => {
  enableYamlOptions()

  commander.version(require('../package.json'))

  commander
    .command('sync')
    .description('Sync documents with locale files')
    .action((options) => actions.sync({ ...options, cwd: process.cwd() }))

  commander
    .command('build')
    .description('Build translations with locale files')
    .action((options) => actions.build({ ...options, cwd: process.cwd() }))

  commander.parse(argv)
}
