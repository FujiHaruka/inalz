/**
 * CLI endpoint for development
 */

import { CLI, CLIActions } from '../src/CLI'

const cli = CLI(CLIActions)
cli(process.argv)
