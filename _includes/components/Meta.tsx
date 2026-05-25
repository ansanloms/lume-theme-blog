export type MetaItemProps = { label: string; value: string };

const MetaItem = ({ label, value }: MetaItemProps) => {
  return (
    <li className="item">
      <span className="label">{label}</span>
      <span className="value">{value}</span>
    </li>
  );
};

const Meta = ({ items }: { items: MetaItemProps[] }) => {
  return (
    <ul className="meta">
      {items.map((item, index) => (
        // @ts-expect-error: ssx JSX types lack intrinsic key attribute
        <MetaItem key={index} label={item.label} value={item.value} />
      ))}
    </ul>
  );
};

export default Meta;
