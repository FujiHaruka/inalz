export const replaceAll = (
  text: string,
  searchValue: string,
  replaceValue: string,
) => text.split(searchValue).join(replaceValue)
