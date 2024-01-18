import { argv, exit } from 'node:process'

run()

function run(): void {
  const maxSetSize = getMaxSetSize()
  const result = getTopologiesNumbers(maxSetSize)
  console.log(result)
}

function getMaxSetSize(): number {
  const regExp = /^--max-set-size=(.+)$/
  const maxSetSizeArg = argv.slice(2).find((arg) => arg.match(regExp))
  if (!maxSetSizeArg) {
    console.error('[Error] Argument "max-set-size" is required.')
    exit()
  }
  const maxSetSize = +(maxSetSizeArg.match(regExp) ?? [])[1]
  if (!Number.isInteger(maxSetSize) || maxSetSize < 0) {
    console.error('[Error] Argument "max-set-size" must be a non-negative integer.')
    exit()
  }
  return maxSetSize
}

function getTopologiesNumbers(maxSetSize: number): number[] {
  let setSize = 0
  const topologiesNumbers = []
  while (setSize <= maxSetSize) {
    topologiesNumbers.push(getTopologiesNumber(setSize++))
  }
  return topologiesNumbers
}

function getTopologiesNumber(setSize: number): number {
  const baseSet = createSet(setSize)
  const powerSet = getPowerSet(baseSet)
  let topologiesNumber = 1
  // Reduce the number of iterations skipping the combinations
  // without an empty set and a base set.
  const reducedPowerSet = powerSet.slice(1, -1)
  for (const subsets of combinations(reducedPowerSet)) {
    if (subsets.length && isTopology([[], ...subsets, baseSet])) {
      topologiesNumber++
    }
  }
  return topologiesNumber
}

function createSet(size: number): number[] {
  return [...Array(size).keys()]
}

function getPowerSet<T>(set: T[]): Array<T[]> {
  const powerSet: Array<T[]> = set.length ? [[]] : []
  for (const item of combinations(set)) {
    powerSet.push(item)
  }
  return powerSet
}

function isTopology<T>(subsets: Array<T[]>): boolean {
  for (const [subsetA, subsetB] of pairs(subsets)) {
    const union = getSetUnion(subsetA, subsetB)
    if (!listContainsSet(subsets, union)) {
      return false
    }
    const intersection = getSetIntersection(subsetA, subsetB)
    if (!listContainsSet(subsets, intersection)) {
      return false
    }
  }
  return true
}

function getSetUnion<T>(setA: T[], setB: T[]): T[] {
  return [...new Set([...setA, ...setB])]
}

function getSetIntersection<T>(setA: T[], setB: T[]): T[] {
  return setA.filter((item) => setB.includes(item))
}

function listContainsSet<T>(list: Array<T[]>, set: T[]): boolean {
  return list.some((item) => isSetEqual(item, set))
}

function isSetEqual<T>(setA: T[], setB: T[]): boolean {
  return setA.length === setB.length && setA.every((item) => setB.includes(item))
}

function* combinations<T>(items: T[]): Generator<T[]> {
  if (items.length <= 1) {
    yield items
    return
  }
  yield [items[0]]
  for (const combination of combinations(items.slice(1))) {
    yield combination
    yield [items[0], ...combination]
  }
}

function* pairs<T>(items: T[]): Generator<[T, T]> {
  for (let i = 0; i < items.length; ++i) {
    for (let j = i + 1; j < items.length; ++j) {
      yield [items[i], items[j]]
    }
  }
}
