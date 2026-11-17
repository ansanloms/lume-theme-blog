# lume-theme-blog

[Lume](https://lume.land/) 4 用のブログテーマ。

## 必要環境

- Node 24 以上
- Lume 4 (`@lumeland/lume`)

## 導入

```bash
npm i @lumeland/lume
npm i github:ansanloms/lume-theme-blog#0.2.1
```

`_config.ts` で `blog()` を適用する。

```ts
import lume from "@lumeland/lume";
import blog from "lume-theme-blog";

const site = lume({ src: "./docs" });

site.use(blog());

export default site;
```

オプションは `blog({ markdown, mermaid })` で渡す。例は [examples/_config.ts](examples/_config.ts) を参照。

## tsconfig.json

テーマは TypeScript のまま配布している。`lume` CLI (tsx 経由) が `node_modules` 内の `.ts` を読む。利用側の `tsconfig.json` には次の設定が要る。

```json
{
  "compilerOptions": {
    "moduleResolution": "NodeNext",
    "module": "NodeNext",
    "allowImportingTsExtensions": true,
    "jsx": "react-jsx",
    "jsxImportSource": "@lumeland/ssx"
  }
}
```

## Mermaid

Mermaid の描画は [lume-plugin-mermaid](https://github.com/ansanloms/lume-plugin-mermaid) に任せている。0.2.0 から、図にパン・ズーム (ホイール・ドラッグ・操作ボタン) とコードのコピーボタンが付く。ズームは省略時に有効で、ホイールは Ctrl / Meta キーを押しながら操作し、縦横比は 4:3 になる。設定は `blog({ mermaid: { zoom } })` で変える。

## 開発

```bash
npm ci
npm run build
npm test
npm run check
npm run lint
```

examples は `examples` ディレクトリで確認する。

```bash
cd examples
npm run serve
```
