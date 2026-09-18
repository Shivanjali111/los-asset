/**
 * SHARED THEME CONTEXT: makes one tenant configuration available to descendant components.
 * DashboardPage wraps Dashboard in this provider; Dashboard reads it with useTheme().
 * Context avoids passing the same configuration through every intermediate component.
 * The provider shares data only. AppShell receives style from useTheme and applies the CSS variables.
 * An explicit tenant prop overrides the configured default; tenant selection is not authorization.
 */
import { createContext, useContext } from "react";
import {
  resolveTenant,
  themeVariables,
} from "../../framework/config/tenantConfig";

const ThemeContext = createContext(null);

export default function ThemeProvider({ tenant = resolveTenant(), children }) {
  return (
    <ThemeContext.Provider value={tenant}>{children}</ThemeContext.Provider>
  );
}

// Kept with the context so consumers cannot accidentally use a second instance.
// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const tenant = useContext(ThemeContext);
  if (!tenant) throw new Error("useTheme requires ThemeProvider");
  return { ...tenant, style: themeVariables(tenant.tokens) };
}
