import { InalzConfig } from '../InalzConfig'

describe('InalzConfig', () => {
  it('01: valid "path" mode', async () => {
    const path = 'misc/mock/config/inalz.01.yml'
    const config = await InalzConfig.load(path)
    expect(config.lang.source).toBe('en')
    expect(config.documents).toContainEqual({
      linkMode: 'path',
      sourcePath: 'misc/mock/pathMode/doc.md',
      targetPaths: {
        ja: 'misc/mock/pathMode/doc_ja.md',
      },
      localePath: 'misc/mock/pathMode/locale.yml',
    })
  })

  it('02: valid "filename" mode', async () => {
    const path = 'misc/mock/config/inalz.02.yml'
    const config = await InalzConfig.load(path)
    expect(config.documents).toContainEqual({
      linkMode: 'path',
      sourcePath: 'misc/mock/config/filenameMode/doc.doc.en.md',
      targetPaths: { ja: 'misc/mock/config/filenameMode/doc.doc.ja.md' },
      localePath: 'misc/mock/config/locales/doc.doc.yml',
    })
  })

  it('03: valid "directory" mode', async () => {
    const path = 'misc/mock/config/inalz.03.yml'
    const config = await InalzConfig.load(path)
    expect(config.documents).toContainEqual({
      linkMode: 'path',
      sourcePath: 'misc/mock/config/directoryMode/en/doc.md',
      targetPaths: { ja: 'misc/mock/config/directoryMode/ja/doc.md' },
      localePath: 'misc/mock/config/locales/doc.yml',
    })
  })

  it('04: valid multiple documents', async () => {
    const path = 'misc/mock/config/inalz.04.yml'
    const config = await InalzConfig.load(path)
    expect(config.documents.length).toBe(3)
  })
})
