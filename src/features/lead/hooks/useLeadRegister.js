/**
 * REGISTER DATA HOOK: called by Dashboard whenever the selected view changes.
 * Loads today's records through leadService and returns rows/loading/error/retry to ProcessingRegister.
 * Compatibility behavior: other views still filter legacyLeads supplied by App, not the live API.
 * This intentional POC split is a future backend migration task, not a fallback on API failure.
 */
import useAsyncResource from "../../../shared/hooks/useAsyncResource";
import { leadService, filterLeads } from "../services/leadService";

export default function useLeadRegister(view, legacyLeads) {
  const resource = useAsyncResource(leadService.getToday);
  const today = view === "Today's Gold Loans";
  return {
    rows: filterLeads(today ? resource.data || [] : legacyLeads, view),
    loading: today && resource.loading,
    error: today ? resource.error : "",
    retry: resource.retry,
  };
}
