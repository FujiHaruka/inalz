import path from 'path'

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
