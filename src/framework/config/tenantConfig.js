/**
 * TENANT RESOLUTION: connects build configuration to ThemeProvider.
 * Register approved tenant objects in tenants; VITE_TENANT selects an ID at build/dev-server time.
 * themeVariables turns token names into React style properties such as --theme-primary.
 * Defaults fill missing appearance tokens; an unknown tenant ID throws rather than impersonating another bank.
 */
import yesBank from "../../config/tenants/yesBank";
import { defaultTokens } from "../../config/tenants/defaultTokens";

// Register additional approved tenant configurations here. Never silently use
// another bank's branding for an unrecognized tenant ID.
const tenants = {
  "yes-bank": yesBank,
  yesbank: yesBank,
  YESBANK: yesBank,
  YES_BANK: yesBank,
};
export function resolveTenant(id = import.meta.env.VITE_TENANT || "yes-bank") {
  const tenant = tenants[id];
  if (!tenant) throw new Error(`Unknown tenant configuration: ${id}`);
  return tenant;
}

export function themeVariables(tokens) {
  return Object.fromEntries(
    Object.entries({ ...defaultTokens, ...tokens }).map(([key, value]) => [
      `--theme-${key}`,
      value,
    ]),
  );
}
