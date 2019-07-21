import { EOL } from 'os'
import { BUILTIN_ACTIONS } from '../Constants'

/**
 * 無視すべきパターンの行を定数 BUILTIN_ACTIONS.IGNORE に置換する
 */
export const replaceIgnoringPatterns = (
  text: string,
  regs: RegExp[],
): [string, string[]] => {
  if (regs.length === 0) {
    return [text, []]
  }
  const lines: string[] = []
  const removed = text
    .split(EOL)
    .map((line) => {
      const match = regs.some((reg) => reg.test(line))
      if (match) {
        lines.push(line)
        return BUILTIN_ACTIONS.IGNORE
      } else {
        return line
      }
    })
    .join(EOL)
  return [removed, lines]
}

/**
 * BUILTIN_ACTIONS.IGNORE と等しい行を lines の行に置換する
 * lines.length は text 内の BUILTIN_ACTIONS.IGNORE と同数でなければならない
 */
export const restoreIgnoredLines = (text: string, lines: string[]) => {
  const _lines = [...lines]
  const result = text
    .split(EOL)
    .map((line) => {
      if (line === BUILTIN_ACTIONS.IGNORE) {
        const original = _lines.shift()
        if (original === undefined) {
          throw new Error(`restoreIgnoredLines failed: shorter lines length`)
        }
        return original
      } else {
        return line
      }
    })
    .join(EOL)
  if (_lines.length > 0) {
    throw new Error(`restoreIgnoredLines failed: longer lines length`)
  }
  return result
}
