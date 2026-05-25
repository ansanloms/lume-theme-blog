import { assertEquals } from "jsr:@std/assert@1";
import type { Code, InlineCode, Root } from "npm:@types/mdast@4.0.4";
import {
  remarkAddInlineCodeLang,
  remarkRemoveShikiHighlight,
} from "./plugins.ts";

// unified.Plugin は this: Processor を要求するため、テストではバインドを回避する。
// deno-lint-ignore no-explicit-any
const applyPlugin = <T>(plugin: any, options: T): (tree: Root) => void =>
  plugin.call({}, options);

// --- remarkAddInlineCodeLang ---

Deno.test("remarkAddInlineCodeLang: 言語指定なしのインラインコードにデフォルト言語が付与される", () => {
  const tree: Root = {
    type: "root",
    children: [
      {
        type: "paragraph",
        children: [
          { type: "inlineCode", value: "foo" } as InlineCode,
        ],
      },
    ],
  };

  applyPlugin(remarkAddInlineCodeLang, { default: "txt" })(tree);

  const node = (tree.children[0] as { children: InlineCode[] }).children[0];
  assertEquals(node.value, "foo{:txt}");
});

Deno.test("remarkAddInlineCodeLang: 既に言語指定があるインラインコードは変更されない", () => {
  const tree: Root = {
    type: "root",
    children: [
      {
        type: "paragraph",
        children: [
          { type: "inlineCode", value: "const x = 1{:ts}" } as InlineCode,
        ],
      },
    ],
  };

  applyPlugin(remarkAddInlineCodeLang, { default: "txt" })(tree);

  const node = (tree.children[0] as { children: InlineCode[] }).children[0];
  assertEquals(node.value, "const x = 1{:ts}");
});

Deno.test("remarkAddInlineCodeLang: カスタムデフォルト言語を指定できる", () => {
  const tree: Root = {
    type: "root",
    children: [
      {
        type: "paragraph",
        children: [
          { type: "inlineCode", value: "hello" } as InlineCode,
        ],
      },
    ],
  };

  applyPlugin(remarkAddInlineCodeLang, { default: "sh" })(tree);

  const node = (tree.children[0] as { children: InlineCode[] }).children[0];
  assertEquals(node.value, "hello{:sh}");
});

Deno.test("remarkAddInlineCodeLang: オプションなしの場合 txt がデフォルトになる", () => {
  const tree: Root = {
    type: "root",
    children: [
      {
        type: "paragraph",
        children: [
          { type: "inlineCode", value: "bar" } as InlineCode,
        ],
      },
    ],
  };

  applyPlugin(remarkAddInlineCodeLang, undefined)(tree);

  const node = (tree.children[0] as { children: InlineCode[] }).children[0];
  assertEquals(node.value, "bar{:txt}");
});

// --- remarkRemoveShikiHighlight ---

Deno.test("remarkRemoveShikiHighlight: 除外対象の言語から lang が除去され dataLanguage が設定される", () => {
  const codeNode: Code = {
    type: "code",
    lang: "mermaid",
    value: "graph TD; A-->B;",
  };
  const tree: Root = {
    type: "root",
    children: [codeNode],
  };

  applyPlugin(remarkRemoveShikiHighlight, {
    excludeLanguages: ["mermaid"],
  })(tree);

  assertEquals(codeNode.lang, null);
  assertEquals(
    (codeNode as Code & { data: Record<string, unknown> }).data,
    { hProperties: { dataLanguage: "mermaid" } },
  );
});

Deno.test("remarkRemoveShikiHighlight: 除外対象外の言語は変更されない", () => {
  const codeNode: Code = {
    type: "code",
    lang: "typescript",
    value: "const x = 1;",
  };
  const tree: Root = {
    type: "root",
    children: [codeNode],
  };

  applyPlugin(remarkRemoveShikiHighlight, {
    excludeLanguages: ["mermaid"],
  })(tree);

  assertEquals(codeNode.lang, "typescript");
  assertEquals(codeNode.data, undefined);
});

Deno.test("remarkRemoveShikiHighlight: lang が未設定のコードブロックは変更されない", () => {
  const codeNode: Code = {
    type: "code",
    value: "plain text",
  };
  const tree: Root = {
    type: "root",
    children: [codeNode],
  };

  applyPlugin(remarkRemoveShikiHighlight, {
    excludeLanguages: ["mermaid"],
  })(tree);

  assertEquals(codeNode.lang, undefined);
  assertEquals(codeNode.data, undefined);
});
