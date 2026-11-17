/** @jsxRuntime automatic */
/** @jsxImportSource @lumeland/ssx */

import "@lumeland/core/types.ts";

import { formatDate } from "../utils/date.ts";
import Layout from "../components/Layout.tsx";

const Item = ({ page }: { page: Lume.Page }) => {
  const createdAt = page.data.createdAt
    ? formatDate(page.data.createdAt)
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
  const datas = data.search
    .pages("layout=/layouts/Article.tsx")
    .sort((a: Lume.Data, b: Lume.Data) => {
      if (!a.createdAt || !b.createdAt) {
        return 0;
      }
      return Temporal.ZonedDateTime.compare(b.createdAt, a.createdAt);
    });

  return (
    <Layout data={data}>
      <article className="top">
        {data.title && (
          <h1>
            <a href={data.page.outputPath}>{data.title}</a>
          </h1>
        )}
        <ul className="list">
          {datas.map(({ page }: Lume.Data, index: number) => (
            // @ts-expect-error: ssx JSX types lack intrinsic key attribute
            <Item key={index} page={page} />
          ))}
        </ul>
      </article>
    </Layout>
  );
};
