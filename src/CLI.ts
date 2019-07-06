import chalk from 'chalk'
import commander, { Command } from 'commander'
import { BuildCommand } from './command/BuildCommand'
import { SyncCommand, SyncResult } from './command/SyncCommand'
import { InalzConfig } from './config/InalzConfig'
import { enableYamlOptions } from './util/enableYamlOptions'
import { InalzCLIError, InalzErrorBase } from './util/InalzError'
import { countBy } from './util/arrayUtil'

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
const greenIfPositive = (count: number) =>
  count > 0 ? chalk.greenBright(String(count)) : String(count)

const printSyncResult = (results: SyncResult[]) => {
  const created = greenIfPositive(
    countBy(results, ({ status }) => status === 'created'),
  )
  const updated = greenIfPositive(
    countBy(results, ({ status }) => status === 'updated'),
  )

  console.log(`Sync completed:
  ${created} new files. ${updated} updated files.
`)
}

export const CLIActions: CLIActions = {
  async sync(options) {
    const { cwd } = options
    const config = await InalzConfig.findAndLoad(cwd)
    const results = await Promise.all(
      config.documents.map(({ sourcePath, localePath }) =>
        new SyncCommand(config.lang, config.options).sync(
          sourcePath,
          localePath,
        ),
      ),
    )
    printSyncResult(results)
  },
  async build(options) {
    const { cwd } = options
    const config = await InalzConfig.findAndLoad(cwd)
    await Promise.all(
      config.documents.map((document) =>
        new BuildCommand(config, document).build(),
      ),
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
    return
  }
  const command = (commander.args[0] as any) as Command | string
  const commandName = typeof command === 'string' ? command : command._name
  if (!Object.values(CLICommands).includes(commandName)) {
    commander.outputHelp()
    handleError(new InalzCLIError(`No such command "${commandName}"`))
  }
}
