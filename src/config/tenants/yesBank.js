/**
 * TENANT BRAND SETTINGS: edit this file to change bank/application names and logo assets.
 * resolveTenant selects this object -> ThemeProvider shares it -> Dashboard passes brand to UI.
 * BrandLogo uses light/dark/compact image paths; CreateLeadForm uses the product display name.
 * tokens controls appearance; locale/timeZone controls the dashboard date label.
 * These settings are visible in the browser. Never put credentials or secrets here.
 */
import { defaultTokens } from "./defaultTokens";

export default {
  id: "yes-bank",
  brand: {
    bankName: "YES BANK",
    applicationName: "Gold Loan Portal",
    tagline: "Origination & Appraisal",
    productName: "YES BANK Gold Loan",
    logos: {
      light: "/images/yes-bank-logo-light-bg.png",
      dark: "/images/yes-bank-logo-dark-bg.png",
      compact: "/images/yes-bank-logo-icon.png",
    },
  },
  locale: "en-IN",
  timeZone: "Asia/Kolkata",
  tokens: defaultTokens,
};
