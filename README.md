# Inalz

Inals is Markdown document i18n for mentenable translation.

## Config file

`inalz.yml` is a inals configuration file.

```yml
lang:
  source: en
  targets:
    - ja
documents:
  - linkMode: filename
    contentDir: docs/contents
    localeDir: docs/locales
  - linkMode: directory
    contentDir: docs/contents/:lang
    localeDir: docs/locales/:lang
  - linkMode: path
    sourcePath: README.md
    targetPaths:
      ja: README.ja.md
    localePath: README.locale.yml
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
