import chalk from 'chalk'
import { countBy } from './arrayUtil'
import { SyncResult } from '../command/SyncCommand'
import { BuildResult } from '../command/BuildCommand'
import { inspect } from 'util'

// --- helpers

const countByStatus = (results: any[], status: string) =>
  countBy(results, (result) => result.status === status)
const greenIfPositive = (count: number) =>
  count > 0 ? chalk.greenBright(String(count)) : String(count)
const redIfPositive = (count: number) =>
  count > 0 ? chalk.redBright(String(count)) : String(count)
const indentWidth = (n: number) => new Array(n).fill(' ').join('')
const indentLines = (lines: string[], indent: number) =>
  indentWidth(indent) + lines.join('\n' + indentWidth(indent))

// --- loggers

const log = console.log
const error = (text: string) => console.error('\n' + chalk.red(text) + '\n')
const strong = (text: string) => console.log(chalk.whiteBright(text))
const indented = (lines: string[], indent: number) =>
  log(indentLines(lines, indent))

// --- module

export const printSyncResult = (results: SyncResult[]) => {
  const createdCount = countByStatus(results, 'created')
  const updatedCount = countByStatus(results, 'updated')

  log(`Sync completed.`)
  if (createdCount > 0) {
    strong('\nCREATED:')
    indented(
      results
        .filter(({ status }) => status === 'created')
        .map((result) => result.localePath),
      2,
    )
  }
  if (updatedCount > 0) {
    strong('\nUPDATED:')
    indented(
      results
        .filter(({ status }) => status === 'updated')
        .map((result) => result.localePath),
      2,
    )
  }

  strong('\nSUMMARY:')
  indented(
    [
      `${greenIfPositive(createdCount)} created.`,
      `${greenIfPositive(updatedCount)} updated.`,
    ],
    2,
  )
}

export const printBuildResult = (results: BuildResult[]) => {
  const createdCount = countByStatus(results, 'created')
  const updatedCount = countByStatus(results, 'updated')
  const failedCount = countByStatus(results, 'failed')

  log('Build completed.')
  if (createdCount > 0) {
    strong('\nCREATED:')
    indented(
      results
        .filter(({ status }) => status === 'created')
        .map((result) => result.targetPath),
      2,
    )
  }
  if (updatedCount > 0) {
    strong('\nUPDATED:')
    indented(
      results
        .filter(({ status }) => status === 'updated')
        .map((result) => result.targetPath),
      2,
    )
  }
  if (failedCount > 0) {
    strong('\nFAILED:')
    const failed = results.filter(({ status }) => status === 'failed')
    indented(failed.map((result) => result.targetPath), 2)
    failed.forEach(({ err }) => {
      if (err) {
        error(inspect(err))
      }
    })
  }

  strong('\nSUMMARY:')
  indented(
    [
      `${greenIfPositive(createdCount)} created.`,
      `${greenIfPositive(updatedCount)} updated.`,
      `${redIfPositive(failedCount)} failed.`,
    ],
    2,
  )
}

export const printError = (err: Error) => {
  const message = `[${err.name}] ${err.message}`
  error(message)
}
