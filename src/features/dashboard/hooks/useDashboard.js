/**
 * DASHBOARD DATA HOOK: called by Dashboard, not by each individual card/chart.
 * A custom hook is a reusable function that uses React hooks and starts with use.
 * Delegates request state to useAsyncResource and data access to dashboardService.
 * Returns data, loading, error and retry for the page to render the appropriate UI.
 */
import useAsyncResource from "../../../shared/hooks/useAsyncResource";
import { dashboardService } from "../services/dashboardService";

export default function useDashboard() {
  return useAsyncResource(dashboardService.getOverview);
}
