import plugins, { Options } from "./plugins.ts";

import "lume/types.ts";

export type { Options } from "./plugins.ts";

export default (options: Partial<Options> = {}) => {
  return (site: Lume.Site) => {
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
    ].forEach((file) => {
      site.remoteFile(file, import.meta.resolve(`./${file}`));
    });
  };
};
