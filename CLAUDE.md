# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
deno task build          # 本番ビルド (_site/ に出力)
deno task serve          # 開発サーバ起動 (ホットリロード付き)
deno task test           # 全テスト実行 (--parallel --coverage)
deno task check          # 型チェック
deno task lint           # lint + fmt チェック
deno task fix            # lint --fix + fmt 自動修正
```

単一テストファイルの実行:

```bash
deno test -A _includes/utils/date.test.ts
```

## Architecture

Lume v3 (Deno 製 SSG) 用のブログテーマプラグイン。利用側は `site.use(blog())` で一括適用する。

### エントリポイントの二層構造

- **`mod.ts`** — テーマの公開エントリポイント。`plugins.ts` を呼び出した後、レイアウト・スタイル・スクリプト等のアセットファイルを `remoteFile` で利用先サイトに登録する。
- **`plugins.ts`** — Markdown 処理パイプラインの構成が中心。remark/rehype プラグインチェーン (GFM, extended table, admonitions, Shiki シンタックスハイライト, slug, autolink headings) と Mermaid プラグインを組み立てる。`preprocess` フックで frontmatter の `createdAt`/`updatedAt` を `Temporal.ZonedDateTime` に変換する。

### deps/ ディレクトリ

npm/URL の外部依存をバージョン固定の再エクスポートファイルとして集約している。依存の追加・更新時はここにラッパーファイルを作り、プロジェクト内では `./deps/...` 経由で import する。

### _includes/

- `layouts/` — ページレイアウト。`Article.tsx` (記事個別ページ, デフォルト layout), `Top.tsx` (記事一覧)
- `components/` — 共有コンポーネント。`Layout.tsx` (HTML シェル), `Meta.tsx` (メタ情報表示)
- `utils/` — ユーティリティ。`date.ts` (Temporal.ZonedDateTime のフォーマット)

### examples/

テーマの利用例。`deno.json` の import map `"lume-theme-blog/"` でリポジトリルートを自己参照している。
