/**
 * LEAD RESPONSE MAPPER: apiLeadRepository uses this before records reach the UI.
 * Converts backend names such as first_name/leadnumber into frontend firstName/id.
 * Keeping the mapping here avoids scattering backend field assumptions through table components.
 * Missing optional values use the existing POC defaults in leadConfig.
 */
import { leadConfig } from "../models/leadConfig";

export function mapLead(lead) {
  return {
    id: lead.leadnumber,
    firstName: lead.first_name,
    lastName: lead.last_name,
    mobile: lead.mobile,
    email: lead.email,
    product: lead.product || leadConfig.defaults.product,
    loanType: lead.loan_type || lead.loanType || leadConfig.defaultType,
    status: lead.stage || leadConfig.defaultStatus,
    owner: lead.owner || leadConfig.defaultOwner,
    createdDate: new Date(lead.created_at).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  };
}
