import * as t from 'io-ts'

export const IOInalzConfig = t.intersection([
  t.strict({
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
        t.strict({
          linkMode: t.literal('path'),
          sourcePath: t.string,
          targetPaths: t.record(t.string, t.string),
          localePath: t.string,
        }),
      ]),
    ),
  }),
  t.partial({
    vocabularies: t.array(t.string),
  }),
])

export const IOLocaleItem = t.intersection([
  t.strict({
    texts: t.record(t.string, t.string),
  }),
  t.partial({
    meta: t.partial({
      outdated: t.boolean,
      warnings: t.array(t.string),
    }),
  }),
])
