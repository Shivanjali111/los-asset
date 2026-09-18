# Reading the dashboard code: a beginner's guide

All paths below are relative to `src/`. Each migrated JavaScript/JSX file now has a header explaining its role and connections. More complex files also have inline comments. The comments describe current behavior, including the remaining mock data.

## React terms used in the comments

| Term | Meaning in this dashboard |
| --- | --- |
| Component | A function that returns UI, such as `InfoCards`. |
| JSX | HTML-like syntax inside JavaScript, such as `<InfoCards items={data.metrics} />`. |
| Props | Inputs supplied by a parent. Here `items` is an input to `InfoCards`. |
| State / `useState` | A value React remembers between renders. Changing it requests a new render, such as opening a drawer. |
| Render | React calls components to work out what the screen should display. It does not mean the browser reloads the whole page. |
| Callback | A function passed to another component. A child calls it to ask the parent to do something. |
| `children` | Content nested between a component's opening and closing tags. |
| Hook | A function beginning with `use` that organizes React state or behavior. |
| Effect / `useEffect` | Work performed after rendering, such as starting a request or registering a keyboard listener. |
| Cleanup | The function returned by an effect to undo its work, such as removing that listener. |
| Ref / `useRef` | A stored reference that can change without asking React to render again; useful for DOM elements and immediate request guards. |
| Context | Shared information available to descendants of a provider, such as the selected bank's theme. |
| Service | A function/module that coordinates a feature operation. It is not a React component. |
| Repository | The data-access boundary: reads a fixture or calls an API. |
| Mapper | Translates data into the shape the UI expects. |

## Suggested reading order

1. **`pages/Dashboard/DashboardPage.jsx`** — see which components are on the page and how props connect them.
2. **`shared/components/layout/AppShell.jsx`** — see how sidebar, header, main content and overlay slots are arranged.
3. **`app/providers/ThemeProvider.jsx`** and **`config/tenants/yesBank.js`** — understand where the brand comes from.
4. **`shared/components/InfoCards/InfoCards.jsx`** — a small example of rendering a list from props.
5. **`features/dashboard/hooks/useDashboard.js`** — follow the dashboard's data request.
6. **`features/dashboard/services/dashboardService.js`**, its repository and mapper — follow the request to the fixture and back.
7. **`features/lead/components/ProcessingRegister.jsx`** — see a business feature configure a reusable table.
8. **`features/lead/hooks/useCreateLead.js`** and **`features/lead/components/CreateLeadForm.jsx`** — follow input state and submission callbacks.
9. **`shared/components/Modal/Drawer.jsx`** — read the more advanced keyboard/focus behavior last.

## Flow 1: displaying the tiles

```text
Dashboard calls useDashboard()
  -> useAsyncResource calls dashboardService.getOverview()
  -> mockDashboardRepository reads dashboard.json
  -> mapDashboard prepares the display model and metric definitions
  -> the hook updates its data state
  -> React renders Dashboard again
  -> Dashboard passes data.metrics to InfoCards
  -> InfoCards renders one tile per item
```

The tile component never imports JSON or calls AWS. The metrics still come from the explicit mock repository. Today's loan register uses the existing AWS API through a different repository.

## Flow 2: changing a filter

```text
User selects a view in ProcessingRegister
  -> onViewChange calls Dashboard's setSelectedView
  -> Dashboard renders with the new selectedView
  -> useLeadRegister chooses and filters the records
  -> Dashboard passes rows to ProcessingRegister
  -> DataTable displays them
```

Current POC behavior: today's view uses API data; other views use the legacy App-held lead list. Changing the filter does not make every view a new backend query.

## Flow 3: creating a lead

```text
Start Gold Loan button calls create.show()
  -> useCreateLead sets open = true and resets form state
  -> Dashboard mounts Drawer with CreateLeadForm inside it
  -> typing in Input calls onChange
  -> useCreateLead.change updates values
  -> updated values flow back into the inputs as props
  -> Submit calls useCreateLead.submit
  -> leadService -> apiLeadRepository -> apiClient -> existing AWS endpoint
  -> successful response invokes the page's onCreated callback
  -> App updates its lead list and Dashboard navigates to onboarding
```

If submission fails, the hook stores an error and keeps the entered values. The form displays the error. The shared Button, Input and Drawer do not know which AWS endpoint was used.

## Flow 4: applying branding

```text
VITE_TENANT selects a registered tenant configuration
  -> ThemeProvider shares that configuration
  -> Dashboard reads it using useTheme()
  -> brand is passed to Sidebar, DashboardHero and CreateLeadForm
  -> style is passed to AppShell as CSS variables
  -> descendants inherit theme colors and typography
```

For example, `primary` becomes `--theme-primary`. Styles use `var(--theme-primary)` instead of repeating a bank-specific color. The logo paths are selected by `BrandLogo`.

## Why the separate folders matter

- **Page:** connects the screen together.
- **Feature:** understands the loan/dashboard-specific presentation and operation.
- **Shared UI:** displays inputs supplied through props, without depending on a loan feature.
- **Framework:** provides common technical behavior such as HTTP requests and configuration resolution.
- **Data/config:** supplies fixtures and settings without embedding them inside components.

Plain JSON cannot contain comments, so mock fixture files remain valid JSON. Their purpose is explained in the repository comments and in `dashboard-refactor.md`.
