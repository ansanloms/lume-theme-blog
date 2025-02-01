import Layout from "../components/Layout.tsx";
import * as datetime from "../../deps/@std/datetime/mod.ts";

import "lume/types.ts";

const MetaItem = ({ label, value }: { label: string; value: string }) => {
  return (
    <li className="item">
      <span className="label">{label}</span>
      <span className="value">{value}</span>
    </li>
  );
};

const Meta = ({ items }: { items: Parameters<typeof MetaItem>[0][] }) => {
  return (
    <ul className="meta">
      {items.map((item, index) => <MetaItem key={index} {...item} />)}
    </ul>
  );
};

export default (data: Lume.Data) => {
  const metas: Parameters<typeof Meta>[0]["items"] = [
    {
      label: "Created at",
      value: data.article?.createdAt
        ? datetime.format(data.article.createdAt, "yyyy-MM-dd")
        : undefined,
    },
    {
      label: "Updated at",
      value: data.article?.updatedAt
        ? datetime.format(data.article.updatedAt, "yyyy-MM-dd")
        : undefined,
    },
  ].filter((item): item is Parameters<typeof MetaItem>[0] =>
    typeof item.value === "string"
  );

  return (
    <Layout data={data}>
      {metas.length > 0 && <Meta items={metas} />}
      <article className="article">
        {data.children}
      </article>
    </Layout>
  );
};
