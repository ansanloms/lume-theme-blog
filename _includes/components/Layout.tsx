import "lume/types.ts";

export default (
  { data, children }: {
    data: Lume.Data;
    children: Lume.Data["children"];
  },
) => {
  return (
    <html lang={data.lang ?? "en"}>
      <head>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <title>{data.title ?? ""}</title>
        <script type="module" src="/scripts/color-scheme.mjs" />
        <link rel="stylesheet" href="/styles/palette.css" />
        <link rel="stylesheet" href="/styles/general.css" />
        <link rel="stylesheet" href="/styles/layout.css" />
        <link rel="stylesheet" href="/styles/article.css" />
        <link rel="stylesheet" href="/styles/shiki.css" />
      </head>
      <body className="container">
        <section className="content">
          {children}
        </section>
      </body>
    </html>
  );
};
