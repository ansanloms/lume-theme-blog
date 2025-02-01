import "lume/types.ts";

export default ({ data, children }: {
  data: Lume.Data;
  children: Lume.Data["children"];
}) => (
  <html lang="ja">
    <head>
      <meta charSet="UTF-8" />
      <meta
        name="viewport"
        content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
      />
      <title>{data.title ?? ""}</title>
      <link rel="stylesheet" href="/styles/palette.css" />
      <link rel="stylesheet" href="/styles/general.css" />
      <link rel="stylesheet" href="/styles/layout.css" />
      <link rel="stylesheet" href="/styles/top.css" />
      <link rel="stylesheet" href="/styles/article.css" />
    </head>
    <body>
      <div className="container">
        <div className="content">
          {children}
        </div>
      </div>
    </body>
  </html>
);
