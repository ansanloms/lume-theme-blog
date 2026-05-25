---
createdAt: "2025-01-03T00:00:00+09:00"
---

# Code block filename

コードブロックにファイル名を表示する機能の確認。

## 基本的な使い方

言語指定の後にコロンでファイル名を記述する。

```typescript:hello.ts
const message: string = "Hello, World!";
console.log(message);
```

## パス付きファイル名

ディレクトリパスを含むファイル名も指定できる。

```typescript:src/utils/helper.ts
export function add(a: number, b: number): number {
  return a + b;
}

export function subtract(a: number, b: number): number {
  return a - b;
}
```

## 他の言語

```css:styles/theme.css
body {
  font-family: sans-serif;
  color: #333;
}
```

```json:package.json
{
  "name": "example",
  "version": "1.0.0"
}
```

## ファイル名なし (従来の形式)

ファイル名を省略した場合は従来通りの表示になる。

```typescript
const x = 1;
```

## 行ハイライトとの併用

```typescript:main.ts {2-3}
function greet(name: string) {
  const greeting = `Hello, ${name}!`;
  console.log(greeting);
}
```
