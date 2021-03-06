import {
  replaceIgnoringPatterns,
  restoreIgnoredLines,
} from '../util/ignoreLineUtil'
import { EOL } from 'os'

describe('ignoreLineHelper', () => {
  it('remove / restore 01', () => {
    const IGNORE = 'IGNORE'
    const regs = [new RegExp(IGNORE)]
    const original = [
      '1',
      '2',
      IGNORE,
      '3',
      '4',
      IGNORE,
      IGNORE,
      '5',
      IGNORE,
      IGNORE,
    ].join(EOL)
    const [removed, lines] = replaceIgnoringPatterns(original, regs)
    const restored = restoreIgnoredLines(removed, lines)
    expect(restored).toBe(original)
  })

  it('remove / restore 02', () => {
    const IGNORE = 'IGNORE'
    const regs = [new RegExp(IGNORE)]
    const original = [
      IGNORE,
      IGNORE,
      IGNORE,
      '1',
      '2',
      IGNORE,
      IGNORE,
      IGNORE,
    ].join(EOL)
    const [removed, lines] = replaceIgnoringPatterns(original, regs)
    const restored = restoreIgnoredLines(removed, lines)
    expect(restored).toBe(original)
  })
})
