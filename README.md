# Inalz

Inals is Markdown document i18n for mentenable translation.

## Config file

`inalz.yml` is a inals configuration file.

```yml
langs:
  source: en
  targets:
    - ja
documents:
  - link_by: filename
    base: docs/contents
    locale: docs/locales
  - link_by: directory
    base: docs/contents
    locale: docs/locales
vocabularies:
  - vocabulary.yml
```

## Locale file

A Locale file describes translation text mapping for a Markdown file. It consists of more than one document.

```yml
---
# "texts" field is required.
texts:
  en: Hello world
  ja: ハローワールド
---
# "meta" field is optional. It is usually generated automatically.
meta:
  outdated: true
texts:
  en: Hello cosmos
  ja: ハローコスモス
```
