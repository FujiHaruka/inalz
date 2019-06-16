import * as t from 'io-ts'

/** IO implementation of InalzConfigInterface */
export const IOInalzConfig = t.intersection([
  t.type({
    lang: t.strict({
      source: t.string,
      targets: t.array(t.string),
    }),
    documents: t.array(
      t.union([
        t.strict({
          linkMode: t.literal('filename'),
          contentDir: t.string,
          localeDir: t.string,
        }),
        t.strict({
          linkMode: t.literal('directory'),
          contentDir: t.string,
          localeDir: t.string,
        }),
        t.intersection([
          t.partial({
            linkMode: t.literal('path'),
          }),
          t.type({
            source: t.string,
            targets: t.record(t.string, t.string),
            locale: t.string,
          }),
        ]),
      ]),
    ),
  }),
  t.partial({
    options: t.partial({
      paragraphIgnorePatterns: t.array(t.string),
    }),
  }),
])
