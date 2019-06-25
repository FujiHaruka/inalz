import YAML from 'yaml'
import { InalzConfig } from '../config/InalzConfig'
import { resolveDocumentPath } from '../util/pathUtil'
import { readFile } from '../util/fsUtil'

describe('InalzConfig', () => {
  it('01: valid "path" mode', async () => {
    const path = 'misc/mock/config/inalz.01.yml'
    const config = await InalzConfig.load(path)
    expect(config.lang.source).toBe('en')
    expect(config.documents).toContainEqual(
      resolveDocumentPath('misc/mock/config', {
        sourcePath: 'pathMode/doc.md',
        targetPaths: {
          ja: 'pathMode/doc_ja.md',
        },
        localePath: 'pathMode/locale.yml',
      }),
    )
  })

  it('02: valid "filename" mode', async () => {
    const path = 'misc/mock/config/inalz.02.yml'
    const config = await InalzConfig.load(path)
    expect(config.documents).toContainEqual(
      resolveDocumentPath('misc/mock/config', {
        sourcePath: 'filenameMode/doc.doc.en.md',
        targetPaths: { ja: 'filenameMode/doc.doc.ja.md' },
        localePath: 'locales/doc.doc.yml',
      }),
    )
  })

  it('03: valid "directory" mode', async () => {
    const path = 'misc/mock/config/inalz.03.yml'
    const config = await InalzConfig.load(path)
    expect(config.documents).toContainEqual(
      resolveDocumentPath('misc/mock/config', {
        sourcePath: 'directoryMode/en/doc.md',
        targetPaths: { ja: 'directoryMode/ja/doc.md' },
        localePath: 'locales/doc.yml',
      }),
    )
  })

  it('04: valid multiple documents', async () => {
    const path = 'misc/mock/config/inalz.04.yml'
    const config = await InalzConfig.load(path)
    expect(config.documents.length).toBe(3)
  })

  it('05: path mode allows directory', async () => {
    const path = 'misc/mock/config/inalz.05.yml'
    const config = await InalzConfig.load(path)
    expect(config.documents).toContainEqual(
      resolveDocumentPath('misc/mock/config', {
        sourcePath: 'pathMode/dir/doc.md',
        targetPaths: {
          ja: 'pathMode/ja/doc.md',
        },
        localePath: 'pathMode/locales/doc.yml',
      }),
    )
  })

  it('06: "path" mode is default', async () => {
    const path = 'misc/mock/config/inalz.06.yml'
    const config = await InalzConfig.load(path)
    expect(config.lang.source).toBe('en')
    expect(config.documents).toContainEqual(
      resolveDocumentPath('misc/mock/config', {
        sourcePath: 'pathMode/doc.md',
        targetPaths: {
          ja: 'pathMode/doc_ja.md',
        },
        localePath: 'pathMode/locale.yml',
      }),
    )
  })

  it('07: invalid config. launguage inconsistency', async () => {
    const path = 'misc/mock/config/inalz.07.yml'
    const yaml = await readFile(path)
    const config = YAML.parse(yaml)
    expect(() => InalzConfig.validate(config)).toThrow()
  })
})
