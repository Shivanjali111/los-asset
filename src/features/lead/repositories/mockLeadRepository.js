/**
 * LEGACY LEAD FIXTURE ACCESS: App uses getSnapshot() to initialize its existing lead state.
 * These records feed non-today dashboard views during the incremental migration.
 * A fresh copy avoids mutating the imported JSON. This is not the live today-leads repository.
 */
import leads from "../../../data/mock/leads.json";

export const mockLeadRepository = {
  getSnapshot() {
    return structuredClone(leads);
  },
};
