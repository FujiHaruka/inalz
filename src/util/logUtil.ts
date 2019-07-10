import chalk from 'chalk'
import { countBy } from './arrayUtil'
import { SyncResult } from '../command/SyncCommand'

const log = console.log
const error = console.error

const greenIfPositive = (count: number) =>
  count > 0 ? chalk.greenBright(String(count)) : String(count)
const plural = (count: number) => (count > 0 ? 's' : '')

export const printSyncResult = (results: SyncResult[]) => {
  const createdCount = countBy(results, ({ status }) => status === 'created')
  const updatedCount = countBy(results, ({ status }) => status === 'updated')

  log(`Sync completed.`)
  if (createdCount > 0) {
    log(`
CREATED:
  ${results
    .filter(({ status }) => status === 'created')
    .map((result) => result.localePath)
    .join('\n  ')}`)
  }
  if (updatedCount) {
    log(`
UPDATED:
  ${results
    .filter(({ status }) => status === 'updated')
    .map((result) => result.localePath)
    .join('\n  ')}`)
  }

  log(
    `
SUMMARY:
  ${greenIfPositive(createdCount)} created file${plural(
      createdCount,
    )}. ${greenIfPositive(updatedCount)} updated file${plural(updatedCount)}.`,
  )
}

export const printError = (err: Error) => {
  const message = `[${err.name}] ${err.message}`
  error('\n' + chalk.redBright(message) + '\n')
}
