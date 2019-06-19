import path from 'path'
import { CLIActions } from '../CLI'
import { readFile } from '../util/fsUtil'

describe('inalz integration', () => {
  it('example/helloworld', async () => {
    const cwd = path.resolve('example/helloworld')

    const localePath = path.join(cwd, '.README.locale.yml')
    const locale = await readFile(localePath)
    await CLIActions.sync({ cwd })
    await CLIActions.build({ cwd })

    expect(await readFile(localePath)).toEqual(locale)
    expect(await readFile(path.join(cwd, 'README.ja.md'))).toEqual(
      await readFile('misc/exampleOutput/helloworld/README.ja.md'),
    )
  })

  // it('example/advanced', async () => {
  //   const cwd = path.resolve('example/advanced')

  //   await CLIActions.sync({ cwd })
  // })
})
