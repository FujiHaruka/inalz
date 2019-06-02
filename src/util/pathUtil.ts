import path from 'path'

export const replaceExt = (file: string, ext: string) => {
  const parsed = path.parse(file)
  return path.format({
    ...parsed,
    base: '',
    ext,
  })
}
