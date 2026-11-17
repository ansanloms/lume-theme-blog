import plugins, { Options } from "./plugins.ts";

import "@lumeland/core/types.ts";
import type Site from "@lumeland/core/site.ts";

export type { Options } from "./plugins.ts";

export default (options: Partial<Options> = {}) => {
  return (site: Site) => {
    site.use(plugins(options));

    [
      "_includes/components/Layout.tsx",
      "_includes/layouts/Article.tsx",
      "_includes/layouts/Top.tsx",
      "styles/general.css",
      "styles/layout.css",
      "styles/palette.css",
      "styles/top.css",
      "styles/article.css",
      "styles/shiki.css",
      "scripts/color-scheme.mjs",
      "scripts/mermaid.mjs",
    ].forEach((file) => {
      site.remote(`/${file}`, import.meta.resolve(`./${file}`));
      if (!file.startsWith("_")) {
        site.add(`/${file}`);
      }
    });
  };
};
