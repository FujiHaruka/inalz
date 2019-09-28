import { readFile, writeFile } from '../util/fsUtil'
import { flow } from 'fp-ts/lib/function'
import { MdParser, MdTreeProcessor } from '../util/mdUtil'

describe('Markdown helpers', () => {
  it('MdParser parse / stringify', async () => {
    const markdown = await readFile('misc/testdata/md/sample01.md')
    expect(
      flow(
        MdParser.parse,
        MdParser.stringify,
      )(markdown),
    ).toEqual(markdown)
  })

  it('MdTreeProcessor.countBlock', async () => {
    const markdown = await readFile('misc/testdata/md/sample01.md')
    const count = flow(
      MdParser.parse,
      MdTreeProcessor.countBlock,
    )(markdown)
    expect(count).toBe(54)
  })

  it('MdTreeProcessor._replace', async () => {
    const markdown = await readFile('misc/testdata/md/sample02.md')
    const texts = ['1', '__COPY__', '3', '4', '5', '6']
    const replaced = flow(
      MdParser.parse,
      (tree) => MdTreeProcessor._replace(tree, texts),
      MdParser.stringify,
    )(markdown)
    expect(replaced).toBe(
      `# 1

Paragraphs are separated by a blank line.

3

- 4
- 5
- 6
`,
    )
  })
})
