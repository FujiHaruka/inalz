import { ChangeStatus, UniqKey, ItemGroup } from './Group'
import { switchStatus, indexFinder, closestFinder, findMax } from './groupUtil'

// const merge = <T extends UniqKey>(group: ItemGroup<T>): T[] => {
//   for (const item of group.items) {
//   }
// }

// 1. 各 prevItem について編集距離が最も小さい item を見つける
// 2. 各 item についてそれを指す prevItem のうち編集距離最小のものを選ぶ
// 3. [prevItemIndex, nextItemIndex] を出力する]

const mergeGroups = <T extends UniqKey>(
  groups: ItemGroup<T>[],
  merge: (a: T, b: T) => T,
) => {
  return groups.flatMap(
    (group) => {
      // let
      if (group.prevItems.length > 0) {
        const findClosest = closestFinder(
          group.prevItems.map((item) => item.key),
        )
        const evaluations = group.items.map((item) => findClosest(item.key))

        const correspondingIndexes = group.prevItems.map((prevItem) =>
          findMax(),
        )
        for (const prevItem of group.prevItems) {
          const { index } = findMax(evaluations.map((e) => e.distance))
        }
      }
    },
    // switchStatus(
    //   group.status,
    //   function onDec() {
    //     const findIndex = indexFinder(group.items)
    //     // 新しい item がないが、unused な item はありえる
    //     return group.prevItems.map((item) => {
    //       const isUnused = findIndex(item.key) < 0
    //       if (isUnused) {
    //         // TODO:
    //       }
    //       return item
    //     })
    //   },
    //   function onInc() {
    //     return merge(group)
    //   },
    // ),
  )
}
