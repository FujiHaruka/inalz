import fs from 'fs'
import path from 'path'
import { InalzMiddleware } from '../types/InalzConfig'

export const statOrNull = async (path: string) => {
  try {
    return await fs.promises.stat(path)
  } catch (error) {
    return null
  }
}

export const fileExists = async (path: string) => {
  const stat = await statOrNull(path)
  if (!stat) {
    return false
  }
  return stat.isFile()
}

export const firstExistsFile = async (files: string[]) => {
  for (const filePath of files) {
    const found = await fileExists(filePath)
    if (found) {
      return filePath
    }
  }
  return null
}

export const rmIfExists = async (filePath: string) => {
  if (await fileExists(filePath)) {
    await fs.promises.unlink(filePath)
  }
}

export const readFile = (path: string) => fs.promises.readFile(path, 'utf-8')

export const writeFile = async (
  filePath: string,
  content: string,
  options: { mkdirp?: boolean; mode?: string | number | undefined } = {},
) => {
  const { mkdirp, mode } = options
  if (mkdirp) {
    await fs.promises.mkdir(path.dirname(filePath), {
      recursive: true,
    })
  }
  await fs.promises.writeFile(filePath, content, { mode })
}

export const readSource = async (
  filepath: string,
  middlewares: InalzMiddleware[],
) => {
  let srcText = await readFile(filepath)
  srcText = middlewares.reduce((text, mw) => mw(text, { filepath }), srcText)
  return srcText
}
