/**
 * DASHBOARD RESPONSE MAPPER: called by dashboardService after reading the repository.
 * A DTO is the response shape; the frontend model is the shape our components consume.
 * This checks required sections and adds formatted metric-card definitions for InfoCards.
 * Formatting amounts/percentages here is presentation work, not authoritative backend calculation.
 */
export function mapDashboard(dto) {
  if (
    !dto?.summary ||
    !dto?.branch ||
    !Array.isArray(dto.sources) ||
    !Array.isArray(dto.loanTypes) ||
    !Array.isArray(dto.snapshot) ||
    !Array.isArray(dto.watchlist) ||
    !Array.isArray(dto.activities) ||
    !Array.isArray(dto.trend?.items)
  ) {
    throw new Error("Dashboard data is unavailable. Please try again.");
  }
  return { ...dto, metrics: buildMetrics(dto.summary) };
}

function buildMetrics(s) {
  const share = (count) =>
    s.processed
      ? `${Math.round((count / s.processed) * 100)}% of today's volume`
      : "No completed loans";
  return [
    {
      id: "processed",
      label: "Total Processed Today",
      value: s.processed,
      description: "Fresh loans and renewals completed",
      note: "Live branch throughput",
      icon: "check",
      emphasis: true,
      tone: "up",
    },
    {
      id: "disbursed",
      label: "Amount Disbursed",
      value: `₹${(s.disbursedRupees / 10000000).toFixed(2)} Cr`,
      description: "Total gold-loan value processed today",
      note: `Across ${s.processed} loans`,
      icon: "rupee",
      tone: "up",
    },
    {
      id: "turnaround",
      label: "Average Turnaround",
      value: `${s.averageMinutes} min`,
      description: "Customer start to disbursement",
      note: `${s.averageMinutes <= s.slaMinutes ? "Within" : "Above"} ${s.slaMinutes}-minute SLA`,
      icon: "clock",
      tone: s.averageMinutes <= s.slaMinutes ? "up" : "neutral",
    },
    {
      id: "fresh",
      label: "Fresh Loans",
      value: s.fresh,
      description: "New gold-loan accounts processed",
      note: share(s.fresh),
      icon: "plus",
    },
    {
      id: "renewals",
      label: "Renewals",
      value: s.renewals,
      description: "Existing gold loans renewed today",
      note: share(s.renewals),
      icon: "refresh",
    },
    {
      id: "sla",
      label: "Completed Within SLA",
      value: `${s.withinSlaPercent}%`,
      description: `Processed in ${s.slaMinutes} minutes or less`,
      note: `Target >= ${s.slaTargetPercent}%`,
      icon: "sanction",
      tone: s.withinSlaPercent >= s.slaTargetPercent ? "up" : "neutral",
    },
  ];
}
