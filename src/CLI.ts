import commander, { Command } from 'commander'
import { BuildCommand, BuildResult } from './command/BuildCommand'
import { SyncCommand, SyncResult } from './command/SyncCommand'
import { InalzConfig } from './config/InalzConfig'
import { enableYamlOptions } from './util/enableYamlOptions'
import { InalzCLIError, handleError } from './util/InalzError'
import {
  printSyncResult,
  printBuildResult,
  printValidateResult,
  printValidationFailed,
} from './util/logUtil'
import { ValidateCommand, ValidateResult } from './command/ValidateCommand'

interface BaseOptions {
  cwd: string
}

interface SyncOptions extends BaseOptions {}

interface BuildOptions extends BaseOptions {}

interface ValidateOptions extends BaseOptions {}

const CLICommands = {
  BUILD: 'build',
  VALIDATE: 'validate',
  SYNC: 'sync',
}

export const CLIActions = {
  async sync(options: SyncOptions) {
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
  async build(options: BuildOptions) {
    const { cwd } = options
    const config = await InalzConfig.findAndLoad(cwd)
    const validationResults = await Promise.all<ValidateResult>(
      config.each((config) => new ValidateCommand(config).validate()),
    )
    const validationFailed = validationResults.some(
      ({ unused, outdated, err }) => Boolean(unused > 0 || outdated > 0 || err),
    )
    if (validationFailed) {
      printValidationFailed()
      process.exit(1)
    }
    const results = (await Promise.all<BuildResult[]>(
      config.each((config) => new BuildCommand(config).build()),
    )).flat()
    printBuildResult(results)
    const failed = results.find(({ err }) => Boolean(err))
    if (failed) {
      process.exit(1)
    }
  },
  async validate(options: ValidateOptions) {
    const { cwd } = options
    const config = await InalzConfig.findAndLoad(cwd)
    const results = await Promise.all<ValidateResult>(
      config.each((config) => new ValidateCommand(config).validate()),
    )
    printValidateResult(results)
  },
}

export const CLI = (actions: typeof CLIActions) => (argv: string[]) => {
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
    .description('Build translated documents from locale files')
    .action((options) =>
      actions.build({ ...options, cwd: process.cwd() }).catch(handleError),
    )

  commander
    .command(CLICommands.VALIDATE)
    .description('Validate locale files')
    .action((options) =>
      actions.validate({ ...options, cwd: process.cwd() }).catch(handleError),
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
