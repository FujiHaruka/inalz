import { InalzConfig } from '../InalzConfig'

describe('InalzConfig', () => {
  it('01: valid "path" mode', async () => {
    const path = 'misc/mock/config/inalz.01.yml'
    const config = await InalzConfig.load(path)
    expect(config.lang.source).toBe('en')
    expect(config.documents).toContainEqual({
      sourcePath: 'misc/mock/config/pathMode/doc.md',
      targetPaths: {
        ja: 'misc/mock/config/pathMode/doc_ja.md',
      },
      localePath: 'misc/mock/config/pathMode/locale.yml',
    })
  })

  it('02: valid "filename" mode', async () => {
    const path = 'misc/mock/config/inalz.02.yml'
    const config = await InalzConfig.load(path)
    expect(config.documents).toContainEqual({
      sourcePath: 'misc/mock/config/filenameMode/doc.doc.en.md',
      targetPaths: { ja: 'misc/mock/config/filenameMode/doc.doc.ja.md' },
      localePath: 'misc/mock/config/locales/doc.doc.yml',
    })
  })

  it('03: valid "directory" mode', async () => {
    const path = 'misc/mock/config/inalz.03.yml'
    const config = await InalzConfig.load(path)
    expect(config.documents).toContainEqual({
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

  it('05: path mode allows directory', async () => {
    const path = 'misc/mock/config/inalz.05.yml'
    const config = await InalzConfig.load(path)
    expect(config.documents).toContainEqual({
      sourcePath: 'misc/mock/config/pathMode/dir/doc.md',
      targetPaths: {
        ja: 'misc/mock/config/pathMode/ja/doc.md',
      },
      localePath: 'misc/mock/config/pathMode/locales/doc.yml',
    })
  })

  it('06: "path" mode is default', async () => {
    const path = 'misc/mock/config/inalz.06.yml'
    const config = await InalzConfig.load(path)
    expect(config.lang.source).toBe('en')
    expect(config.documents).toContainEqual({
      sourcePath: 'misc/mock/config/pathMode/doc.md',
      targetPaths: {
        ja: 'misc/mock/config/pathMode/doc_ja.md',
      },
      localePath: 'misc/mock/config/pathMode/locale.yml',
    })
  })
})
