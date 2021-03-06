import { printError } from './logUtil'

/**
 * Custom error classes
 */

export class InalzErrorBase extends Error {
  handled = true
}

export class InalzCLIError extends InalzErrorBase {
  name = 'InalzCLIError'
}

export class InalzConfigError extends InalzErrorBase {
  name = 'InalzConfigError'
}

export class YamlParseError extends InalzErrorBase {
  name = 'YamlParseError'
}

export class LocaleNotFoundError extends InalzErrorBase {
  name = 'LocaleNotFoundError'
}

export class InvalidLocaleItemError extends InalzErrorBase {
  name = 'InvalidLocaleItemError'
}

export class BuildFailedError extends InalzErrorBase {
  name = 'BuildFailedError'
}

export class InvalidLocaleItemLengthError extends InalzErrorBase {
  name = 'InvalidLocaleItemLengthError'
}

export class InconsistentSourceTextError extends InalzErrorBase {
  name = 'InconsistentSourceTextError'
}

export const handleError = (error: InalzErrorBase) => {
  if (error.handled) {
    printError(error)
    process.exit(1)
  } else {
    throw error
  }
}
