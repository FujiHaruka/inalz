---
title: 'Tutorial'
draft: false
weight: 30
---

### 最初の翻訳

チュートリアルで学ぶのは、2 つのコマンドです。

-   `inalz sync`
-   `inalz build`

![command graph](/images/command.jpg)

GitHub の [example/helloworld](https://github.com/FujiHaruka/inalz/tree/master/example/helloworld) に例がありますが、最小限必要なのは次のファイルです。

    example/helloworld/
    ├── README.md
    └── inalz.yml

-   `README.md` ... 元ドキュメント。この例では簡単のため 1 つのファイルだけです
-   `inalz.yml` ... Inalz の設定ファイル

`README.md` の内容は以下です。

<div class="highlight"><pre class="chroma">
# Hello world

This is a hello-world document.

```bash
$ inalz sync
$ inalz build
```
</pre></div>

`inalz.yml` の内容は以下です。

```yml
lang:
  source: en
  targets:
    - ja
documents:
  - source: README.md
    targets:
      ja: README_ja.md
    locale: README.locale.yml
```

設定ファイルの読み方を説明します。

-   `lang`: 言語の設定。ここでは、元ドキュメントが英語 (`en`)、翻訳ドキュメントが日本語 (`ja`) です
-   `documents`: ドキュメントファイルのマッピング。ここでは、元ドキュメント `README.md` には Locale ファイル `README.locale.yml` が対応し、翻訳ドキュメント `README_ja.md` が出力されます

`inalz.yml` はプロジェクトルートに置きます。設定ファイルは JSON もサポートしているので、`inalz.json` としても構いません。

`example/helloworld/` ディレクトリに移動して、Inalz コマンドを実行しましょう。

    $ cd example/helloworld
    $ inalz sync

すると、`README.locale.yml` ファイルが出力されます。

    example/helloworld/
    ├── README.locale.yml
    ├── README.md
    └── inalz.yml

`inalz sync` コマンドは、`inalz.yml` の設定をもとに Locale ファイルを生成・同期します。ここで生成される Locale ファイルは `README.locale.yml` です。

`inalz sync` コマンドは冪等です。つまり、元ドキュメントに変更がなければ、すでにある Locale ファイルは変更されません。

`README.locale.yml` の内容は以下のようになるはずです。

```yml
texts:
  en: Hello world
  ja: __COPY__
---
texts:
  en: This is a hello-world document.
  ja: __COPY__
```

Locale ファイルは、パラグラフ単位での文章の対応を表しています。デフォルトの `__COPY__` は、元の文章を置き換えずにそのまま使うことを意味しています。また、コードブロックは無視されます。

`README.locale.yml` の一部を編集してみましょう。

```yml
texts:
  en: Hello world
  ja: __COPY__
---
texts:
  en: This is a hello-world document.
  ja: これはハローワールドのドキュメントです。
```

翻訳作業が完了したので、翻訳ドキュメントファイルを出力します。もう一つの Inalz コマンドを実行しましょう。

```console
$ inalz build
```

すると、翻訳ドキュメント `README_ja.md` が新たに出力されます。

    example/helloworld/
    ├── README.locale.yml
    ├── README.md
    ├── README_ja.md
    └── inalz.yml

`inalz build` コマンドは、Locale ファイルと元ドキュメントを参照して、翻訳ドキュメントを出力します。

`README_ja.md` の内容は以下のようになるはずです。

<div class="highlight"><pre class="chroma">
# Hello world

これはハローワールドのドキュメントです。

```bash
$ inalz sync
$ inalz build
```
</pre></div>

日本語訳 `README_ja.md` が完成しました！　翻訳ドキュメントは元ドキュメントの英文を単純に置換したものなので、 Markdown ドキュメント構造を保持しています。

### ドキュメントの更新

では、ドキュメントのメンテナンスをしましょう。

たとえば、`README.md` を次のように更新します。

<div class="highlight"><pre class="chroma">
# Hello world

This is an awesome hello-world document.

A new paragraph is added.

```bash
$ inalz sync
$ inalz build
```
</pre></div>

差分を確認します。

```diff
-This is a hello-world document.
+This is an awesome hello-world document.
+
+A new paragraph is added.
```

既存のパラグラフが変更され、新たなパラグラフも追加されています。

元ドキュメントを更新したら、`inalz sync` コマンドで Locale ファイルに変更を反映します。

    $ inalz sync

`README.locale.yml` は以下のようになるはずです。

```yml
texts:
  en: Hello world
  ja: __COPY__
---
meta:
  outdated: true
texts:
  en: This is an awesome hello-world document.
  ja: これはハローワールドのドキュメントです。
---
texts:
  en: A new paragraph is added.
  ja: __COPY__
```

観察すると次のことがわかります。

-   更新されたパラグラフは `meta.outdated` が `true` になる
-   新しいパラグラフが追加される

`meta.outdated` は注釈です。`inalz build` には影響しませんが、そのパラグラフの翻訳が古くなっていることを教えてくれます。

更新のための翻訳作業では、以下のことを行います。

-   更新されたパラグラフを翻訳し直し、`meta.outdated` を削除する
-   新しいパラグラフを翻訳する

`README.locale.yml` を以下のように更新します。

```yml
texts:
  en: Hello world
  ja: __COPY__
---
texts:
  en: This is an awesome hello-world document.
  ja: これは素晴らしいハローワールドのドキュメントです。
---
texts:
  en: A new paragraph is added.
  ja: 新しいパラグラフが追加されます。
```

それから、翻訳ドキュメントを出力します。

    $ inalz build

`README_ja.md` は以下のようになるはずです。

<div class="highlight"><pre class="chroma">
# Hello world

これは素晴らしいハローワールドのドキュメントです。

新しいパラグラフが追加されます。

```bash
$ inalz sync
$ inalz build
```
</pre></div>

このように、Locale ファイルを介してドキュメントを更新します。翻訳が古くなったパラグラフは Locale ファイルが教えてくれるので、ドキュメントのメンテナンスが容易です。
