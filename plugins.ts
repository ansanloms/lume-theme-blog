import basePath from "lume/plugins/base_path.ts";
import resolveUrls from "lume/plugins/resolve_urls.ts";
import jsx from "lume/plugins/jsx.ts";
import nav from "lume/plugins/nav.ts";
import { Page } from "lume/core/file.ts";
import pagefind from "lume/plugins/pagefind.ts";
import mermaid, {
  type Options as MermaidOptions,
} from "./deps/lume-plugin-mermaid/mod.ts";
import remark from "lume/plugins/remark.ts";
import remarkGfm from "./deps/remark-gfm/index.ts";
import rehypeSlug from "./deps/rehype-slug/index.ts";
import GithubSlugger from "./deps/github-slugger/index.ts";
import {
  extendedTableHandlers,
  remarkExtendedTable,
} from "./deps/remark-extended-table/index.ts";
import remarkGithubBetaBlockquoteAdmonitions from "./deps/remark-github-beta-blockquote-admonitions/index.ts";
import rehypeAutolinkHeadings from "./deps/rehype-autolink-headings/index.ts";
import rehypeShiki from "./deps/@shikijs/rehype/index.ts";
import {
  transformerMetaHighlight,
  transformerMetaWordHighlight,
  transformerNotationFocus,
} from "./deps/@shikijs/transformers/index.ts";
import {
  rehypeStringify,
  remarkParse,
  remarkRehype,
  unified,
} from "lume/deps/remark.ts";
import { merge } from "lume/core/utils/object.ts";
import { visit } from "./deps/unist-util-visit/index.ts";
import type { Heading, Root } from "./deps/@types/mdast/index.ts";

import "lume/types.ts";

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
  mermaid: Omit<MermaidOptions, "config"> & {
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
        url:
          "https://raw.githubusercontent.com/awslabs/aws-icons-for-plantuml/refs/tags/v23.0/dist/aws-icons-mermaid.json",
      },
    ],
    querySelector: "pre > code[data-language='mermaid']",
    scriptSrc: "/scripts/mermaid.mjs",
  },
};

/**
 * shiki で利用するインラインコードのデフォルト言語を指定する。
 * @see https://shiki.style/packages/rehype#inline-code
 */
export const remarkAddInlineCodeLang: unified.Plugin<
  [{ default?: string }?],
  Root
> = (
  options,
) => {
  return (tree) => {
    visit(tree, "inlineCode", (node) => {
      if (!(node.value.match(/(.+)\{:([\w-]+)\}$/))) {
        node.value = `${node.value}{:${options?.default ?? "txt"}}`;
      }
    });
  };
};

/**
 * 任意の言語をハイライト対象外にする。
 */
export const remarkRemoveShikiHighlight: unified.Plugin<
  [{ excludeLanguages: string[] }],
  Root
> = (
  { excludeLanguages },
) => {
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

  return (site: Lume.Site) => {
    site
      .data("layout", "/layouts/Article.tsx")
      .use(basePath())
      .use(resolveUrls())
      .use(jsx())
      .use(nav())
      .use(pagefind())
      .use(
        remark({
          remarkPlugins: [
            remarkGfm,
            remarkExtendedTable,
            [remarkAddInlineCodeLang, { default: "txt" }],
            [remarkRemoveShikiHighlight, {
              excludeLanguages: options.markdown.syntaxHighlight.exclude,
            }],
            [remarkGithubBetaBlockquoteAdmonitions, {
              classNameMaps: {
                block: (title: string) => ["admonition", title.toLowerCase()],
                title: (
                  title: string,
                ) => ["admonitionTitle", title.toLowerCase()],
              },
            }],
            [remarkRehype, {
              handlers: extendedTableHandlers,
            }],
          ],
          rehypePlugins: [
            rehypeSlug,
            [rehypeAutolinkHeadings, {
              behavior: "wrap",
            }],
            [rehypeShiki, {
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
              ],
            }],
          ],
        }),
      )
      .use(mermaid(options.mermaid))
      .preprocess([".md"], async (pages, all) => {
        const processor = unified.unified()
          .use(remarkParse)
          .use(remarkRehype)
          .use(rehypeStringify);

        const slugger = new GithubSlugger();

        for (const page of pages) {
          const content = processor.parse(String(page.data.content));

          if (typeof page.data.title === "undefined") {
            page.data.title =
              (content.children.find((child): child is Heading =>
                child.type === "heading" && child.depth === 1
              ))?.children.find((child) => child.type === "text")?.value;
          }

          slugger.reset();

          try {
            page.data.createdAt = typeof page.data.createdAt === "string"
              ? Temporal.PlainDateTime.from(page.data.createdAt)
                .toZonedDateTime(Temporal.Now.timeZoneId())
              : undefined;
          } catch {
            page.data.createdAt = undefined;
          }

          try {
            page.data.updatedAt = typeof page.data.updatedAt === "string"
              ? Temporal.PlainDateTime.from(page.data.updatedAt)
                .toZonedDateTime(Temporal.Now.timeZoneId())
              : undefined;
          } catch {
            page.data.updatedAt = undefined;
          }

          // raw の markdown を追加する。
          all.push(Page.create({
            url: page.src.path + page.src.ext,
            content: page.src.entry?.src
              ? await Deno.readTextFile(page.src.entry.src)
              : "",
          }));
        }
      });
  };
}

declare global {
  namespace Lume {
    export interface Data {
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
