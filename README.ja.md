[![Build Status](https://travis-ci.org/FujiHaruka/inalz.svg?branch=master)](https://travis-ci.org/FujiHaruka/inalz)
[![npm version](https://badge.fury.io/js/inalz.svg)](https://badge.fury.io/js/inalz)

# Inalz

Inalz は、 Markdown ドキュメントの翻訳をメンテナンス可能にするための i18n ツールです。

## チュートリアル

Inalz を `npm` でインストールしてください。

```bash
$ npm install inalz -g
```

Inalz を始めるために必要なのは、Markdown ドキュメントと、その翻訳先を指示するための設定ファイル `inalz.yml` です。

たとえば、英語の `README.md` を日本語の `README.ja.md` に対応させるためには、以下のような設定を `inalz.yml` に書いて、プロジェクトルートに置きます。

```yml
lang:
  source: en
  targets:
    - ja
documents:
  - linkMode: path
    source: README.md
    targets:
      ja: README.ja.md
    locale: .README.yml
```

例として、次のような `README.md` を書いておきます。

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

`inalz sync` コマンドは、`inalz.yml` の設定をもとに Locale ファイルを生成します。ここで生成される Locale ファイルは 1 つだけで、`locale` で設定した `.README.yml` です。

```
.
├── .README.yml
├── inalz.yml
└── README.md
```

Locale ファイル `.README.yml` は次のようになっているはずです。

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

ファイルの内容は次のようになっているはずです。

```md
# ハローワールド

これはハローワールドのドキュメントです。
```

`README.md` の日本語訳が完成しました！　`README.ja.md` は、元の Markdown ファイルのドキュメント構造を維持しています。`inalz build` コマンドの仕事は単純で、ただ元の Markdown ファイルの文字列を置換するだけです。

