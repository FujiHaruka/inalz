import { ValidateCommand } from '../command/ValidateCommand'
import { InalzConfigDefaultOptions } from '../config/InalzConfig'

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
        localePath: 'misc/mock/locales/validate01.yml',
        targetPaths: {
          ja: '',
        },
      },
      options: InalzConfigDefaultOptions,
    })
    const result = await command.validate()
    expect(result).toEqual({
      localePath: 'misc/mock/locales/validate01.yml',
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
        localePath: 'misc/mock/locales/validate02.yml',
        targetPaths: {
          ja: '',
        },
      },
      options: InalzConfigDefaultOptions,
    })
    const result = await command.validate()
    expect(result.err).toBeTruthy()
  })
})
