interface BarListProps {
  items: Array<{ label: string; value: number }>;
  emptyLabel?: string;
}

/**
 * Lightweight horizontal bar chart rendered with plain CSS (no chart library).
 * Data is supplied by callers from verified API responses only.
 */
export function BarList({ items, emptyLabel = 'No data yet' }: BarListProps) {
  if (items.length === 0) {
    return <p className="muted">{emptyLabel}</p>;
  }
  const max = Math.max(...items.map((item) => item.value), 1);
  const total = items.reduce((sum, item) => sum + item.value, 0);
  return (
    <ul className="bar-list" role="list">
      {items.map((item) => (
        <li key={item.label} className="bar-row">
          <span className="bar-label" title={item.label}>
            {item.label}
          </span>
          <span className="bar-track" aria-hidden="true">
            <span className="bar-fill" style={{ width: `${Math.max(4, Math.round((item.value / max) * 100))}%` }} />
          </span>
          <span className="bar-value">
            {item.value}
            <small>{total > 0 ? Math.round((item.value / total) * 100) : 0}%</small>
          </span>
        </li>
      ))}
    </ul>
  );
}
