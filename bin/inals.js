#!/usr/bin/env node
/**
 * CLI endpoint
 */

const {CLI, CLIActions} = require('../dist/CLI')
const cli = CLI(CLIActions)
cli(process.argv)
