<!-- THIS FILE IS GENERATED WITH INALZ. DO NOT EDIT MANUALLY. -->

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

As an example,

```md
# Hello world

This is a hello-world document.
```


カレントディレクトリには次の 2 つのファイルがあります。

```
.
├── inalz.yml
└── README.md
```

ここで、 Inalz コマンドを実行しましょう。

```bash
$ inalz sync
```

`inalz sync` コマンドは、`inalz.yml` の設定をもとに Locale ファイルを生成します。ここで生成される Locale ファイルは 1 つだけで、`localePath` で設定した``.README.yml` です。

```
.
├── .README.yml
├── inalz.yml
└── README.md
```

生成された Locale ファイル ``.README.yml`` の中は次のようになっています。

```yml
texts:
  en: Hello world
  ja: __COPY__
---
texts:
  en: This is a hello-world document.
  ja: __COPY__
```

Locale ファイルは、パラグラフ単位での本文と訳文の対応を表しています。デフォルトの `__COPY__` は、元の文章を置き換えずにそのまま使うことを意味しています。

`.README.yml` を次のように編集してみましょう。

```yml
texts:
  en: Hello world
  ja: ハローワールド
---
texts:
  en: This is a hello-world document.
  ja: これはハローワールドのドキュメントです。
```

次に、翻訳ドキュメントファイルを出力します。そのためには別の Inalz コマンドを実行しましょう。

```
$ inalz build
```

`inalz build` コマンドは、Locale ファイルと元ドキュメントを参照して、翻訳ドキュメントを出力します。ここでは `README.ja.md` が出力されます。

```
.
├── .README.yml
├── inalz.yml
├── README.ja.md
└── README.md
```

ファイルの内容は次のようになっています。

```md
# ハローワールド

これはハローワールドのドキュメントです。
```

`README.md` の日本語訳が完成しました！　`README.ja.md` は、元の Markdown ファイルのドキュメント構造を維持しています。`inalz build` コマンドの仕事は単純で、ただ元の Markdown ファイルの文字列を置換するだけです。

