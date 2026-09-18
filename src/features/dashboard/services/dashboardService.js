/**
 * DASHBOARD SERVICE: useDashboard calls getOverview().
 * The repository supplies a response; mapDashboard converts it into the model the UI expects.
 * createDashboardService accepts a repository so another implementation can be plugged in later.
 * The current binding is explicitly mock data. It does not fetch real dashboard aggregates.
 */
import { mapDashboard } from "../mappers/mapDashboard";
import { mockDashboardRepository } from "../repositories/mockDashboardRepository";

export function createDashboardService(repository) {
  return {
    async getOverview(options) {
      return mapDashboard(await repository.getOverview(options));
    },
  };
}
// Explicit demo source. Replace the repository once the summary API is available.
// API failures must never silently become mock successes.
export const dashboardService = createDashboardService(mockDashboardRepository);
