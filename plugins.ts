import basePath from "@lumeland/plugin-base-path";
import resolveUrls from "@lumeland/plugin-resolve-urls";
import jsx from "@lumeland/plugin-jsx";
import nav from "@lumeland/plugin-nav";
import pagefind from "@lumeland/plugin-pagefind";
import remark from "@lumeland/plugin-remark";
import mermaid, {
  type Options as MermaidOptions,
} from "@ansanloms/lume-plugin-mermaid";
import rehypeSlug from "rehype-slug";
import GithubSlugger from "github-slugger";
import {
  extendedTableHandlers,
  remarkExtendedTable,
} from "remark-extended-table";
import remarkGithubBetaBlockquoteAdmonitions from "remark-github-beta-blockquote-admonitions";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeShiki from "@shikijs/rehype";
import {
  transformerMetaHighlight,
  transformerMetaWordHighlight,
  transformerNotationFocus,
} from "@shikijs/transformers";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { type Plugin, unified } from "unified";
import { readFile } from "node:fs/promises";
import { Page } from "@lumeland/core/file.ts";
import type Site from "@lumeland/core/site.ts";
import { merge } from "@lumeland/core/utils/object.ts";
import { visit } from "unist-util-visit";
import type { Heading, Root } from "mdast";

import "@lumeland/core/types.ts";

/**
 * markdown の設定。
 */
interface Markdown {
  /**
   * シンタックスハイライトの設定。
   */
  syntaxHighlight: {
    /**
     * シンタックスハイライトのテーマ。
     * Shiki(https://shiki.style/)のテーマを指定する。
     */
    themes: { light: string; dark: string };

    /**
     * ハイライト対象外の言語。
     */
    exclude: string[];
  };
}

/**
 * オプション。
 */
export interface Options {
  /**
   * markdown の設定。
   */
  markdown: Markdown;

  /**
   * Meramid の設定。
   */
  mermaid: Omit<MermaidOptions, "config" | "zoom"> & {
    /**
     * パン・ズームの設定。省略時は lume-plugin-mermaid の既定値。
     */
    zoom?: MermaidOptions["zoom"];

    /**
     * Mermaid initialize 時の設定。
     */
    config: {
      /**
       * ライトモード。
       */
      light: MermaidOptions["config"];

      /**
       * ダークモード。
       */
      dark: MermaidOptions["config"];
    };
  };
}

export const defaults: Options = {
  markdown: {
    syntaxHighlight: {
      themes: { light: "github-light", dark: "github-dark" },
      exclude: ["mermaid"],
    },
  },
  mermaid: {
    version: "11.15.0",
    config: {
      light: {
        theme: "default",
      },
      dark: {
        theme: "dark",
      },
    },
    icons: [
      {
        name: "logos",
        url: "https://unpkg.com/@iconify-json/logos@1.2.11/icons.json",
      },
      {
        name: "aws",
        // 注意: CC-BY-ND-2.0
        // aws-icons-mermaid.json 内に記述あり。
        // ビルド結果にそのままこの json が含まれるからそれでいいはず。
        url: "https://raw.githubusercontent.com/awslabs/aws-icons-for-plantuml/refs/tags/v23.0/dist/aws-icons-mermaid.json",
      },
    ],
    querySelector: "pre > code[data-language='mermaid']",
    scriptSrc: "/scripts/mermaid.mjs",
  },
};

/**
 * コードブロックの言語指定から `lang:filename` 形式のファイル名を分離する。
 *
 * `typescript:test.ts` のように指定すると、`node.lang` を `typescript` に修正し、
 * `filename=test.ts` を `node.meta` に付加する。
 */
export const remarkCodeBlockFilename: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, "code", (node) => {
      if (!node.lang) {
        return;
      }
      const colonIndex = node.lang.indexOf(":");
      if (colonIndex < 1 || colonIndex === node.lang.length - 1) {
        return;
      }

      const filename = node.lang.slice(colonIndex + 1);
      node.lang = node.lang.slice(0, colonIndex);
      node.meta = node.meta
        ? `${node.meta} filename=${filename}`
        : `filename=${filename}`;
    });
  };
};

/**
 * Shiki transformer: meta の `filename=...` を `<pre>` の `data-filename` 属性に変換する。
 */
export const transformerFilename = () => ({
  name: "transformer-filename",
  pre(
    this: { options: { meta?: { __raw?: string } } },
    node: {
      properties: Record<string, unknown>;
    },
  ) {
    const raw = this.options.meta?.__raw;
    if (!raw) {
      return;
    }
    const match = raw.match(/(?:^|\s)filename=(\S+)/);
    if (match) {
      node.properties["data-filename"] = match[1];
    }
  },
});

/**
 * shiki で利用するインラインコードのデフォルト言語を指定する。
 * @see https://shiki.style/packages/rehype#inline-code
 */
export const remarkAddInlineCodeLang: Plugin<[{ default?: string }?], Root> = (
  options,
) => {
  return (tree) => {
    visit(tree, "inlineCode", (node) => {
      if (!node.value.match(/(.+)\{:([\w-]+)\}$/)) {
        node.value = `${node.value}{:${options?.default ?? "txt"}}`;
      }
    });
  };
};

/**
 * 任意の言語をハイライト対象外にする。
 */
export const remarkRemoveShikiHighlight: Plugin<
  [{ excludeLanguages: string[] }],
  Root
> = ({ excludeLanguages }) => {
  return (tree) => {
    visit(tree, "code", (node) => {
      if (node.lang && excludeLanguages.includes(node.lang)) {
        // かわりに data-language=lang をつける。
        node.data ??= {};
        node.data.hProperties ??= {};
        node.data.hProperties.dataLanguage = node.lang;

        // 言語設定を削除。
        // これで shiki のハイライト対象外になる。
        node.lang = null;
      }
    });
  };
};

export default function (userOptions?: Partial<Options>) {
  const options = merge(defaults, userOptions);

  return (site: Site) => {
    site
      .data("layout", "/layouts/Article.tsx")
      .use(basePath())
      .use(resolveUrls())
      .use(jsx())
      .use(nav())
      .use(pagefind({ componentUI: false }))
      .use(
        remark({
          remarkPlugins: [
            remarkExtendedTable,
            remarkCodeBlockFilename,
            [remarkAddInlineCodeLang, { default: "txt" }],
            [
              remarkRemoveShikiHighlight,
              {
                excludeLanguages: options.markdown.syntaxHighlight.exclude,
              },
            ],
            [
              remarkGithubBetaBlockquoteAdmonitions,
              {
                classNameMaps: {
                  block: (title: string) => ["admonition", title.toLowerCase()],
                  title: (title: string) => [
                    "admonitionTitle",
                    title.toLowerCase(),
                  ],
                },
              },
            ],
          ],
          rehypeOptions: {
            allowDangerousHtml: true,
            handlers: extendedTableHandlers,
          },
          rehypePlugins: [
            rehypeSlug,
            [
              rehypeAutolinkHeadings,
              {
                behavior: "wrap",
              },
            ],
            [
              rehypeShiki,
              {
                addLanguageClass: true,
                themes: options.markdown.syntaxHighlight.themes,
                defaultColor: false,
                defaultLanguage: "", // 明示的に空にしないと txt 相当でハイライトされる。
                inline: "tailing-curly-colon",
                onError: (error: unknown) => {
                  console.warn(String(error));
                },
                transformers: [
                  transformerMetaHighlight(),
                  transformerMetaWordHighlight(),
                  transformerNotationFocus(),
                  transformerFilename(),
                ],
              },
            ],
          ],
        }),
      )
      .use(mermaid(options.mermaid))
      .preprocess([".md"], async (pages, all) => {
        const processor = unified()
          .use(remarkParse)
          .use(remarkRehype)
          .use(rehypeStringify);

        const slugger = new GithubSlugger();

        for (const page of pages) {
          const content = processor.parse(String(page.data.content));

          if (typeof page.data.title === "undefined") {
            page.data.title = content.children
              .find(
                (child): child is Heading =>
                  child.type === "heading" && child.depth === 1,
              )
              ?.children.find((child) => child.type === "text")?.value;
          }

          slugger.reset();

          try {
            page.data.createdAt =
              typeof page.data.createdAt === "string"
                ? Temporal.PlainDateTime.from(
                    page.data.createdAt,
                  ).toZonedDateTime(Temporal.Now.timeZoneId())
                : undefined;
          } catch {
            page.data.createdAt = undefined;
          }

          try {
            page.data.updatedAt =
              typeof page.data.updatedAt === "string"
                ? Temporal.PlainDateTime.from(
                    page.data.updatedAt,
                  ).toZonedDateTime(Temporal.Now.timeZoneId())
                : undefined;
          } catch {
            page.data.updatedAt = undefined;
          }

          // raw の markdown を追加する。
          all.push(
            Page.create({
              url: page.src.path + page.src.ext,
              content: page.src.entry?.src
                ? await readFile(page.src.entry.src, "utf8")
                : "",
            }),
          );
        }
      });
  };
}

declare global {
  namespace Lume {
    export interface GlobalData {
      /**
       * markdown の設定。
       */
      markdown: Markdown;

      /**
       * ページの登録日時。
       */
      createdAt?: Temporal.ZonedDateTime | undefined;

      /**
       * ページの更新日時。
       */
      updatedAt?: Temporal.ZonedDateTime | undefined;
    }
  }
}
