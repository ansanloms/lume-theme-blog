import basePath from "lume/plugins/base_path.ts";
import resolveUrls from "lume/plugins/resolve_urls.ts";
import jsx from "lume/plugins/jsx.ts";
import postcss from "lume/plugins/postcss.ts";
import remark from "lume/plugins/remark.ts";
import remarkGfm from "./deps/remark-gfm/index.ts";
import remarkGithubBetaBlockquoteAdmonitions from "./deps/remark-github-beta-blockquote-admonitions/index.ts";
import rehypeSlug from "./deps/rehype-slug/index.ts";
import rehypeAutolinkHeadings from "./deps/rehype-autolink-headings/index.ts";
import rehypeShiki from "./deps/@shikijs/rehype/index.ts";
import { merge } from "lume/core/utils/object.ts";
import {
  rehypeStringify,
  remarkParse,
  remarkRehype,
  unified,
} from "lume/deps/remark.ts";

import "lume/types.ts";

/**
 * markdown settings.
 */
interface Markdown {
  /**
   * Syntax highlight settings.
   */
  syntaxHighlight: {
    /**
     * Shiki(https://shiki.style/) theme.
     */
    themes: { light: string; dark: string };
  };
}

/**
 * Option.
 */
export interface Options {
  /**
   * Markdown.
   */
  markdown: Markdown;
}

/**
 * Article.
 */
interface Article {
  /**
   * createdAt.
   */
  createdAt?: Date;

  /**
   * updatedAt.
   */
  updatedAt?: Date;
}

export const defaults: Options = {
  markdown: {
    syntaxHighlight: {
      themes: { light: "github-light", dark: "github-dark" },
    },
  },
};

export default function (userOptions?: Partial<Options>) {
  const options = merge(defaults, userOptions);

  return (site: Lume.Site) => {
    site
      .data("layout", "/layouts/Article.tsx")
      .use(basePath())
      .use(resolveUrls())
      .use(jsx())
      .use(postcss())
      .use(
        remark({
          remarkPlugins: [
            remarkGfm,
            [remarkGithubBetaBlockquoteAdmonitions, {
              classNameMaps: {
                block: (title: string) => ["admonition", title.toLowerCase()],
                title: (
                  title: string,
                ) => ["admonitionTitle", title.toLowerCase()],
              },
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
              defaultColor: "dark",
              defaultLanguage: "txt",
              onError: (error) => {
                console.warn(String(error));
              },
            }],
          ],
        }),
      )
      .preprocess([".html"], async (pages) => {
        const processor = unified.unified()
          .use(remarkParse)
          .use(remarkRehype)
          .use(rehypeStringify);

        for (const page of pages) {
          if (typeof page.data.title === "undefined") {
            page.data.title = (await processor.parse(String(page.data.content)))
              .children.find((content) =>
                content.type === "heading" && content.depth === 1
              )?.children.find((content) => content.type === "text")?.value;
          }

          if (page.data.layout === "/layouts/Article.tsx") {
            page.data.article = {
              createdAt: page.data.createdAt
                ? new Date(page.data.createdAt)
                : undefined,
              updatedAt: page.data.updatedAt
                ? new Date(page.data.updatedAt)
                : undefined,
            };
          }
        }
      });
  };
}

declare global {
  namespace Lume {
    export interface Data {
      /**
       * article.
       */
      article?: Article;
    }
  }
}
