import { MarkdownText } from '../MarkdownText'
import { readFile } from '../util/fsUtil'

describe('MarkdownText', () => {
  it('01: separetes paragraphs by a blank line, but not by a single break', async () => {
    const markdown = await readFile('misc/mock/md/01.md')
    const texts = new MarkdownText({}).parseTexts(markdown)
    expect(texts.length).toBe(2)
  })

  it('02: separetes paragraphs by a blank line, but not by a single break in quotes', async () => {
    const markdown = await readFile('misc/mock/md/02.md')
    const texts = new MarkdownText({}).parseTexts(markdown)
    expect(texts.length).toBe(2)
  })

  it('03: inline code', async () => {
    const markdown = await readFile('misc/mock/md/03.md')
    const texts = new MarkdownText({}).parseTexts(markdown)
    expect(texts.length).toBe(1)
  })

  it('04: nested inline markup', async () => {
    const markdown = await readFile('misc/mock/md/04.md')
    const texts = new MarkdownText({}).parseTexts(markdown)
    expect(texts.length).toBe(1)
  })

  it('05: html string will not be parsed', async () => {
    const markdown = await readFile('misc/mock/md/05.md')
    const texts = new MarkdownText({}).parseTexts(markdown)
    expect(texts.length).toBe(5)
    expect(texts[0]).toContain('<div>')
    expect(texts[0]).toContain('</div>')
  })

  it('06: skip code block', async () => {
    const markdown = await readFile('misc/mock/md/06.md')
    const texts = new MarkdownText({}).parseTexts(markdown)
    expect(texts.length).toBe(1)
  })

  it('07: table', async () => {
    const markdown = await readFile('misc/mock/md/07.md')
    const texts = new MarkdownText({}).parseTexts(markdown)
    expect(texts.length).toBe(9)
  })

  it('08: comment out', async () => {
    const markdown = await readFile('misc/mock/md/08.md')
    const texts = new MarkdownText({}).parseTexts(markdown)
    expect(texts.length).toBe(1)
  })

  it('09: ignore patterns', async () => {
    const markdown = await readFile('misc/mock/md/09.md')
    const texts = new MarkdownText({
      paragraphIgnorePatterns: ['^ignore', '^#\\s'],
    }).parseTexts(markdown)
    expect(texts.length).toBe(2)
  })
})
