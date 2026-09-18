/**
 * SIDEBAR BUSINESS SUMMARY: Dashboard passes this as Sidebar children.
 * summary is the same overview data used by the main cards, keeping displayed values aligned.
 * This component presents SLA/attention information; it does not calculate operational policy.
 */
export default function ServiceLevelSummary({ summary }) {
  return (
    <div className="sidebar-insight-card">
      <span>{summary.slaMinutes}-Minute Service</span>
      <strong>{summary.withinSlaPercent}% completed within SLA</strong>
      <p>
        {summary.attentionCount} active cases need attention to protect branch
        turnaround time.
      </p>
    </div>
  );
}
