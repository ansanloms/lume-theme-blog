import lume from "@lumeland/lume";
import basePath from "@lumeland/plugin-base-path";
import blog from "../mod.ts";

const site = lume({ src: "./docs" });

site
  .copy([".jpg", ".jpeg", ".gif", ".png", ".svg", ".webp", ".csv"])
  .use(basePath())
  .use(
    blog({
      /**
       * markdown の設定。
       */
      markdown: {
        /**
         * シンタックスハイライトの設定。
         */
        syntaxHighlight: {
          /**
           * シンタックスハイライトのテーマ。
           * Shiki(https://shiki.style/)のテーマを指定する。
           */
          themes: { light: "github-light", dark: "github-dark" },

          /**
           * ハイライト対象外の言語。
           */
          exclude: ["mermaid"],
        },
      },
    }),
  );

export default site;
