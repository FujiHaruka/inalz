<!-- THIS FILE IS GENERATED WITH INALZ. DO NOT EDIT MANUALLY. -->

[![Build Status](https://travis-ci.org/FujiHaruka/inalz.svg?branch=master)](https://travis-ci.org/FujiHaruka/inalz)

# Inalz

Inalz is a Markdown i18n tool for maintainable translation.

## Tutorial

Install Inalz with `npm`.

```bash
$ npm install inalz -g
```

To get started with Inalz, you need a Markdown document and a configuration file `inalz.yml`, which directs translation target destinations.

For example, you can create `inalz.yml` to map English `README.md` to Japanese `README.ja.md` as below.

```yml
lang:
  source: en
  targets:
    - ja
documents:
  - linkMode: path
    sourcePath: README.md
    targetPaths:
      ja: README.ja.md
    localePath: .README.yml
```

As an example, create `README.md` as follows.

```md
# Hello world

This is a hello-world document.
```


There are 2 files in the current directory.

```
.
├── inalz.yml
└── README.md
```

Then, execute Inalz command.

```bash
$ inalz sync
```

The `inalz sync` command generates Locale files according to `inalz.yml` configuration. Now it generates a single file, `.README.yml` set on `localePath`.

```
.
├── .README.yml
├── inalz.yml
└── README.md
```

The Locale file `.README.yml` should be as below.

```yml
texts:
  en: Hello world
  ja: __COPY__
---
texts:
  en: This is a hello-world document.
  ja: __COPY__
```

Locale file describes mappings of a source text and a target text by paragraph. Default target text `__COPY__` means to use the source text without replacing.

Let's edit `.README.yml` as follows.

```yml
texts:
  en: Hello world
  ja: ハローワールド
---
texts:
  en: This is a hello-world document.
  ja: これはハローワールドのドキュメントです。
```

Next, output a translation document file. Execute another Inalz command to do it.

```
$ inalz build
```

The `inalz build` command generates a translation document by refering to Locale files and source documents. In this case, it generates `README.ja.md`.

```
.
├── .README.yml
├── inalz.yml
├── README.ja.md
└── README.md
```

The file should be as bellow.

```md
# ハローワールド

これはハローワールドのドキュメントです。
```

You have done translation of `README.md`! `README.ja.md` maintains the document structure of the source Markdown file. The `inalz build` command does a simple task, to replace texts of the source Markdown file.

