#!/usr/bin/env node

const vfile = require('to-vfile')
const remark = require('remark')
const toc = require('remark-toc')

const filePath = process.argv[2]
if (!filePath) {
  throw new Error('file path is not given')
}

remark()
  .use(toc)
  .process(vfile.readSync(filePath), function (err, file) {
    if (err) throw err
    vfile.writeSync(file)
  })