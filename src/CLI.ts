import commander, { Command } from 'commander'
import chalk from 'chalk'
import { InalzConfig } from './config/InalzConfig'
import { SyncCommand } from './command/SyncCommand'
import { BuildCommand } from './command/BuildCommand'
import { enableYamlOptions } from './util/enableYamlOptions'
import { InalzCLIError, InalzErrorBase } from './util/InalzError'

interface BaseOptions {
  cwd: string
}

interface SyncOptions extends BaseOptions {}

interface BuildOptions extends BaseOptions {}

interface CLIActions {
  sync: (options: SyncOptions) => Promise<void>
  build: (options: BuildOptions) => Promise<void>
}

const CLICommands = {
  SYNC: 'sync',
  BUILD: 'build',
}

const handleError = (error: InalzErrorBase) => {
  if (error.handled) {
    const message = `[${error.name}] ${error.message}`
    console.error('\n' + chalk.redBright(message) + '\n')
    process.exit(1)
  } else {
    throw error
  }
}

export const CLIActions: CLIActions = {
  async sync(options) {
    const { cwd } = options
    const config = await InalzConfig.findAndLoad(cwd)
    await Promise.all(
      config.documents.map(({ sourcePath, localePath }) =>
        new SyncCommand(config.lang, config.options).sync(
          sourcePath,
          localePath,
        ),
      ),
    )
  },
  async build(options) {
    const { cwd } = options
    const config = await InalzConfig.findAndLoad(cwd)
    const builder = new BuildCommand(config)
    await Promise.all(
      config.documents.map((document) => builder.build(document)),
    )
  },
}

export const CLI = (actions: CLIActions) => (argv: string[]) => {
  enableYamlOptions()

  commander.version(require('../package.json').version, '-v, --version')

  commander
    .command(CLICommands.SYNC)
    .description('Sync documents with locale files')
    .action((options) =>
      actions.sync({ ...options, cwd: process.cwd() }).catch(handleError),
    )

  commander
    .command(CLICommands.BUILD)
    .description('Build translations from locale files')
    .action((options) =>
      actions.build({ ...options, cwd: process.cwd() }).catch(handleError),
    )

  commander.parse(argv)

  if (commander.args.length === 0) {
    commander.outputHelp()
  }
  const command = (commander.args[0] as any) as Command | string
  const commandName = typeof command === 'string' ? command : command._name
  if (!Object.values(CLICommands).includes(commandName)) {
    commander.outputHelp()
    handleError(new InalzCLIError(`No such command "${commandName}"`))
  }
}
