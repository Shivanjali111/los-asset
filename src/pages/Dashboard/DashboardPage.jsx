/**
 * DASHBOARD ENTRY POINT: start reading the dashboard here.
 * App.jsx renders DashboardPage and supplies leads, onCreateLead and onLogout.
 * DashboardPage places ThemeProvider above Dashboard so useTheme can read the bank configuration.
 * Dashboard calls hooks for data/actions, then passes their results to UI components as props.
 * Props are inputs from a parent; callbacks such as onSubmit let a child request a parent action.
 * Screen flow: AppShell -> Sidebar + PageHeader + hero/cards/register/insights + optional Drawer.
 * Data flow: component -> hook -> service -> repository -> JSON or shared API client.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeProvider, { useTheme } from "../../app/providers/ThemeProvider";
import useUserDisplay from "../../framework/auth/useUserDisplay";
import AppShell from "../../shared/components/layout/AppShell";
import Sidebar from "../../shared/components/layout/Sidebar";
import PageHeader from "../../shared/components/layout/PageHeader";
import Button from "../../shared/components/Button/Button";
import Drawer from "../../shared/components/Modal/Drawer";
import EmptyState from "../../shared/components/EmptyState/EmptyState";
import InfoCards from "../../shared/components/InfoCards/InfoCards";
import AppIcon from "../../shared/icons/AppIcon";
import DashboardHero from "../../features/dashboard/components/DashboardHero";
import ServiceLevelSummary from "../../features/dashboard/components/ServiceLevelSummary";
import {
  SourceMixPanel,
  LoanTypeMixPanel,
  ProcessingTrendPanel,
  ActionWatchlist,
  RecentActivityPanel,
} from "../../features/dashboard/components/DashboardInsights";
import { dashboardConfig } from "../../features/dashboard/models/dashboardConfig";
import useDashboard from "../../features/dashboard/hooks/useDashboard";
import ProcessingRegister from "../../features/lead/components/ProcessingRegister";
import CreateLeadForm from "../../features/lead/components/CreateLeadForm";
import useLeadRegister from "../../features/lead/hooks/useLeadRegister";
import useCreateLead from "../../features/lead/hooks/useCreateLead";
import { leadConfig } from "../../features/lead/models/leadConfig";
import "../../styles/dashboard.css";

function Dashboard({ leads = [], onCreateLead, onLogout }) {
  const navigate = useNavigate();
  const { brand, locale, timeZone, style } = useTheme();
  const user = useUserDisplay();
  // Local UI state: calling a setter asks React to render this component again.
  const [collapsed, setCollapsed] = useState(false);
  const [selectedView, setSelectedView] = useState(leadConfig.views[0]);
  const [logoutError, setLogoutError] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  // Data hooks own request state; the page connects their output to visual components below.
  const overview = useDashboard();
  const register = useLeadRegister(selectedView, leads);
  // This callback runs only after the creation service returns a lead reference.
  const create = useCreateLead((lead) => {
    const id = onCreateLead ? onCreateLead(lead) : lead.id;
    navigate(`/applications/${encodeURIComponent(id)}/onboarding`);
  });
  const date = new Date().toLocaleDateString(locale, {
    weekday: "long",
    day: "2-digit",
    month: "long",
    timeZone,
  });
  // Delegate session removal to App, then replace the current browser-history entry with login.
  async function signOut() {
    setSigningOut(true);
    setLogoutError("");
    try {
      await onLogout();
      navigate("/login", { replace: true });
    } catch {
      setLogoutError("Unable to sign out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  }
  // AppShell receives named JSX slots; nested JSX becomes its children (the main content).
  const data = overview.data;
  return (
    <AppShell
      style={style}
      sidebar={
        <Sidebar
          brand={brand}
          items={dashboardConfig.navigation}
          collapsed={collapsed}
          onToggle={() => setCollapsed((value) => !value)}
          onNavigate={(item) => {
            if (item.path) navigate(item.path);
          }}
          user={user}
        >
          {data && <ServiceLevelSummary summary={data.summary} />}
        </Sidebar>
      }
      header={
        <PageHeader
          title={dashboardConfig.title}
          eyebrow={dashboardConfig.eyebrow}
          subtitle={`${data?.branch.name || "Branch workspace"} | ${date}`}
          actions={
            <>
              <Button
                className="logout-button"
                onClick={signOut}
                loading={signingOut}
                aria-label="Sign out"
              >
                <AppIcon name="logout" size={16} />
                <span className="logout-label">
                  {signingOut ? "Signing out..." : "Sign Out"}
                </span>
              </Button>
              <Button className="create-lead-button" onClick={create.show}>
                <span className="create-lead-plus">
                  <AppIcon name="plus" size={16} />
                </span>
                {leadConfig.create.title}
              </Button>
            </>
          }
        />
      }
      overlay={
        create.open && (
          <Drawer
            {...leadConfig.create}
            busy={create.submitting}
            onClose={create.close}
          >
            <CreateLeadForm
              values={create.values}
              onChange={create.change}
              onSubmit={create.submit}
              onCancel={create.close}
              submitting={create.submitting}
              error={create.error}
              brand={brand}
              content={leadConfig.create}
            />
          </Drawer>
        )
      }
    >
      {logoutError && <EmptyState error message={logoutError} />}
      {/* Render one overview state: loading, failure with retry, or the supplied data. */}
      {overview.loading ? (
        <EmptyState message="Loading dashboard..." />
      ) : overview.error ? (
        <EmptyState error message={overview.error} onRetry={overview.retry} />
      ) : (
        data && (
          <>
            <DashboardHero
              brand={brand}
              branch={data.branch}
              summary={data.summary}
              snapshot={data.snapshot}
              content={dashboardConfig.hero}
            />
            <InfoCards items={data.metrics} />
          </>
        )
      )}
      {/* The register loads independently: a metrics error should not hide the loan table. */}
      <section className="dashboard-first-row">
        <ProcessingRegister
          selectedView={selectedView}
          onViewChange={setSelectedView}
          {...register}
          onRetry={register.retry}
          onOpenLead={(id) =>
            navigate(`/applications/${encodeURIComponent(id)}/onboarding`)
          }
        />
        {data && (
          <>
            <SourceMixPanel items={data.sources} />
            <LoanTypeMixPanel items={data.loanTypes} />
          </>
        )}
      </section>
      {data && (
        <section className="dashboard-second-row">
          <ProcessingTrendPanel trend={data.trend} />
          <ActionWatchlist
            items={data.watchlist}
            slaMinutes={data.summary.slaMinutes}
          />
          <RecentActivityPanel items={data.activities} />
        </section>
      )}
    </AppShell>
  );
}

// Keep the provider above Dashboard: a component cannot read a context it only creates below itself.
export default function DashboardPage({ tenant, ...props }) {
  return (
    <ThemeProvider tenant={tenant}>
      <Dashboard {...props} />
    </ThemeProvider>
  );
}
