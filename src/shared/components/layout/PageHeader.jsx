/**
 * REUSABLE PAGE HEADING: Dashboard supplies title, eyebrow (small heading), subtitle and actions.
 * actions is a JSX slot containing the Sign Out and Start Gold Loan buttons.
 * This component controls layout; button behavior remains with the parent.
 */
export default function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <header className="dashboard-topbar">
      <div className="dashboard-title-block">
        <span className="page-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="topbar-actions">{actions}</div>
    </header>
  );
}
