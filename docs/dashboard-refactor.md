# Dashboard UI architecture

## Scope

The dashboard is the first screen migrated to the agreed `app / pages / features / shared / framework / config / data` structure. The current YES BANK layout, Cognito user display, existing lead APIs and onboarding navigation are retained. Other LOS pages are not migrated by this change.

`src/pages/Dashboard/DashboardPage.jsx` composes the page. The old `pages/DashboardPage.jsx` and `.css` are compatibility entry points.

## Branding and theme configuration

| Change                                                                      | File                                               |
| --------------------------------------------------------------------------- | -------------------------------------------------- |
| Bank name, application name, tagline, product label, expanded/compact logos | `src/config/tenants/yesBank.js`                    |
| Palette, surfaces, status colors, typography, card radius                   | `src/config/tenants/defaultTokens.js`              |
| Tenant registration and build-time selection                                | `src/framework/config/tenantConfig.js`             |
| Theme context                                                               | `src/app/providers/ThemeProvider.jsx`              |
| Dashboard heading, navigation icons, hero content and journey stages        | `src/features/dashboard/models/dashboardConfig.js` |
| Centralized SVG registry                                                    | `src/shared/icons/AppIcon.jsx`                     |

`VITE_TENANT=yes-bank` selects the current configuration. Omitting it preserves YES BANK. Unknown values fail explicitly rather than showing another bank's branding. Environment changes require restarting Vite. Only YES BANK assets are supplied; no HDFC logo/configuration is fabricated.

To add a tenant, create its configuration, register its ID in `tenantConfig.js`, and set `VITE_TENANT` for that build. A tenant supplies `brand`, `locale`, `timeZone` and `tokens`. Token overrides merge with the defaults. Override the complete primary palette for consistent gradients, tints and shadows. Never put credentials in Vite configuration: it is public browser data.

The provider exposes semantic CSS custom properties on the dashboard shell. All dashboard colors (including gradient stops, borders, decorative artwork, chart colors, hover states and translucent shadows) use tokens. The brand logo component selects the configured image for dark/light surfaces or compact navigation. No dashboard component contains a bank name or logo path.

Dashboard CSS is scoped to `.dashboard-page`, including media queries. This prevents these rules from changing other screens and protects the dashboard from existing global selectors. The old `--los-*` names remain scoped aliases during migration. The shell's structural class name is retained for visual compatibility.

## Component inventory

### Shared UI (no business-service dependencies)

| Component                           | Responsibility                                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------------- |
| `AppShell`                          | Sidebar, header, content and overlay slots; theme-variable boundary                         |
| `Sidebar`                           | Configured brand, navigation items, user display, collapse callback, information slot       |
| `PageHeader`                        | Heading, subtitle and action slots                                                          |
| `BrandLogo`                         | Configured surface/compact logo and accessible alternative text                             |
| `Button`                            | Consistent native button semantics, optional icon, disabled/loading state                   |
| `Input`, `FieldGrid`, `FormSection` | Accessible labels, controlled fields, consistent form layout and section headings           |
| `AppIcon`                           | Central SVG name registry; decorative icons hidden from assistive technology                |
| `InfoCards`                         | Data-driven summary tiles                                                                   |
| `Panel`                             | Heading, description, actions and content slots                                             |
| `DataTable`                         | Column definitions, stable row IDs, loading/error/empty states                              |
| `StatusBadge`                       | Display-only status styling                                                                 |
| `SourceBars`                        | Category counts, share labels and bars relative to the largest category                     |
| `DonutChart`                        | Slices and legend calculated from the same counts; handles empty totals                     |
| `ColumnChart`                       | Count-based scale and visible values                                                        |
| `Timeline`                          | Activity item presentation                                                                  |
| `EmptyState`                        | Status/error messages and optional retry action                                             |
| `Drawer`                            | Modal semantics, focus trap, Escape/backdrop dismissal, focus restoration, inert background |

Shared styles currently ship through `src/styles/dashboard.css`. Reuse these primitives within `AppShell` and `ThemeProvider`, importing that stylesheet, until the next page migration separates the remaining legacy class names/styles. Shared components accept business content through props, never import feature modules or fixtures, and do not call APIs.

### Feature composition

- Dashboard: `DashboardHero`, `ServiceLevelSummary`, `SourceMixPanel`, `LoanTypeMixPanel`, `ProcessingTrendPanel`, `ActionWatchlist`, `RecentActivityPanel`.
- Lead: `ProcessingRegister`, `CreateLeadForm`.
- Hooks: `useDashboard`, `useLeadRegister`, `useCreateLead`; shared asynchronous request lifecycle in `useAsyncResource`.

`CreateLeadForm` receives values, changes, submission status and callbacks. The drawer prevents closing/editing during submission. Failed submissions retain input. Export has no existing implementation, so its button is explicitly disabled; sidebar destinations without existing routes remain placeholders.

## Data boundary

```text
Page / feature component
  -> hook
  -> feature service
  -> repository
       -> mock JSON OR framework API client
  -> mapper / frontend model
```

| Section                                                | Current source after refactor                                                                |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Metrics, branch, snapshot, charts, watchlist, activity | `data/mock/dashboard.json` via mock dashboard repository and service                         |
| Today's register                                       | Existing AWS `/prod/leads/today` endpoint via API repository                                 |
| Create lead                                            | Existing AWS `/create-lead` endpoint via API repository                                      |
| Other register list views                              | Existing App-held legacy leads, initialized from `data/mock/leads.json` through a repository |
| Logged-in display                                      | Existing Amplify session and compatibility display aliases                                   |

The metrics are **still demo data**, not newly implemented backend aggregates. Labels such as live operations are retained from the POC. The August reporting period and example activity times are fixture values. No silent API-to-mock fallback is used.

`createDashboardService(repository)` accepts a repository with asynchronous `getOverview(options)`. Replace the explicit mock binding with an API repository when the summary endpoint is available. Adapt its response to the current DTO/model before returning it. React components do not change. Use `dashboard.json` as a contract example, not as a proposed database schema.

The table's data source split is intentionally retained for this UI migration. A later backend change should make all list views query the same authorized register, with server-side pagination, sorting and filters.

## API behavior

`framework/api/apiClient.js` centralizes serialization, response parsing, timeout, cancellation and normalized errors. `endpoints.js` supports `VITE_TODAY_LEADS_URL` and `VITE_CREATE_LEAD_URL`, retaining existing URLs as defaults.

The deployed APIs' existing header/authentication behavior is preserved. This work does not establish backend authorization, tenant isolation, token policies, correlation propagation or idempotency. Those require the backend/API contract migration. POST creation is not automatically retried. Unknown or invalid creation responses do not navigate to an undefined lead ID.

Request cancellation/cleanup avoids late response state updates. This small UI migration uses a shared async hook, not a full query cache. Query caching/deduplication and session-wide cache invalidation remain future framework work.

## State and security boundaries

- Filter, collapse and drawer state remain local, preserving current refresh behavior.
- Cognito restoration/sign-out remains owned by the existing App. The dashboard delegates logout and does not claim to fix App-level sign-out failure semantics.
- User-display aliases are retained only for display; they are not permission checks.
- Brand/tenant selection is presentation configuration, never authorization.
- The business workflow and backend calculations are not changed.

## Verification

- Production Vite build passed (existing large-bundle warning remains).
- ESLint passed for new dashboard, shared UI, feature, framework and tenant modules.
- Existing `App.jsx` auth code still has an unused catch variable and the `react-hooks/set-state-in-effect` diagnostic; these are outside the dashboard refactor.
- Headless Chromium checks used intercepted AWS requests: desktop (1920x1080), mobile (390x844), cards/charts, alternate colors, sidebar collapse, empty filter view, drawer focus trap/restoration/Escape, mocked lead creation/navigation, error/retry and no runtime errors.
- Checks loaded legacy page styles to exercise CSS conflicts. No real lead was created and live Cognito sign-in was not end-to-end tested.

Run locally with `npm.cmd run dev` from `los-asset` and sign in normally to review the dashboard with your environment's live register.
