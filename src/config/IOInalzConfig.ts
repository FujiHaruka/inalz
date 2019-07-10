import * as t from 'io-ts'

/** IO implementation of InalzConfigInterface */
export const IOInalzConfig = t.intersection([
  t.type({
    lang: t.strict({
      source: t.string,
      targets: t.array(t.string),
    }),
    documents: t.array(
      t.type({
        source: t.string,
        targets: t.record(t.string, t.string),
        locale: t.string,
      }),
    ),
  }),
  t.partial({
    options: t.partial({
      lineIgnorePatterns: t.array(t.string),
      paragraphIgnorePatterns: t.array(t.string),
    }),
  }),
])
