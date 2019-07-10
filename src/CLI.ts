import commander, { Command } from 'commander'
import { BuildCommand, BuildResult } from './command/BuildCommand'
import { SyncCommand, SyncResult } from './command/SyncCommand'
import { InalzConfig } from './config/InalzConfig'
import { enableYamlOptions } from './util/enableYamlOptions'
import { InalzCLIError, handleError } from './util/InalzError'
import { printSyncResult, printBuildResult } from './util/logUtil'

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
  BUILD: 'build',
  INSPECT: 'inspect',
  SYNC: 'sync',
}

export const CLIActions: CLIActions = {
  async sync(options) {
    const { cwd } = options
    const config = await InalzConfig.findAndLoad(cwd)
    const results = await Promise.all<SyncResult>(
      config.each((config) => new SyncCommand(config).sync()),
    )
    printSyncResult(results)
    const failed = results.find(({ err }) => Boolean(err))
    if (failed) {
      process.exit(1)
    }
  },
  async build(options) {
    const { cwd } = options
    const config = await InalzConfig.findAndLoad(cwd)
    const results = (await Promise.all<BuildResult[]>(
      config.each((config) => new BuildCommand(config).build()),
    )).flat()
    printBuildResult(results)
    const failed = results.find(({ err }) => Boolean(err))
    if (failed) {
      process.exit(1)
    }
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
    return
  }
  const command = (commander.args[0] as any) as Command | string
  const commandName = typeof command === 'string' ? command : command._name
  if (!Object.values(CLICommands).includes(commandName)) {
    commander.outputHelp()
    handleError(new InalzCLIError(`No such command "${commandName}"`))
  }
}
