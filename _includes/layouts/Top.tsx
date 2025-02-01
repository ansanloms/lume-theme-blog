import Layout from "../components/Layout.tsx";
import * as datetime from "../../deps/@std/datetime/mod.ts";

import "lume/types.ts";

const Item = ({ page }: { page: Lume.Page }) => {
  const createdAt = page.data.article?.createdAt
    ? datetime.format(page.data.article.createdAt, "yyyy-MM-dd")
    : undefined;

  return (
    <li className="item">
      {createdAt && <p>{createdAt}</p>}
      <h2>
        <a href={page.outputPath}>{page.data.title ?? ""}</a>
      </h2>
    </li>
  );
};

export default (data: Lume.Data) => {
  const datas = data.search.pages(
    "layout=/layouts/Article.tsx",
    "article.createdAt=desc",
  );

  return (
    <Layout data={data}>
      <article className="top">
        {data.title && (
          <h1>
            <a href={data.page.outputPath}>{data.title}</a>
          </h1>
        )}
        <ul className="list">
          {datas.map(({ page }, index) => <Item key={index} page={page} />)}
        </ul>
      </article>
    </Layout>
  );
};
