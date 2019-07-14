import { EOL } from 'os'

type Line = {
  index: number
  content: string
}

export const removeIgnoredLine = (
  text: string,
  regs: RegExp[],
): [string, Line[]] => {
  if (regs.length === 0) {
    return [text, []]
  }
  const lines: Line[] = []
  let count = 1
  const removed = text
    .split(EOL)
    .filter((content, index) => {
      const match = regs.some((reg) => reg.test(content))
      if (match) {
        lines.push({
          // index が -1 になることがあるが、これは restore で意味を持つ
          index: index - count,
          content,
        })
        count++
        return false
      } else {
        return true
      }
    })
    .join(EOL)
  return [removed, lines]
}

export const restoreIgnoredLine = (text: string, lines: Line[]) => {
  return text
    .split(EOL)
    .flatMap((content, index) => {
      const heading =
        index === 0
          ? lines.filter((l) => l.index === -1).map(({ content }) => content)
          : []
      const appending = lines
        .filter((l) => l.index === index)
        .map(({ content }) => content)
      return [...heading, content, ...appending]
    })
    .join(EOL)
}
