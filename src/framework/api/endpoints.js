/**
 * API ADDRESS CONFIGURATION: apiLeadRepository reads these URLs.
 * VITE_* environment values override the existing endpoint defaults at build/dev-server time.
 * Restart Vite after changing environment configuration. These values are public browser settings.
 */
export const endpoints = {
  todayLeads:
    import.meta.env.VITE_TODAY_LEADS_URL ||
    "https://xx8ep3p2ue.execute-api.ap-south-1.amazonaws.com/prod/leads/today",
  createLead:
    import.meta.env.VITE_CREATE_LEAD_URL ||
    "https://weaq9mioy2.execute-api.ap-south-1.amazonaws.com/create-lead",
};
