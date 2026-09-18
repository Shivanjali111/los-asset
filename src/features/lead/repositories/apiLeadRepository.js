/**
 * LIVE LEAD DATA ACCESS: leadService calls these methods instead of using fetch directly.
 * getToday -> apiClient.get -> mapLead for each record -> frontend rows.
 * create -> apiClient.post -> validate that the server returned a lead reference.
 * Endpoints and HTTP behavior are centralized under framework/api.
 */
import { apiClient } from "../../../framework/api/apiClient";
import { endpoints } from "../../../framework/api/endpoints";
import { mapLead } from "../mappers/mapLead";

export const apiLeadRepository = {
  async getToday(options) {
    const result = await apiClient.get(endpoints.todayLeads, options);
    if (!Array.isArray(result?.data))
      throw new Error("Unable to load today's leads.");
    return result.data.map(mapLead);
  },
  async create(values) {
    const result = await apiClient.post(endpoints.createLead, values);
    if (!result?.leadnumber)
      throw new Error(
        "The server did not return a lead reference. Check the register before trying again.",
      );
    return result;
  },
};
