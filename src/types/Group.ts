/**
 * Group化のための型
 */

/**
 * Object which has the unique key for equivalence
 */
export interface UniqKey {
  /** unique key */
  key: string
}

export enum ChangeStatus {
  /** items are unchanged or some items are removed */
  DEC = 'dec',
  /** items are editted or added */
  INC = 'inc',
}

export type ItemGroup = {
  status: ChangeStatus
  items: UniqKey[]
  prevItems: UniqKey[]
}
