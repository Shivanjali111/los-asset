/**
 * DISPLAY-ONLY CHARTS: DashboardInsights passes numeric series to these shared components.
 * SourceBars and DonutChart accept items with stable id, label and count fields.
 * ColumnChart accepts id, label and value fields. Icon/color names select shared theme resources.
 * Visual dimensions are computed from the supplied values; no chart loads or owns business data.
 */
import AppIcon from "../../icons/AppIcon";
import EmptyState from "../EmptyState/EmptyState";

// Labels show a share of the total; bar widths compare each category with the largest one.
export function SourceBars({ items }) {
  const total = items.reduce((sum, item) => sum + item.count, 0);
  const maximum = Math.max(1, ...items.map((item) => item.count));
  if (!total) return <EmptyState message="No data for this period." />;
  return (
    <div className="channel-list">
      {items.map((item) => (
        <div className="channel-row" key={item.id}>
          <div className="channel-label">
            <span>
              <i>
                <AppIcon name={item.icon} size={14} />
              </i>
              {item.label}
            </span>
            <strong>
              {item.count} | {Math.round((item.count / total) * 100)}%
            </strong>
          </div>
          <div className="channel-track" aria-hidden="true">
            <div
              className="channel-fill"
              style={{ width: `${(item.count / maximum) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Each count becomes a percentage arc; the same items drive the legend so it stays consistent.
export function DonutChart({ items }) {
  const total = items.reduce((sum, item) => sum + item.count, 0);
  if (!total) return <EmptyState message="No data for this period." />;
  const stops = items.map((item, index) => {
    const start =
      (items
        .slice(0, index)
        .reduce((sum, previous) => sum + previous.count, 0) /
        total) *
      100;
    const end = start + (item.count / total) * 100;
    return `var(--theme-${item.color}) ${start}% ${end}%`;
  });
  return (
    <div className="donut-card">
      <div
        className="donut-chart"
        aria-hidden="true"
        style={{
          background: `radial-gradient(circle closest-side, var(--theme-surface) 68%, transparent 69%), conic-gradient(${stops.join(",")})`,
        }}
      >
        <span>
          {total}
          <small>Total</small>
        </span>
      </div>
      <div className="donut-legend">
        {items.map((item) => (
          <div key={item.id}>
            <i
              className={`legend-dot ${item.tone}`}
              style={{ background: `var(--theme-${item.color})` }}
            />
            {item.label}
            <strong>
              {item.count} | {Math.round((item.count / total) * 100)}%
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
}

// Add a little headroom above the largest value so columns do not fill the whole track.
export function ColumnChart({ items, label }) {
  const maximum = Math.max(1, ...items.map((item) => item.value)) * 1.06;
  if (!items.length) return <EmptyState message="No data for this period." />;
  return (
    <div className="throughput-chart" aria-label={label}>
      {items.map((item) => (
        <div className="throughput-column" key={item.id}>
          <strong>{item.value}</strong>
          <div className="throughput-track" aria-hidden="true">
            <span style={{ height: `${(item.value / maximum) * 100}%` }} />
          </div>
          <small>{item.label}</small>
        </div>
      ))}
    </div>
  );
}
