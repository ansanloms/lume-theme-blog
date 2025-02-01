import lume from "lume/mod.ts";
import blog from "lume-theme-blog/mod.ts";

const site = lume({ src: "./docs" });

site
  .use(blog({
    markdown: {
      syntaxHighlight: {
        themes: { light: "nord", dark: "nord" },
      },
    },
  }));

export default site;
