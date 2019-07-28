---
title: 'API'
draft: false
weight: 40
---

## 設定ファイル

設定ファイルは YAML または JSON で書くことができます。ファイル名は `inalz.yml` または `inalz.json` にして、普通、プロジェクトルートに置きます。

設定ファイルは言語やドキュメント同士のマッピングを設定します。

以下が inalz.yml の完全な例です。

```yml
lang:
  source: en
  targets:
    - ja
    - zh
documents:
  # you can specify single file mapping
  - source: path/to/en/doc.md
    targets:
      ja: path/to/ja/doc.md
      zh: path/to/zh/doc.md
    locale: path/to/doc.locale.yml
  # you can also specify directory mapping
  - source: dir/to/en
    targets:
      ja: dir/to/ja
      zh: dir/to/zh
    locale: dir/to/locale
options:
  lineIgnorePatterns: "^{{.+}}$"
  documentExtension: ".hbs"
  markdownOptions:
    commonmark: true
```

### lang

`lang` フィールドは言語についてです。翻訳元言語と、翻訳先言語を記述します。

-   `source`: 翻訳先言語名
-   `targets`: 翻訳先言語名のリスト

言語名には任意の文字列を指定できます。

### documents

`documents` フィールドにはファイルのマッピングを記述します。

-   `source`: `lang.source` で指定した言語で書かれた元ドキュメントの場所。ファイルまたはディレクトリ。
-   `targets`: `lang.targets` で指定した言語で書かれた翻訳ドキュメントの場所。言語名をキーとしたマッピで、値はファイルまたはディレクトリ。
-   `locale`: `source` と `targets` の Locale ファイルの場所。ファイルまたはディレクトリ。

`source` がファイルパスであれば、`targets` と `locale` はファイルパスでなければなりません。`source` がディレクトリパスであれば、`targets` と `locale` はディレクトリパスでなければなりません。

`source` にディレクトリを指定した場合、ディレクトリ下のすべての Markdown ファイルが再帰的に検索され、翻訳対象になります。`source` のファイル名に応じて Locale ファイルと翻訳ドキュメントファイルが生成されます。上の例では、`source` が `dir/to/en` ですが、`dir/to/en/doc.md` というファイルが見つかれば、Locale ファイル `dir/to/locale/doc.md` と翻訳ファイル `dir/to/ja/doc.md`、`dir/to/zh/doc.md` が対応します。

## options

`options` フィールドはオプションを記述します。

-   `lineIgnorePatterns`: source の Markdown ドキュメント内で Locale ファイルに取り込みたくない行を JavaScript の[正規表現](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)で記述します。このパターンにマッチする行は無視されます。このオプションは、[hugo](https://gohugo.io/) など Markdown ファイルをテンプレートとして使うようなケースで役立ちます。
-   `documentExtension`: documents にディレクトリを指定した場合、対象となる Markdown ドキュメントの拡張子を指定できます。デフォルトでは `.md` です。
-   `markdownOptions`: Markdown をコンパイルする際のオプションを指定できます。このオプションは [remark-stringify](https://github.com/remarkjs/remark/tree/master/packages/remark-stringify) にそのまま渡されます。詳細は remark-stringify を参照してください。

## Inalz コマンド

以下のコマンドは、設定ファイル `inalz.yml` があるディレクトリで実行します。

-   `inalz sync`: 元ドキュメントから Locale ファイルを同期します
-   `inalz build`: Locale ファイルから翻訳ドキュメントを出力します

元ドキュメントと Locale ファイル、翻訳ドキュメントのマッピングは `inalz.yml` 内に記述します。

![inalz commands](/images/cli_commands.jpg)

## Locale ファイル

`inalz sync` コマンドによって生成される Locale ファイルは、1 つのファイルに複数の YAML ドキュメントが含まれます。各 YAML ドキュメントはセパレータ `---` で区切られていて、次のような形式です。

```yaml
meta:
  outdated: true
  unused: true
texts:
  en: Hello world
  ja: ハローワールド
```

-   `meta` フィールドはオプショナルで、 `inalz sync` によって自動生成されます。
    -   `meta.outdated` ラベルは原文が更新されると付与されます。翻訳文を更新し、`meta` フィールドを手動で削除してください。
    -   `meta.outdated` ラベルは原文が更新され、使われなくなったパラグラフに付与されます。不要であると判断したら、 YAML ドキュメントごと削除してください。
-   `texts` フィールドは、原文・翻訳文を含めた Mapping です。
    -   Mapping の key は、`inalz.yml` の `lang` フィールドによって規定されます。
    -   翻訳作業では、翻訳言語の値を編集します。元言語の値を編集してはいけません。
    -   翻訳言語の値が `__COPY__` であるとき、原文を置換せずにそのまま使用します。
