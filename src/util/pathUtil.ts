import path from 'path'
import { ResolvedDocument } from '../types/InalzConfig'

export const replaceExt = (
  file: string,
  ext: string,
  options: { depth?: number } = {},
) => {
  const parsed = path.parse(file)
  let { depth = 1 } = options
  if (depth < 1) {
    throw new Error(`Invalid depth option`)
  }
  let { name } = parsed
  while (depth-- > 1) {
    name = path.basename(name, path.extname(name))
  }
  return path.format({
    ...parsed,
    base: '',
    name,
    ext,
  })
}

export const resolveDocumentPath = (
  baseDir: string,
  {
    sourcePath: _sourcePath,
    targetPaths: _targetPaths,
    localePath: _localePath,
  }: ResolvedDocument,
) => {
  const sourcePath = path.resolve(baseDir, _sourcePath)
  const localePath = path.resolve(baseDir, _localePath)
  const targetPaths = Object.fromEntries(
    Object.entries(_targetPaths).map(([lang, targetPath]) => [
      lang,
      path.resolve(baseDir, targetPath),
    ]),
  )
  return {
    sourcePath,
    localePath,
    targetPaths,
  }
}
