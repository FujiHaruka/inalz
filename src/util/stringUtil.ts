export type ReplaceResult = {
  result: string
  replaceCount: number
}

export const replaceAll = (
  text: string,
  searchValue: string,
  replaceValue: string,
): ReplaceResult => {
  // replace by split and join
  const splitted = text.split(searchValue)
  return {
    result: splitted.join(replaceValue),
    replaceCount: splitted.length - 1,
  }
}
