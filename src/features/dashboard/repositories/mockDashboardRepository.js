/**
 * MOCK DATA ACCESS: the only dashboard module that imports the dashboard JSON fixture.
 * dashboardService calls getOverview(); the Promise shape matches a future API repository.
 * structuredClone returns a fresh copy so consumers cannot accidentally modify the shared fixture.
 * Replacing this repository should not require changing the visual components.
 */
import dashboard from "../../../data/mock/dashboard.json";

/** DashboardRepository: getOverview({ signal }?) -> Promise<dashboard DTO>. */
export const mockDashboardRepository = {
  async getOverview() {
    return structuredClone(dashboard);
  },
};
