import "lume/types.ts";

import Layout from "../components/Layout.tsx";
import { formatDate } from "../utils/date.ts";
import Meta, { type MetaItemProps } from "../components/Meta.tsx";

export default (data: Lume.Data) => {
  const metas: MetaItemProps[] = [
    {
      label: "Created at",
      value: data.article?.createdAt
        ? formatDate(data.article.createdAt)
        : undefined,
    },
    {
      label: "Updated at",
      value: data.article?.updatedAt
        ? formatDate(data.article.updatedAt)
        : undefined,
    },
  ].filter((item): item is MetaItemProps => typeof item.value === "string");

  return (
    <Layout data={data}>
      {metas.length > 0 && <Meta items={metas} />}
      <article className="article">
        {data.children}
      </article>
    </Layout>
  );
};
