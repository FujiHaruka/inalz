---
title: 'API'
draft: false
weight: 40
---

## 設定ファイル

設定ファイルは YAML または JSON で書くことができ、ファイル名は `inalz.yml` はたは `inalz.json` にして、普通、プロジェクトルートに置きます。設定ファイルは言語やドキュメント同士のマッピングを設定します。

以下が inalz.yml の完全な例です。

```yml
# language settings
lang:
  # source language
  source: en
  # target languages
  targets:
    - ja
    - zh
# document settings
documents:
  # you can specify single file mapping
  - source: path/to/en/doc.md
    targets:
      ja: path/to/ja/doc.md
      zh: path/to/zh/doc.md
    locale: path/to/doc.locale.yml
  # you can specify directory mapping for all markdown files under the directory
  - source: dir/to/en
    targets:
      ja: dir/to/ja
      zh: dir/to/zh
    locale: dir/to/locale
options:
  # you can specify patterns for ignoring paragraph by regular expressions
  # this is useful for template such as hugo
  paragraphIgnorePatterns: "^{{.+}}$"
```

## Inalz コマンド

以下のコマンドは、設定ファイル `inalz.yml` があるディレクトリで実行します。

-   `inalz sync`: 元ドキュメントから Locale ファイルを同期します
-   `inalz build`: Locale ファイルから翻訳ドキュメントを出力します

元ドキュメントと Locale ファイル、翻訳ドキュメントのマッピングは設定ファイル内に記述します。

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
