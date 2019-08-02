import * as t from 'io-ts'

/** IO implementation of InalzConfigInterface */
export const IOInalzConfig = t.exact(
  t.intersection([
    t.type({
      lang: t.strict({
        source: t.string,
        targets: t.array(t.string),
      }),
      documents: t.array(
        t.strict({
          source: t.string,
          targets: t.record(t.string, t.string),
          locale: t.string,
        }),
      ),
    }),
    t.partial({
      options: t.exact(
        t.partial({
          lineIgnorePatterns: t.array(t.string),
          documentExtension: t.string,
          markdownOptions: t.record(t.string, t.unknown),
        }),
      ),
      middlewares: t.exact(
        t.partial({
          processSource: t.array(t.string),
          processTarget: t.array(t.string),
        }),
      ),
    }),
  ]),
)
