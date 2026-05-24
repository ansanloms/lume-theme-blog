import "lume/types.ts";

import Layout from "../components/Layout.tsx";

/**
 * Temporal.ZonedDateTime を ISO 8601 文字列にフォーマットする。
 * IANA タイムゾーンアノテーション部分（`[...]`）は表示不要のため除去する。
 */
const formatDate = (dt: Temporal.ZonedDateTime): string =>
  dt.toString({ timeZoneName: "never" });

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
        ? formatDate(data.article.createdAt)
        : undefined,
    },
    {
      label: "Updated at",
      value: data.article?.updatedAt
        ? formatDate(data.article.updatedAt)
        : undefined,
    },
  ].filter((item): item is Parameters<typeof MetaItem>[0] =>
    typeof item.value === "string"
  );

  return (
    <Layout data={data}>
      {metas.length > 0 && <Meta items={metas} />}
      <article className="article">
        {/* @ts-expect-error TS2322 */}
        {data.children}
      </article>
    </Layout>
  );
};
