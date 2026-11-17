# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build            # 本番ビルド (_site/ に出力)
npm run serve            # 開発サーバ起動 (ホットリロード付き)
npm test                 # 全テスト実行 (node:test + tsx)
npm run check            # 型チェック (tsc --noEmit)
npm run lint             # oxlint + oxfmt チェック
npm run fix              # oxlint --fix + oxfmt 自動修正
```

単一テストファイルの実行:

```bash
node --import tsx --import temporal-polyfill/global --test _includes/utils/date.test.ts
```

## Architecture

Lume 4 (Node 24 製 SSG) 用のブログテーマプラグイン。利用側は `site.use(blog())` で一括適用する。

### エントリポイントの二層構造

- **`mod.ts`** — テーマの公開エントリポイント。`plugins.ts` を呼び出した後、レイアウト・スタイル・スクリプト等のアセットファイルを `site.remote` + `site.add` で利用先サイトに登録する。
- **`plugins.ts`** — Markdown 処理パイプラインの構成が中心。remark/rehype プラグインチェーン (GFM, extended table, admonitions, Shiki シンタックスハイライト, slug, autolink headings) と Mermaid プラグインを組み立てる。`preprocess` フックで frontmatter の `createdAt`/`updatedAt` を `Temporal.ZonedDateTime` に変換する。

### 依存

外部依存は `package.json` でバージョンを固定し、パッケージ名で直接 import する。TS のまま配布する (`main: "mod.ts"`)。利用側は lume CLI (tsx 経由) で `node_modules` 内の `.ts` を読む。

### _includes/

- `layouts/` — ページレイアウト。`Article.tsx` (記事個別ページ, デフォルト layout), `Top.tsx` (記事一覧)
- `components/` — 共有コンポーネント。`Layout.tsx` (HTML シェル), `Meta.tsx` (メタ情報表示)
- `utils/` — ユーティリティ。`date.ts` (Temporal.ZonedDateTime のフォーマット)

### examples/

テーマの利用例。`examples/_config.ts` が `../mod.ts` を直接 import する。依存はルートの `node_modules` を使う。
