/**
 * LEAD FEATURE CONFIGURATION: form defaults, view labels, status groups and drawer wording.
 * Read by the hooks/service/register so React components do not each define business option arrays.
 * These are current POC conventions, not a replacement for server-owned product and workflow policy.
 */
export const leadConfig = {
  defaults: {
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
    product: "Gold Loan",
    source: "Branch Walk-in",
  },
  defaultStatus: "New",
  defaultType: "Fresh",
  defaultOwner: "Sales User",
  views: [
    "Today's Gold Loans",
    "All Gold Loans",
    "Fresh Loans",
    "Renewals",
    "Completed",
    "Needs Attention",
  ],
  completedStatuses: ["Converted", "Disbursed", "Completed"],
  attentionStatuses: ["Pending", "In Progress", "Exception"],
  create: {
    title: "Start Gold Loan",
    eyebrow: "Quick Gold Loan Processing",
    description:
      "Capture the customer's basic details and source to begin the branch journey.",
    productDescription: "Fresh loan or renewal | 15-minute service",
  },
};
