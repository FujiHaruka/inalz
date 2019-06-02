/**
 * Enable yaml global options
 */
export const enableYamlOptions = () => {
  const { strOptions } = require('yaml/types')
  strOptions.fold.lineWidth = 0
}
