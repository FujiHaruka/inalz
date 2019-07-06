export const countBy = <T>(array: T[], match: (item: T) => boolean) =>
  array.reduce((count, item) => count + (match(item) ? 1 : 0), 0)
