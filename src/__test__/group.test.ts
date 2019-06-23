import { closestFinder, closestIndexes } from '../convert/group/closestIndexes'
import { ChangeStatus, UniqKey } from '../convert/group/Group'
import { groupByChangeStatus } from '../convert/group/groupByChangeStatus'
import { mergeLocaleGroup } from '../convert/group/mergeLocaleGroup'

describe('groupByChangeStatus', () => {
  const itemsFrom = (str: string): UniqKey[] =>
    str
      .split('')
      .filter(Boolean)
      .map((key) => ({
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
    {
      const prevItems = itemsFrom('abc')
      const nextItems = itemsFrom('')

      const groups = groupByChangeStatus(prevItems, nextItems).map((group) => ({
        status: group.status,
        items: group.items.map(getKey),
        prevItems: group.prevItems.map(getKey),
      }))
      expect(groups).toEqual([
        { status: 'dec', items: [], prevItems: ['a', 'b', 'c'] },
      ])
    }
  })

  it('edit distance', () => {
    {
      const find = closestFinder(['abc', 'def', 'ghi'])
      const result = find('ghg')
      expect(result).toEqual({
        index: 2,
        distance: 1,
      })
    }
    expect(() => closestFinder([])).toThrow()
  })

  it('closestIndexes', () => {
    expect(closestIndexes([], ['aaa', 'aaa'])).toEqual([-1, -1])

    expect(closestIndexes(['aaa', 'aaa'], [])).toEqual([])

    expect(
      closestIndexes(
        ['aaaa', 'bbb', 'ccc'],
        ['aaxa', 'ggg', 'bbx', 'kkk', 'ccx'],
      ),
    ).toEqual([0, -1, 1, -1, 2])

    expect(closestIndexes(['aaaa', 'aaab', 'baaa'], ['ab', 'aaxa'])).toEqual([
      1,
      0,
    ])

    expect(
      closestIndexes(
        ['aaaa', 'bbb', 'cccc', 'dddd'],
        ['aaxa', 'ccxd', 'dddx', 'whole new added'],
      ),
    ).toEqual([0, 2, 3, -1])

    expect(closestIndexes(['aaaa', 'bbb', 'cccc', 'dddd'], ['ccdx'])).toEqual([
      2,
    ])

    expect(
      closestIndexes(
        ['aaaa', 'bbb', 'cccc', 'dddd'],
        ['aaxa', 'xxxx', 'xxxx', 'whole new added', 'bbeb', 'ddcd', 'ccdc'],
      ),
    ).toEqual([0, -1, -1, -1, 1, 3, 2])

    expect(
      closestIndexes(['aaaa', 'bbbb', 'cccc'], ['aaaa', 'bbbb', 'cccc']),
    ).toEqual([0, 1, 2])

    expect(closestIndexes(['aaaa', 'bbbb', 'cccc'], ['aaaa', 'cccc'])).toEqual([
      0,
      2,
    ])
  })

  it('mergeLocaleGroup', () => {
    expect(
      mergeLocaleGroup({
        status: ChangeStatus.DEC,
        items: [],
        prevItems: [],
      }),
    ).toEqual([])
  })
})
