/**
 * DASHBOARD DISPLAY CONFIGURATION: read by Dashboard and passed to Sidebar/DashboardHero.
 * Contains headings, navigation icons and journey labels, rather than operational metric values.
 * Only navigation entries with a path can navigate; other destinations remain existing placeholders.
 * Bank logos/colors belong in config/tenants, not in this feature configuration.
 */
export const dashboardConfig = {
  title: "Gold Loan Processing Dashboard",
  eyebrow: "Branch Lending Workspace",
  hero: {
    title: "Complete every gold loan in",
    description:
      "Track today's fresh loans and renewals, monitor appraisal and sanction turnaround, and act only on cases at risk of crossing the branch service SLA.",
    stages: [
      { id: "customer", label: "Customer" },
      { id: "appraisal", label: "Appraisal" },
      { id: "sanction", label: "Sanction" },
      { id: "disbursement", label: "Disbursement" },
    ],
  },
  navigation: [
    {
      id: "dashboard",
      icon: "dashboard",
      label: "Dashboard",
      active: true,
      path: "/dashboard",
    },
    { id: "loans", icon: "gold-loan", label: "Gold Loans" },
    { id: "appraisals", icon: "appraisal", label: "Appraisals" },
    { id: "renewals", icon: "refresh", label: "Renewals" },
    { id: "sanctions", icon: "sanction", label: "Sanctions" },
    { id: "disbursements", icon: "disbursement", label: "Disbursements" },
  ],
};
