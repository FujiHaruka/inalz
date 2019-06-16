import { groupByChangeStatus, UniqKey } from '../util/groupByChangeStatus'

describe('groupByChangeStatus', () => {
  const itemsFrom = (str: string): UniqKey[] =>
    str.split('').map((key) => ({
      key,
    }))
  const getKey = (item: UniqKey) => item.key

  it('works', () => {
    {
      const prevItems = itemsFrom('abcdefghij')
      const nextItems = itemsFrom('abxydfgzhst')

      const groups = groupByChangeStatus(prevItems, nextItems).map((group) => ({
        status: group.status,
        items: group.items.map(getKey),
        prevItems: group.prevItems.map(getKey),
      }))
      expect(groups).toEqual([
        { status: 'dec', items: ['a', 'b'], prevItems: ['a', 'b'] },
        { status: 'inc', items: ['x', 'y'], prevItems: ['c'] },
        {
          status: 'dec',
          items: ['d', 'f', 'g'],
          prevItems: ['d', 'e', 'f', 'g'],
        },
        { status: 'inc', items: ['z'], prevItems: [] },
        { status: 'dec', items: ['h'], prevItems: ['h'] },
        { status: 'inc', items: ['s', 't'], prevItems: ['i', 'j'] },
      ])
    }
    {
      const prevItems = itemsFrom('abcdefghij')
      const nextItems = itemsFrom('xyabclmnij')

      const groups = groupByChangeStatus(prevItems, nextItems).map((group) => ({
        status: group.status,
        items: group.items.map(getKey),
        prevItems: group.prevItems.map(getKey),
      }))
      expect(groups).toEqual([
        { status: 'inc', items: ['x', 'y'], prevItems: [] },
        { status: 'dec', items: ['a', 'b', 'c'], prevItems: ['a', 'b', 'c'] },
        {
          status: 'inc',
          items: ['l', 'm', 'n'],
          prevItems: ['d', 'e', 'f', 'g', 'h'],
        },
        { status: 'dec', items: ['i', 'j'], prevItems: ['i', 'j'] },
      ])
    }
    {
      const prevItems = itemsFrom('abcdefghij')
      const nextItems = itemsFrom('bxyzdeist')

      const groups = groupByChangeStatus(prevItems, nextItems).map((group) => ({
        status: group.status,
        items: group.items.map(getKey),
        prevItems: group.prevItems.map(getKey),
      }))
      expect(groups).toEqual([
        { status: 'dec', items: ['b'], prevItems: ['a', 'b'] },
        { status: 'inc', items: ['x', 'y', 'z'], prevItems: ['c'] },
        {
          status: 'dec',
          items: ['d', 'e', 'i'],
          prevItems: ['d', 'e', 'f', 'g', 'h', 'i'],
        },
        { status: 'inc', items: ['s', 't'], prevItems: ['j'] },
      ])
    }
  })
})
