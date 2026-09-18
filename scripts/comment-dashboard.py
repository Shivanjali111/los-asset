from pathlib import Path

src = Path(__file__).resolve().parents[1] / 'src'
headers = {
 'pages/Dashboard/DashboardPage.jsx': [
  'DASHBOARD ENTRY POINT: start reading the dashboard here.',
  'App.jsx renders DashboardPage and supplies leads, onCreateLead and onLogout.',
  'DashboardPage places ThemeProvider above Dashboard so useTheme can read the bank configuration.',
  'Dashboard calls hooks for data/actions, then passes their results to UI components as props.',
  'Props are inputs from a parent; callbacks such as onSubmit let a child request a parent action.',
  'Screen flow: AppShell -> Sidebar + PageHeader + hero/cards/register/insights + optional Drawer.',
  'Data flow: component -> hook -> service -> repository -> JSON or shared API client.',
 ],
 'app/providers/ThemeProvider.jsx': [
  'SHARED THEME CONTEXT: makes one tenant configuration available to descendant components.',
  'DashboardPage wraps Dashboard in this provider; Dashboard reads it with useTheme().',
  'Context avoids passing the same configuration through every intermediate component.',
  'The provider shares data only. AppShell receives style from useTheme and applies the CSS variables.',
  'An explicit tenant prop overrides the configured default; tenant selection is not authorization.',
 ],
 'config/tenants/yesBank.js': [
  'TENANT BRAND SETTINGS: edit this file to change bank/application names and logo assets.',
  'resolveTenant selects this object -> ThemeProvider shares it -> Dashboard passes brand to UI.',
  'BrandLogo uses light/dark/compact image paths; CreateLeadForm uses the product display name.',
  'tokens controls appearance; locale/timeZone controls the dashboard date label.',
  'These settings are visible in the browser. Never put credentials or secrets here.',
 ],
 'config/tenants/defaultTokens.js': [
  'DESIGN TOKENS: named appearance values shared by the dashboard UI.',
  'Example: primary becomes the CSS variable --theme-primary through themeVariables().',
  'The dashboard stylesheet uses those variables for buttons, cards, charts and gradients.',
  'Change the related primary shades together when introducing a new bank palette.',
 ],
 'framework/config/tenantConfig.js': [
  'TENANT RESOLUTION: connects build configuration to ThemeProvider.',
  'Register approved tenant objects in tenants; VITE_TENANT selects an ID at build/dev-server time.',
  'themeVariables turns token names into React style properties such as --theme-primary.',
  'Defaults fill missing appearance tokens; an unknown tenant ID throws rather than impersonating another bank.',
 ],
 'shared/icons/AppIcon.jsx': [
  'CENTRAL ICON REGISTRY: all migrated dashboard SVG artwork lives in this file.',
  'Callers use <AppIcon name="plus" size={16} /> instead of copying SVG markup.',
  'name selects ICON_PATHS; size controls dimensions; className allows stylesheet styling.',
  'currentColor makes an icon inherit its parent color, so it follows the theme automatically.',
  'Icons are decorative. The surrounding button must supply visible text or an accessible label.',
 ],
 'shared/components/layout/AppShell.jsx': [
  'PAGE FRAME: used by Dashboard to place the main parts of the screen.',
  'sidebar, header and overlay are named slots: the parent passes already-composed JSX into them.',
  'children is React\'s name for content nested between <AppShell> and </AppShell>.',
  'style contains theme CSS variables; descendants, including the drawer, inherit them.',
  'This component arranges content only; it does not load records or decide permissions.',
 ],
 'shared/components/layout/Sidebar.jsx': [
  'REUSABLE SIDEBAR: composed by Dashboard inside AppShell\'s sidebar slot.',
  'brand feeds BrandLogo; items supplies navigation labels/icons; user supplies display identity.',
  'collapsed is controlled by the parent. onToggle asks that parent to change its state.',
  'onNavigate receives the clicked item; the dashboard decides whether that item has a route.',
  'children supplies optional sidebar content (currently ServiceLevelSummary).',
 ],
 'shared/components/layout/PageHeader.jsx': [
  'REUSABLE PAGE HEADING: Dashboard supplies title, eyebrow (small heading), subtitle and actions.',
  'actions is a JSX slot containing the Sign Out and Start Gold Loan buttons.',
  'This component controls layout; button behavior remains with the parent.',
 ],
 'shared/components/BrandLogo/BrandLogo.jsx': [
  'BRAND IMAGE: used in Sidebar and DashboardHero.',
  'brand comes from the tenant configuration, never a hardcoded bank name here.',
  'compact selects the small logo; surface selects a logo suitable for a light/dark background.',
  'decorative removes alternative text only where the image adds no information.',
  '...props forwards normal image attributes, such as className, to the HTML img element.',
 ],
 'shared/components/Button/Button.jsx': [
  'BUTTON PRIMITIVE: shared by the header, sidebar, table, drawer and lead form.',
  'children is the visible label/content; startIcon optionally places an icon before it.',
  'loading disables interaction and exposes a busy state; the caller supplies any loading label.',
  'Default type="button" prevents accidental form submission. Forms explicitly use type="submit".',
  '...props forwards onClick, className, aria-label and other native button attributes.',
 ],
 'shared/components/Panel/Panel.jsx': [
  'PANEL PRIMITIVE: wraps each dashboard insight with a consistent heading and content area.',
  'DashboardInsights supplies business-specific titles, descriptions and chart/timeline children.',
  'actions is an optional heading-side slot (for example the reporting-period badge).',
  'useId gives each instance a unique heading ID for accessible section labeling.',
 ],
 'shared/components/InfoCards/InfoCards.jsx': [
  'SUMMARY CARD GRID: Dashboard passes the metrics returned by mapDashboard().',
  'Each item contains id, label, value, description, icon and optional note/tone/emphasis.',
  'map() renders one card per item; key={item.id} lets React keep track of each card.',
  'Values are already prepared for display. This component does not fetch or calculate loan totals.',
 ],
 'shared/components/DataTable/DataTable.jsx': [
  'GENERIC TABLE: ProcessingRegister supplies business-specific columns and records.',
  'columns: [{ id, label, render? }]. A render(row) function customizes a cell, such as a record link.',
  'Without render, the cell displays row[column.id]. rowKey identifies each row, defaulting to id.',
  'loading/error/empty states share EmptyState; onRetry is a callback supplied by the data hook.',
  'The table renders supplied rows only; it does not fetch, filter or paginate records itself.',
 ],
 'shared/components/StatusBadge/StatusBadge.jsx': [
  'DISPLAY BADGE: ProcessingRegister supplies the status text and a CSS variant.',
  'children is the label; variant selects styling; className allows another badge layout.',
  'This component does not define valid loan statuses or change workflow state.',
 ],
 'shared/components/EmptyState/EmptyState.jsx': [
  'SHARED FEEDBACK: used by the dashboard, table and charts when content cannot be displayed.',
  'message is user-facing text; error chooses an alert role; onRetry optionally adds a Retry button.',
  'Retry calls the supplied function. This component knows nothing about the underlying API.',
 ],
 'shared/components/Charts/DistributionCharts.jsx': [
  'DISPLAY-ONLY CHARTS: DashboardInsights passes numeric series to these shared components.',
  'SourceBars and DonutChart accept items with stable id, label and count fields.',
  'ColumnChart accepts id, label and value fields. Icon/color names select shared theme resources.',
  'Visual dimensions are computed from the supplied values; no chart loads or owns business data.',
 ],
 'shared/components/Timeline/Timeline.jsx': [
  'ACTIVITY LIST: RecentActivityPanel supplies items from the dashboard model.',
  'Each item has id, title, subtitle, time and icon. id gives React a stable list key.',
  'time is already display text; this component does not maintain a live clock or create audit events.',
 ],
 'shared/components/Modal/Drawer.jsx': [
  'ACCESSIBLE SIDE DIALOG: Dashboard mounts this only while create.open is true.',
  'title/eyebrow/description provide the header; children contains CreateLeadForm.',
  'onClose asks the parent to remove the drawer. busy blocks dismissal while a save is pending.',
  'Refs point to the DOM panel and latest callback without triggering a React render.',
  'The mount effect manages keyboard focus and background interaction; its cleanup restores both.',
  'This implementation expects the drawer backdrop to be a direct child of AppShell.',
 ],
 'shared/components/Input/Input.jsx': [
  'LABELED INPUT: CreateLeadForm passes name, value, onChange and validation attributes.',
  'This is a controlled input: its displayed value comes from the parent\'s form state.',
  'Typing calls onChange; useCreateLead updates that state and React renders the new value.',
  'useId connects the label to this specific input; prefix adds text such as a country code.',
  'Browser constraints help input feedback, but backend validation is still required.',
 ],
 'shared/components/FieldGrid/FieldGrid.jsx': [
  'FORM LAYOUT: CreateLeadForm nests Input components inside this wrapper.',
  'children contains those fields; CSS arranges two columns and stacks them on small screens.',
  'It controls layout only, not field values or validation.',
 ],
 'shared/components/FormSection/FormSection.jsx': [
  'FORM SECTION: CreateLeadForm uses this for customer details and enquiry source.',
  'number, title and description describe the section; children contains its fields/content.',
  'It is reusable because the caller supplies all business wording and form controls.',
 ],
 'features/dashboard/components/DashboardHero.jsx': [
  'DASHBOARD BANNER: Dashboard passes brand, branch, summary, snapshot and configured content.',
  'summary supplies the SLA duration; snapshot supplies counts; content supplies copy and journey stages.',
  'BrandLogo uses the tenant asset even in the decorative artwork.',
  'Fragment groups a stage and its separator without adding an extra HTML wrapper.',
 ],
 'features/dashboard/components/ServiceLevelSummary.jsx': [
  'SIDEBAR BUSINESS SUMMARY: Dashboard passes this as Sidebar children.',
  'summary is the same overview data used by the main cards, keeping displayed values aligned.',
  'This component presents SLA/attention information; it does not calculate operational policy.',
 ],
 'features/dashboard/components/DashboardInsights.jsx': [
  'DASHBOARD INSIGHT COMPOSITIONS: Dashboard renders these five panels.',
  'This feature layer owns loan-specific wording. Shared Panel/Charts/Timeline own reusable UI.',
  'Each exported component receives its slice of the dashboard model as props.',
  'No component in this file imports JSON or makes a network request.',
 ],
 'features/dashboard/hooks/useDashboard.js': [
  'DASHBOARD DATA HOOK: called by Dashboard, not by each individual card/chart.',
  'A custom hook is a reusable function that uses React hooks and starts with use.',
  'Delegates request state to useAsyncResource and data access to dashboardService.',
  'Returns data, loading, error and retry for the page to render the appropriate UI.',
 ],
 'features/dashboard/services/dashboardService.js': [
  'DASHBOARD SERVICE: useDashboard calls getOverview().',
  'The repository supplies a response; mapDashboard converts it into the model the UI expects.',
  'createDashboardService accepts a repository so another implementation can be plugged in later.',
  'The current binding is explicitly mock data. It does not fetch real dashboard aggregates.',
 ],
 'features/dashboard/repositories/mockDashboardRepository.js': [
  'MOCK DATA ACCESS: the only dashboard module that imports the dashboard JSON fixture.',
  'dashboardService calls getOverview(); the Promise shape matches a future API repository.',
  'structuredClone returns a fresh copy so consumers cannot accidentally modify the shared fixture.',
  'Replacing this repository should not require changing the visual components.',
 ],
 'features/dashboard/mappers/mapDashboard.js': [
  'DASHBOARD RESPONSE MAPPER: called by dashboardService after reading the repository.',
  'A DTO is the response shape; the frontend model is the shape our components consume.',
  'This checks required sections and adds formatted metric-card definitions for InfoCards.',
  'Formatting amounts/percentages here is presentation work, not authoritative backend calculation.',
 ],
 'features/dashboard/models/dashboardConfig.js': [
  'DASHBOARD DISPLAY CONFIGURATION: read by Dashboard and passed to Sidebar/DashboardHero.',
  'Contains headings, navigation icons and journey labels, rather than operational metric values.',
  'Only navigation entries with a path can navigate; other destinations remain existing placeholders.',
  'Bank logos/colors belong in config/tenants, not in this feature configuration.',
 ],
 'features/lead/components/ProcessingRegister.jsx': [
  'LEAD TABLE COMPOSITION: Dashboard supplies selectedView, rows, request state and callbacks.',
  'This feature defines loan-specific columns and uses the generic DataTable to render them.',
  'Changing the selector calls onViewChange -> Dashboard updates state -> useLeadRegister selects rows.',
  'Clicking a reference calls onOpenLead(id); Dashboard owns navigation to onboarding.',
  'onExport is optional; the button stays disabled until an export implementation is supplied.',
 ],
 'features/lead/components/CreateLeadForm.jsx': [
  'CONTROLLED LEAD FORM: Dashboard places this inside the shared Drawer.',
  'values/error/submitting come from useCreateLead; onChange/onSubmit/onCancel are its callbacks.',
  'Input and layout primitives render the fields. The form itself never calls an API.',
  'brand provides the tenant product name; content provides configured labels.',
  'The fieldset disables all fields during submission; an error leaves entered values available.',
 ],
 'features/lead/hooks/useLeadRegister.js': [
  'REGISTER DATA HOOK: called by Dashboard whenever the selected view changes.',
  'Loads today\'s records through leadService and returns rows/loading/error/retry to ProcessingRegister.',
  'Compatibility behavior: other views still filter legacyLeads supplied by App, not the live API.',
  'This intentional POC split is a future backend migration task, not a fallback on API failure.',
 ],
 'features/lead/hooks/useCreateLead.js': [
  'CREATE-LEAD INTERACTION: called by Dashboard and connected to Drawer/CreateLeadForm.',
  'useState stores values that affect rendering: open, values, submitting and error.',
  'Flow: show -> change fields -> submit -> leadService.create -> onCreated -> page navigation.',
  'onCreated is supplied by Dashboard so this hook does not need to know application routes.',
  'pending is a ref used as an immediate repeat-click guard; backend idempotency is a separate concern.',
 ],
 'features/lead/services/leadService.js': [
  'LEAD USE CASES: called by useLeadRegister and useCreateLead.',
  'Delegates network access to apiLeadRepository, applies current form defaults and prepares new records.',
  'filterLeads handles the existing display filters; it does not enforce backend workflow rules.',
  'This frontend service cannot authorize users or validate financial decisions on the server\'s behalf.',
 ],
 'features/lead/repositories/apiLeadRepository.js': [
  'LIVE LEAD DATA ACCESS: leadService calls these methods instead of using fetch directly.',
  'getToday -> apiClient.get -> mapLead for each record -> frontend rows.',
  'create -> apiClient.post -> validate that the server returned a lead reference.',
  'Endpoints and HTTP behavior are centralized under framework/api.',
 ],
 'features/lead/repositories/mockLeadRepository.js': [
  'LEGACY LEAD FIXTURE ACCESS: App uses getSnapshot() to initialize its existing lead state.',
  'These records feed non-today dashboard views during the incremental migration.',
  'A fresh copy avoids mutating the imported JSON. This is not the live today-leads repository.',
 ],
 'features/lead/mappers/mapLead.js': [
  'LEAD RESPONSE MAPPER: apiLeadRepository uses this before records reach the UI.',
  'Converts backend names such as first_name/leadnumber into frontend firstName/id.',
  'Keeping the mapping here avoids scattering backend field assumptions through table components.',
  'Missing optional values use the existing POC defaults in leadConfig.',
 ],
 'features/lead/models/leadConfig.js': [
  'LEAD FEATURE CONFIGURATION: form defaults, view labels, status groups and drawer wording.',
  'Read by the hooks/service/register so React components do not each define business option arrays.',
  'These are current POC conventions, not a replacement for server-owned product and workflow policy.',
 ],
 'shared/hooks/useAsyncResource.js': [
  'ASYNC REQUEST LIFECYCLE: reused by dashboard, lead-register and user-display hooks.',
  'load is a stable function returning a Promise; it may accept an AbortSignal to cancel HTTP work.',
  'useEffect runs the request after rendering; useState publishes the result back to the caller.',
  'Cleanup prevents an old request from updating a component that unmounted or requested newer data.',
  'retry changes a counter to rerun the effect. This is not a shared query cache or polling system.',
 ],
 'framework/auth/useUserDisplay.js': [
  'DISPLAY IDENTITY HOOK: Dashboard calls this to populate Sidebar\'s user prop.',
  'Reads the existing Amplify session -> maps the email to a compatibility display label.',
  'Returns the default label while loading or when the session cannot be read.',
  'App still owns authentication and route protection; this hook only supplies display text.',
 ],
 'framework/auth/userDisplay.js': [
  'LEGACY USER DISPLAY ALIASES: used by useUserDisplay after reading the Cognito session.',
  'Centralizes the pre-existing POC name mappings outside React components.',
  'A display label such as Appraiser grants no permission; backend authorization must be independent.',
 ],
 'framework/api/apiClient.js': [
  'SHARED HTTP CLIENT: API repositories call get/post; components never call this directly.',
  'Flow: build request -> fetch -> parse JSON -> normalize errors -> return response data.',
  'Handles cancellation, timeout and cleanup once instead of repeating them in every feature.',
  'Callers can supply headers; this migration retains existing endpoint authentication behavior.',
  'It does not automatically attach Cognito tokens or retry writes. See dashboard-refactor.md.',
 ],
 'framework/api/apiError.js': [
  'NORMALIZED REQUEST ERROR: apiClient throws this when an API/network operation fails.',
  'Extends JavaScript Error with status, code and optional requestId for consistent handling.',
  'Hooks currently display the message; code/status can support richer central handling later.',
 ],
 'framework/api/endpoints.js': [
  'API ADDRESS CONFIGURATION: apiLeadRepository reads these URLs.',
  'VITE_* environment values override the existing endpoint defaults at build/dev-server time.',
  'Restart Vite after changing environment configuration. These values are public browser settings.',
 ],
 'App.jsx': [
  'EXISTING APPLICATION ROOT: starts session restoration and defines the current routes.',
  'Dashboard migration touchpoints: imports pages/Dashboard and initializes legacy leads via a repository.',
  'Passes leads/onCreateLead/onLogout into DashboardPage; successful creation updates this lead list.',
  'Other routes and existing authentication behavior are retained during the incremental refactor.',
 ],
 'pages/DashboardPage.jsx': [
  'COMPATIBILITY EXPORT: older imports of pages/DashboardPage still resolve to the new page.',
  'The actual composition and data-hook wiring now live in pages/Dashboard/DashboardPage.jsx.',
 ],
}

for relative, lines in headers.items():
    file = src / relative
    source = file.read_text(encoding='utf-8-sig')
    comment = '/**\n' + '\n'.join(' * ' + line for line in lines) + '\n */\n'
    file.write_text(comment + source, encoding='utf-8')

def annotate(relative, anchor, comment):
    file = src / relative
    source = file.read_text(encoding='utf-8')
    if source.count(anchor) != 1:
        raise RuntimeError(f'Expected unique anchor in {relative}: {anchor}')
    file.write_text(source.replace(anchor, comment + anchor), encoding='utf-8')

annotate('pages/Dashboard/DashboardPage.jsx', '  const [collapsed,', '  // Local UI state: calling a setter asks React to render this component again.\n')
annotate('pages/Dashboard/DashboardPage.jsx', '  const overview =', '  // Data hooks own request state; the page connects their output to visual components below.\n')
annotate('pages/Dashboard/DashboardPage.jsx', '  const create =', '  // This callback runs only after the creation service returns a lead reference.\n')
annotate('pages/Dashboard/DashboardPage.jsx', '  async function signOut()', '  // Delegate session removal to App, then replace the current browser-history entry with login.\n')
annotate('pages/Dashboard/DashboardPage.jsx', '  const data = overview.data;', '  // AppShell receives named JSX slots; nested JSX becomes its children (the main content).\n')
annotate('pages/Dashboard/DashboardPage.jsx', '      {overview.loading ?', '      {/* Render one overview state: loading, failure with retry, or the supplied data. */}\n')
annotate('pages/Dashboard/DashboardPage.jsx', '      <section className="dashboard-first-row">', '      {/* The register loads independently: a metrics error should not hide the loan table. */}\n')
annotate('pages/Dashboard/DashboardPage.jsx', 'export default function DashboardPage(', '// Keep the provider above Dashboard: a component cannot read a context it only creates below itself.\n')
annotate('shared/components/Charts/DistributionCharts.jsx', 'export function SourceBars(', '// Labels show a share of the total; bar widths compare each category with the largest one.\n')
annotate('shared/components/Charts/DistributionCharts.jsx', 'export function DonutChart(', '// Each count becomes a percentage arc; the same items drive the legend so it stays consistent.\n')
annotate('shared/components/Charts/DistributionCharts.jsx', 'export function ColumnChart(', '// Add a little headroom above the largest value so columns do not fill the whole track.\n')
for fn, description in [
 ('SourceMixPanel','Wrap category counts in a shared Panel and SourceBars.'),
 ('LoanTypeMixPanel','Wrap fresh/renewal counts in a Panel and DonutChart.'),
 ('ProcessingTrendPanel','Derive the period badge total from the same items plotted by ColumnChart.'),
 ('ActionWatchlist','Render backend/fixture-provided attention counts; do not recalculate risk here.'),
 ('RecentActivityPanel','Provide loan-specific headings while Timeline handles the list layout.'),
]: annotate('features/dashboard/components/DashboardInsights.jsx', 'export function ' + fn + '(', '// ' + description + '\n')
annotate('shared/components/Modal/Drawer.jsx', '  const latest =', '  // Keep the current busy flag/callback available to the one-time keyboard listener.\n')
annotate('shared/components/Modal/Drawer.jsx', '    const previouslyFocused =', '    // Remember the opener and temporarily make sibling screen regions non-interactive.\n')
annotate('shared/components/Modal/Drawer.jsx', '      const focusable =', '      // Wrap Tab/Shift+Tab within visible enabled controls instead of letting focus escape.\n')
annotate('shared/components/Modal/Drawer.jsx', '    return () => {', '    // Effect cleanup runs on unmount (and during React development checks).\n')
annotate('features/lead/hooks/useCreateLead.js', '  function show()', '  // Opening a new request resets prior inputs and errors.\n')
annotate('features/lead/hooks/useCreateLead.js', '  const pending =', '  // A ref changes immediately without rerendering; state updates can be batched by React.\n')
annotate('features/lead/hooks/useCreateLead.js', '    event.preventDefault();', '    // Stop the browser from submitting/reloading the page; this hook performs the async save.\n')
annotate('features/lead/hooks/useCreateLead.js', '      onCreated(lead);', '      // Hand the saved record back to the page; it updates App state and chooses the next route.\n')
annotate('features/lead/hooks/useCreateLead.js', '    const { name, value } = event.target;', '    // Input name matches a key in values. Copy the object instead of mutating React state.\n')
annotate('shared/hooks/useAsyncResource.js', '    const controller =', '    // One controller belongs to this request attempt; cleanup cancels that specific attempt.\n')
annotate('shared/hooks/useAsyncResource.js', '    return () => {', '    // Ignore late results even when a mock/custom loader does not use the abort signal.\n')
annotate('shared/hooks/useAsyncResource.js', '  const retry =', '  // useCallback keeps the retry function stable; changing attempt triggers the effect again.\n')
annotate('shared/components/InfoCards/InfoCards.jsx', '      {items.map(', '      {/* Stable IDs identify cards across renders; labels/values are supplied by the mapper. */}\n')
annotate('shared/components/DataTable/DataTable.jsx', '  return (', '  // Column render callbacks allow rich cells while keeping this table independent of loans.\n')
annotate('features/lead/components/ProcessingRegister.jsx', '  const columns =', '  // These definitions connect generic table cells to lead fields and parent-owned actions.\n')
annotate('features/lead/components/CreateLeadForm.jsx', '      <fieldset', '      {/* Native fieldset disabling applies to every nested field while the request is pending. */}\n')
annotate('framework/api/apiClient.js', '    const text = await response.text();', '    // Read once, then parse centrally; callers receive data rather than a raw fetch Response.\n')
annotate('framework/api/apiClient.js', '    if (!response.ok || data?.success === false)', '    // Both HTTP failures and an explicit API business-failure flag are treated as errors.\n')
annotate('framework/api/apiClient.js', '    clearTimeout(timer);', '    // Always release timers/listeners after success, failure or cancellation.\n')

for relative, lines in {
 'styles/dashboard.css': [
  'DASHBOARD STYLE BOUNDARY',
  'ThemeProvider -> useTheme.style -> AppShell defines --theme-* CSS variables.',
  'The aliases below keep existing --los-* selectors compatible with those theme tokens.',
  'Rules are scoped to .dashboard-page so they do not restyle other LOS pages.',
  'Component className values connect JSX to these selectors; media queries handle smaller screens.',
  'Change colors in config/tenants/defaultTokens.js rather than adding bank-specific literals here.',
 ],
 'pages/DashboardPage.css': [
  'Compatibility stylesheet: older imports forward to the scoped dashboard styles.',
  'The new Dashboard page imports styles/dashboard.css directly.',
 ],
}.items():
    file = src / relative
    file.write_text('/*\n' + '\n'.join(' * ' + line for line in lines) + '\n */\n' + file.read_text(encoding='utf-8-sig'), encoding='utf-8')

print(f'Added explanatory headers to {len(headers)} JavaScript/JSX files, plus inline flow comments and CSS guidance.')
