/**
 * LEAD USE CASES: called by useLeadRegister and useCreateLead.
 * Delegates network access to apiLeadRepository, applies current form defaults and prepares new records.
 * filterLeads handles the existing display filters; it does not enforce backend workflow rules.
 * This frontend service cannot authorize users or validate financial decisions on the server's behalf.
 */
import { apiLeadRepository } from "../repositories/apiLeadRepository";
import { leadConfig } from "../models/leadConfig";

export const leadService = {
  getToday: (options) => apiLeadRepository.getToday(options),
  async create(values) {
    const input = { ...values, source: leadConfig.defaults.source };
    const result = await apiLeadRepository.create(input);
    return {
      ...input,
      ...result,
      id: result.leadnumber,
      status: result.status || leadConfig.defaultStatus,
      owner: result.owner || leadConfig.defaultOwner,
      createdDate: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };
  },
};

export function filterLeads(leads, view) {
  return leads.filter((lead) => {
    if (view === "Fresh Loans")
      return (lead.loanType || leadConfig.defaultType) === "Fresh";
    if (view === "Renewals") return lead.loanType === "Renewal";
    if (view === "Completed")
      return leadConfig.completedStatuses.includes(lead.status);
    if (view === "Needs Attention")
      return leadConfig.attentionStatuses.includes(lead.status);
    return true;
  });
}
