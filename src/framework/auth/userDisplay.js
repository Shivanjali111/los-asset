/**
 * LEGACY USER DISPLAY ALIASES: used by useUserDisplay after reading the Cognito session.
 * Centralizes the pre-existing POC name mappings outside React components.
 * A display label such as Appraiser grants no permission; backend authorization must be independent.
 */
// Legacy POC display aliases only; never used for authorization.
const USER_DISPLAY_MAP = {
  "shivgaikwad@deloitte.com": {
    label: "Saransh (Branch Executive)",
    initials: "SA",
  },
  "mohikumwat@deloiite.com": {
    label: "Anant (Appraiser)",
    initials: "AN",
  },
  // Keep the correctly-spelled domain too, in case Cognito stores this version.
  "mohikumwat@deloitte.com": {
    label: "Anant (Appraiser)",
    initials: "AN",
  },
  "ychapa@deloitte.com": {
    label: "Yashwant",
    initials: "YA",
  },
};

export const DEFAULT_LOGGED_IN_USER = {
  label: "Branch Executive",
  initials: "BE",
};

export const getLoggedInUserDisplay = (email) => {
  if (!email) return DEFAULT_LOGGED_IN_USER;

  const normalizedEmail = String(email).trim().toLowerCase();
  return USER_DISPLAY_MAP[normalizedEmail] || DEFAULT_LOGGED_IN_USER;
};
