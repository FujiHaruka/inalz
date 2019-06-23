import * as t from 'io-ts'

/** IO implementation of LocaleComponent.Item */
export const IOLocaleItem = t.intersection([
  t.type({
    texts: t.record(t.string, t.string),
  }),
  t.partial({
    meta: t.partial({
      outdated: t.boolean,
      unused: t.boolean,
      warnings: t.array(t.string),
    }),
  }),
])
