import { ValidateCommand } from '../command/ValidateCommand'
import {
  InalzConfigDefaultOptions,
  InalzConfigDefaultMiddlewareModules,
} from '../config/InalzConfig'

describe('ValidateCommand', () => {
  it('01', async () => {
    const command = new ValidateCommand({
      baseDir: '',
      lang: {
        source: 'en',
        targets: ['ja'],
      },
      document: {
        sourcePath: '',
        localePath: 'misc/testdata/locales/validate01.yml',
        targetPaths: {
          ja: '',
        },
      },
      options: InalzConfigDefaultOptions,
      middlewareModules: InalzConfigDefaultMiddlewareModules,
    })
    const result = await command.validate()
    expect(result).toEqual({
      localePath: 'misc/testdata/locales/validate01.yml',
      unused: 3,
      outdated: 2,
    })
  })

  it('02: invalid yaml err', async () => {
    const command = new ValidateCommand({
      baseDir: '',
      lang: {
        source: 'en',
        targets: ['ja'],
      },
      document: {
        sourcePath: '',
        localePath: 'misc/testdata/locales/validate02.yml',
        targetPaths: {
          ja: '',
        },
      },
      options: InalzConfigDefaultOptions,
      middlewareModules: InalzConfigDefaultMiddlewareModules,
    })
    const result = await command.validate()
    expect(result.err).toBeTruthy()
  })
})
