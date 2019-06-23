/**
 * Custom error classes for CLI
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

export class EmptyYamlDocumentError extends InalzErrorBase {
  name = 'EmptyYamlDocumentError'
}
