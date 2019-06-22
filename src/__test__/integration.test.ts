import path from 'path'
import { CLIActions } from '../CLI'
import { readFile } from '../util/fsUtil'

describe('inalz integration', () => {
  it('01', async () => {
    const cwd = path.resolve('misc/mock/integration/01')

    await CLIActions.sync({ cwd })
    await CLIActions.build({ cwd })

    expect(await readFile(path.join(cwd, 'README_ja.md'))).toEqual(
      await readFile(path.join(cwd, 'expected_README_ja.md')),
    )
  })

  it('example/advanced', async () => {
    const cwd = path.resolve('example/advanced')

    await CLIActions.sync({ cwd })
    await CLIActions.build({ cwd })
  })
})
