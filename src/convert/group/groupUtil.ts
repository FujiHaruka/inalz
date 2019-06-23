import { ChangeStatus, UniqKey } from './Group'

export const switchStatus = <T>(
  status: ChangeStatus,
  onDec: () => T,
  onInc: () => T,
): T => {
  switch (status) {
    case ChangeStatus.DEC:
      return onDec()
    case ChangeStatus.INC:
      return onInc()
    default:
      throw new Error("won't reach here")
  }
}

export const indexFinder = (items: UniqKey[]) => {
  const entries = items.map(({ key }, index) => [key, index] as const)
  const keyIndexes = Object.fromEntries(entries) as { [key: string]: number }
  return function findIndex(key: string) {
    return Number.isFinite(keyIndexes[key]) ? keyIndexes[key] : -1
  }
}

export const groupIndexesByStatus = (statuses: ChangeStatus[]): number[] => {
  let groupIndex = -1
  let groupStatus = (null as any) as ChangeStatus
  const indexes = statuses.map((status) => {
    const changed = groupStatus !== status
    if (changed) {
      groupStatus = status
      groupIndex += 1
    }
    return groupIndex
  })
  return indexes
}
