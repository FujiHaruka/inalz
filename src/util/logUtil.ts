import chalk from 'chalk'
import { countBy } from './arrayUtil'
import { SyncResult } from '../command/SyncCommand'

const greenIfPositive = (count: number) =>
  count > 0 ? chalk.greenBright(String(count)) : String(count)

export const printSyncResult = (results: SyncResult[]) => {
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

export const printError = (error: Error) => {
  const message = `[${error.name}] ${error.message}`
  console.error('\n' + chalk.redBright(message) + '\n')
}
