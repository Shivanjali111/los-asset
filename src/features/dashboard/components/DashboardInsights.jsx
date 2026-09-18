/**
 * DASHBOARD INSIGHT COMPOSITIONS: Dashboard renders these five panels.
 * This feature layer owns loan-specific wording. Shared Panel/Charts/Timeline own reusable UI.
 * Each exported component receives its slice of the dashboard model as props.
 * No component in this file imports JSON or makes a network request.
 */
import Panel from "../../../shared/components/Panel/Panel";
import {
  SourceBars,
  DonutChart,
  ColumnChart,
} from "../../../shared/components/Charts/DistributionCharts";
import Timeline from "../../../shared/components/Timeline/Timeline";

// Wrap category counts in a shared Panel and SourceBars.
export function SourceMixPanel({ items }) {
  return (
    <Panel
      className="source-panel"
      eyebrow="Customer Source"
      title="Source Mix"
      description="Today's processed gold loans by source."
    >
      <SourceBars items={items} />
    </Panel>
  );
}
// Wrap fresh/renewal counts in a Panel and DonutChart.
export function LoanTypeMixPanel({ items }) {
  return (
    <Panel
      className="verification-panel"
      eyebrow="Processed Today"
      title="Loan Type Mix"
      description="Fresh sanctions compared with renewals."
    >
      <DonutChart items={items} />
    </Panel>
  );
}
// Derive the period badge total from the same items plotted by ColumnChart.
export function ProcessingTrendPanel({ trend }) {
  const total = trend.items.reduce((sum, item) => sum + item.value, 0);
  return (
    <Panel
      className="throughput-panel"
      eyebrow="Branch Throughput"
      title="Monthly Processing Trend"
      description={`Fresh loans and renewals completed during ${trend.period}.`}
      actions={
        <span className="panel-pill">
          {trend.period} | {total}
        </span>
      }
    >
      <ColumnChart
        items={trend.items}
        label="Monthly gold loans processed by week"
      />
    </Panel>
  );
}
// Render backend/fixture-provided attention counts; do not recalculate risk here.
export function ActionWatchlist({ items, slaMinutes }) {
  return (
    <Panel
      eyebrow="Today's Attention"
      title="Action Watchlist"
      description={`Only cases at risk of delaying the ${slaMinutes}-minute journey.`}
    >
      <div className="watchlist">
        {items.map((item) => (
          <div key={item.id}>
            <span>{item.label}</span>
            <strong>{String(item.value).padStart(2, "0")}</strong>
          </div>
        ))}
      </div>
    </Panel>
  );
}
// Provide loan-specific headings while Timeline handles the list layout.
export function RecentActivityPanel({ items }) {
  return (
    <Panel
      className="activity-panel"
      eyebrow="Activity Trail"
      title="Recent Activity"
      description="Latest gold loan journey updates."
    >
      <Timeline items={items} />
    </Panel>
  );
}
