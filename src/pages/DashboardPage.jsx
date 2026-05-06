import { useState } from "react";
import "./DashboardPage.css";

const listViews = [
  "All Leads",
  "My Leads",
  "New Leads",
  "In Progress Leads",
  "Converted Leads",
  "Disqualified Leads",
];

const productOptions = [
  "Home Loan",
  "Loan Against Property",
  "Working Capital",
  "Business Loan",
  "Personal Loan",
];

const sourceOptions = [
  "Website",
  "Mobile App",
  "Digital Aggregator",
  "Branch Walk-in",
  "Outbound Call",
  "Inbound Call",
  "Referral",
];

const emptyLeadForm = {
  firstName: "",
  lastName: "",
  mobile: "",
  product: "",
  source: "",
};

const channelData = [
  { label: "Website",       value: "34%", width: "74%", icon: "⌁" },
  { label: "Mobile App",    value: "26%", width: "58%", icon: "▣" },
  { label: "Branch Walk-in",value: "18%", width: "42%", icon: "⌂" },
  { label: "Referral",      value: "12%", width: "31%", icon: "↗" },
  { label: "Aggregator",    value: "10%", width: "26%", icon: "◆" },
];

const funnelData = [
  { label: "Lead Captured",          value: 186, icon: "01" },
  { label: "Application In Progress",value: 74,  icon: "02" },
  { label: "Document Collection",    value: 39,  icon: "03" },
  { label: "Verification Review",    value: 31,  icon: "04" },
  { label: "Credit Review",          value: 22,  icon: "05" },
  { label: "APS Generated",          value: 16,  icon: "06" },
];

const verificationQueue = [
  { applicant: "Aarav Sharma", lead: "LD-10017", check: "PAN Verification", status: "Pending"   },
  { applicant: "Neha Mehta",   lead: "LD-10012", check: "Mobile OTP",       status: "Completed" },
  { applicant: "Rohan Iyer",   lead: "LD-10008", check: "Passport OCR",     status: "Review"    },
];

const creditQueue = [
  { application: "APP-24091", customer: "Karan Malhotra", stage: "Credit Review", aging: "2 Days" },
  { application: "APP-24084", customer: "Priya Nair",     stage: "Sent Back",     aging: "4 Days" },
  { application: "APP-24079", customer: "Vivek Rao",      stage: "APS Pending",   aging: "1 Day"  },
];

const documentExceptions = [
  { lead: "LD-10015", document: "Income Proof",  issue: "Document missing",    severity: "High"   },
  { lead: "LD-10011", document: "PAN Card",       issue: "Name mismatch",       severity: "Medium" },
  { lead: "LD-10006", document: "Bank Statement", issue: "Re-upload required",  severity: "Low"    },
];

const activityData = [
  {
    title:    "PAN verification completed",
    subtitle: "Applicant identity check completed for LD-10018.",
    time:     "12 min ago",
    icon:     "✓",
  },
  {
    title:    "Application sent back for rework",
    subtitle: "Income proof missing for credit review.",
    time:     "38 min ago",
    icon:     "↩",
  },
  {
    title:    "New digital lead assigned",
    subtitle: "Website lead routed to Sales User.",
    time:     "1 hr ago",
    icon:     "+",
  },
  {
    title:    "APS generated",
    subtitle: "Loan file moved to APS generated stage.",
    time:     "2 hrs ago",
    icon:     "★",
  },
];

function DashboardPage({ leads, onCreateLead, onLogout, onOpenLeadDetails }) {
  const [selectedListView, setSelectedListView] = useState("All Leads");
  const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false);
  const [leadForm, setLeadForm] = useState(emptyLeadForm);

  const filteredLeads = leads.filter((lead) => {
    if (selectedListView === "All Leads")         return true;
    if (selectedListView === "My Leads")          return lead.owner !== "Contact Center";
    if (selectedListView === "New Leads")         return lead.status === "New";
    if (selectedListView === "In Progress Leads") return lead.status === "In Progress";
    if (selectedListView === "Converted Leads")   return lead.status === "Converted";
    if (selectedListView === "Disqualified Leads")return lead.status === "Disqualified";
    return true;
  });

  const totalLeads       = leads.length;
  const newLeads         = leads.filter((l) => l.status === "New").length;
  const inProgressLeads  = leads.filter((l) => l.status === "In Progress").length;
  const convertedLeads   = leads.filter((l) => l.status === "Converted").length;
  const disqualifiedLeads= leads.filter((l) => l.status === "Disqualified").length;
  const conversionRate   = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  const handleOpenCreatePanel  = () => setIsCreatePanelOpen(true);
  const handleCloseCreatePanel = () => {
    setIsCreatePanelOpen(false);
    setLeadForm(emptyLeadForm);
  };

  const handleLeadFormChange = (event) => {
    const { name, value } = event.target;
    setLeadForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateLead = (event) => {
    event.preventDefault();
    const newLead = {
      id:          `LD-${10021 + leads.length}`,
      firstName:   leadForm.firstName,
      lastName:    leadForm.lastName,
      mobile:      leadForm.mobile,
      product:     leadForm.product,
      source:      leadForm.source,
      status:      "New",
      owner:       "Sales User",
      createdDate: "06 May 2026",
    };
    setSelectedListView("All Leads");
    handleCloseCreatePanel();
    onCreateLead(newLead);
  };

  return (
    <div className="dashboard-page">
      {/* ── SIDEBAR ─────────────────────────── */}
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">LOS</div>
          <div>
            <h2>LOS Portal</h2>
            <p>Loan Origination Workspace</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active">
            <span>▦</span>
            Dashboard
          </button>
          <button className="nav-item">
            <span>◎</span>
            Leads
          </button>
          <button className="nav-item">
            <span>▣</span>
            Loan Files
          </button>
          <button className="nav-item">
            <span>◌</span>
            Applicants
          </button>
          <button className="nav-item">
            <span>□</span>
            Documents
          </button>
          <button className="nav-item">
            <span>◇</span>
            Approvals
          </button>
        </nav>

        <div className="sidebar-insight-card">
          <span>Today's LOS Focus</span>
          <strong>12 loan files need attention</strong>
          <p>Inactive leads, document pending cases, and sent-back applications.</p>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-footer-avatar">SU</div>
          <div className="sidebar-footer-info">
            <p>Logged in as</p>
            <strong>Sales User</strong>
          </div>
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────── */}
      <main className="dashboard-main">

        {/* Top bar */}
        <header className="dashboard-topbar">
          <div className="dashboard-title-block">
            <span className="page-eyebrow">LOS Command Center</span>
            <h1>Morning Coffee View</h1>
            <p>
              A focused operational view of lead intake, loan file movement,
              verification readiness, and credit review queues.
            </p>
          </div>
          <div className="topbar-actions">
            <button
              className="icon-only-button logout-action"
              onClick={onLogout}
              title="Logout"
              aria-label="Logout"
            >
              <span>↪</span>
            </button>
            <button className="create-lead-button" onClick={handleOpenCreatePanel}>
              <span>＋</span>
              Create Lead
            </button>
          </div>
        </header>

        {/* KPI Grid */}
        <section className="kpi-grid">
          <div className="kpi-card primary-kpi">
            <div className="kpi-content">
              <span>Total Leads</span>
              <strong>{totalLeads}</strong>
              <p>Across active LOS lead sources</p>
              <div className="kpi-trend up">↑ 8% vs last week</div>
            </div>
            <div className="kpi-icon">◎</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-content">
              <span>New Leads</span>
              <strong>{newLeads}</strong>
              <p>Awaiting first action</p>
              <div className="kpi-trend up">↑ 12%</div>
            </div>
            <div className="kpi-icon">+</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-content">
              <span>In Progress</span>
              <strong>{inProgressLeads}</strong>
              <p>Application work started</p>
              <div className="kpi-trend neutral">→ Stable</div>
            </div>
            <div className="kpi-icon">▣</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-content">
              <span>Converted</span>
              <strong>{convertedLeads}</strong>
              <p>Moved to loan application</p>
              <div className="kpi-trend up">↑ 5%</div>
            </div>
            <div className="kpi-icon">✓</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-content">
              <span>Conversion Rate</span>
              <strong>{conversionRate}%</strong>
              <p>Lead to application ratio</p>
              <div className="kpi-trend up">↑ 2pts</div>
            </div>
            <div className="kpi-icon">↗</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-content">
              <span>Disqualified</span>
              <strong>{disqualifiedLeads}</strong>
              <p>Rejected or not eligible</p>
              <div className="kpi-trend down">↑ 3%</div>
            </div>
            <div className="kpi-icon">!</div>
          </div>
        </section>

        {/* First row */}
        <section className="dashboard-first-row">

          {/* Lead List */}
          <section className="lead-panel compact-lead-panel">
            <div className="lead-panel-header">
              <div>
                <span className="section-eyebrow">Dynamic Records</span>
                <h2>Lead List View</h2>
                <p>Live LOS lead records based on selected view.</p>
              </div>
              <div className="table-actions">
                <div className="list-view-control">
                  <label htmlFor="listView">List View</label>
                  <select
                    id="listView"
                    value={selectedListView}
                    onChange={(e) => setSelectedListView(e.target.value)}
                  >
                    {listViews.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
                <button className="small-action-button">
                  <span>↓</span>
                  Export
                </button>
              </div>
            </div>

            <div className="table-wrapper compact-table-wrapper">
              <table className="lead-table">
                <thead>
                  <tr>
                    <th>Lead ID</th>
                    <th>Applicant</th>
                    <th>Product</th>
                    <th>Stage</th>
                    <th>Owner</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id}>
                      <td>
                        <button
                          type="button"
                          className="lead-link-button"
                          onClick={() => onOpenLeadDetails(lead)}
                        >
                          {lead.id}
                        </button>
                      </td>
                      <td>
                        <div className="customer-cell">
                          <span>
                            {lead.firstName?.charAt(0)}
                            {lead.lastName?.charAt(0)}
                          </span>
                          <div>
                            <strong>{lead.firstName} {lead.lastName}</strong>
                            <p>{lead.mobile}</p>
                          </div>
                        </div>
                      </td>
                      <td>{lead.product}</td>
                      <td>
                        <span
                          className={`status-pill ${lead.status
                            .toLowerCase()
                            .replaceAll(" ", "-")}`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td>{lead.owner}</td>
                      <td>{lead.createdDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Source Mix */}
          <section className="insight-panel source-panel">
            <div className="panel-header">
              <div>
                <span className="section-eyebrow">Lead Intake</span>
                <h2>Source Mix</h2>
                <p>Contribution by channel this week.</p>
              </div>
            </div>
            <div className="channel-list">
              {channelData.map((ch) => (
                <div className="channel-row" key={ch.label}>
                  <div className="channel-label">
                    <span>
                      <i>{ch.icon}</i>
                      {ch.label}
                    </span>
                    <strong>{ch.value}</strong>
                  </div>
                  <div className="channel-track">
                    <div className="channel-fill" style={{ width: ch.width }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Verification Readiness */}
          <section className="insight-panel verification-panel">
            <div className="panel-header">
              <div>
                <span className="section-eyebrow">Verification</span>
                <h2>Readiness</h2>
                <p>Identity and document health.</p>
              </div>
            </div>
            <div className="donut-card">
              <div className="donut-chart">
                <span>78%</span>
              </div>
              <div className="donut-legend">
                <div>
                  <i className="legend-dot completed" />
                  Verified
                  <strong>78%</strong>
                </div>
                <div>
                  <i className="legend-dot pending" />
                  Pending
                  <strong>16%</strong>
                </div>
                <div>
                  <i className="legend-dot failed" />
                  Exception
                  <strong>6%</strong>
                </div>
              </div>
            </div>
          </section>
        </section>

        {/* Second row */}
        <section className="dashboard-second-row">

          {/* Origination Funnel */}
          <section className="insight-panel funnel-panel">
            <div className="panel-header">
              <div>
                <span className="section-eyebrow">Loan File Movement</span>
                <h2>Origination Funnel</h2>
                <p>Lead creation to APS generation.</p>
              </div>
              <span className="panel-pill">Current Week</span>
            </div>
            <div className="funnel-list">
              {funnelData.map((item) => (
                <div className="funnel-row" key={item.label}>
                  <div>
                    <span className="funnel-step">{item.icon}</span>
                    <strong>{item.label}</strong>
                  </div>
                  <div className="funnel-bar-wrap">
                    <div
                      className="funnel-bar"
                      style={{ width: `${Math.max(item.value / 2.2, 12)}%` }}
                    />
                  </div>
                  <span className="funnel-value">{item.value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* SLA Watchlist */}
          <section className="insight-panel">
            <div className="panel-header">
              <div>
                <span className="section-eyebrow">SLA Control</span>
                <h2>Watchlist</h2>
                <p>Cases requiring operational attention.</p>
              </div>
            </div>
            <div className="watchlist">
              <div>
                <span>Inactive Leads &gt; 5 Days</span>
                <strong>09</strong>
              </div>
              <div>
                <span>Document Pending Cases</span>
                <strong>14</strong>
              </div>
              <div>
                <span>Credit Review Aging</span>
                <strong>06</strong>
              </div>
              <div>
                <span>Sent Back for Rework</span>
                <strong>11</strong>
              </div>
            </div>
          </section>

          {/* Recent Activity */}
          <section className="insight-panel">
            <div className="panel-header">
              <div>
                <span className="section-eyebrow">Activity Trail</span>
                <h2>Recent Activity</h2>
                <p>Latest lead and loan file movement.</p>
              </div>
            </div>
            <div className="activity-list">
              {activityData.map((activity) => (
                <div className="activity-item" key={activity.title}>
                  <div className="activity-icon">{activity.icon}</div>
                  <div>
                    <strong>{activity.title}</strong>
                    <p>{activity.subtitle}</p>
                    <span>{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </section>

        {/* Static table grid */}
        <section className="static-table-grid">

          {/* Verification Queue */}
          <div className="mini-table-panel">
            <div className="mini-table-header">
              <div>
                <span className="mini-table-icon">✓</span>
                <div>
                  <h3>Verification Queue</h3>
                  <p>Applicant checks pending with verification team</p>
                </div>
              </div>
              <button>View All</button>
            </div>
            <table className="mini-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Check</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {verificationQueue.map((row) => (
                  <tr key={`${row.lead}-${row.check}`}>
                    <td>
                      <strong>{row.applicant}</strong>
                      <span>{row.lead}</span>
                    </td>
                    <td>{row.check}</td>
                    <td>
                      <span className={`mini-pill ${row.status.toLowerCase()}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Credit Review Queue */}
          <div className="mini-table-panel">
            <div className="mini-table-header">
              <div>
                <span className="mini-table-icon">◇</span>
                <div>
                  <h3>Credit Review Queue</h3>
                  <p>Loan files awaiting credit action</p>
                </div>
              </div>
              <button>View All</button>
            </div>
            <table className="mini-table">
              <thead>
                <tr>
                  <th>Application</th>
                  <th>Stage</th>
                  <th>Aging</th>
                </tr>
              </thead>
              <tbody>
                {creditQueue.map((row) => (
                  <tr key={row.application}>
                    <td>
                      <strong>{row.application}</strong>
                      <span>{row.customer}</span>
                    </td>
                    <td>{row.stage}</td>
                    <td>{row.aging}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Document Exceptions */}
          <div className="mini-table-panel">
            <div className="mini-table-header">
              <div>
                <span className="mini-table-icon">!</span>
                <div>
                  <h3>Document Exceptions</h3>
                  <p>Cases requiring document correction</p>
                </div>
              </div>
              <button>View All</button>
            </div>
            <table className="mini-table">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Issue</th>
                  <th>Severity</th>
                </tr>
              </thead>
              <tbody>
                {documentExceptions.map((row) => (
                  <tr key={`${row.lead}-${row.document}`}>
                    <td>
                      <strong>{row.lead}</strong>
                      <span>{row.document}</span>
                    </td>
                    <td>{row.issue}</td>
                    <td>
                      <span className={`severity-pill ${row.severity.toLowerCase()}`}>
                        {row.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* ── CREATE LEAD DRAWER ───────────────── */}
      {isCreatePanelOpen && (
        <div className="drawer-backdrop" onClick={handleCloseCreatePanel}>
          <aside
            className="create-lead-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-header">
              <div>
                <span className="drawer-eyebrow">Lead Capture</span>
                <h2>Create New Lead</h2>
                <p>
                  Capture applicant and loan requirement details to start the
                  LOS journey.
                </p>
              </div>
              <button className="drawer-close-button" onClick={handleCloseCreatePanel}>
                ×
              </button>
            </div>

            <form className="create-lead-form" onSubmit={handleCreateLead}>
              <div className="form-section">
                <h3>Applicant Information</h3>
                <div className="form-grid two-column">
                  <div className="field-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="Enter first name"
                      value={leadForm.firstName}
                      onChange={handleLeadFormChange}
                      required
                    />
                  </div>
                  <div className="field-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Enter last name"
                      value={leadForm.lastName}
                      onChange={handleLeadFormChange}
                      required
                    />
                  </div>
                </div>
                <div className="field-group">
                  <label htmlFor="mobile">Mobile Number</label>
                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={leadForm.mobile}
                    onChange={handleLeadFormChange}
                    maxLength="10"
                    required
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Loan Requirement</h3>
                <div className="form-grid two-column">
                  <div className="field-group">
                    <label htmlFor="product">Loan Product</label>
                    <select
                      id="product"
                      name="product"
                      value={leadForm.product}
                      onChange={handleLeadFormChange}
                      required
                    >
                      <option value="">Select product</option>
                      {productOptions.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field-group">
                    <label htmlFor="source">Lead Source</label>
                    <select
                      id="source"
                      name="source"
                      value={leadForm.source}
                      onChange={handleLeadFormChange}
                      required
                    >
                      <option value="">Select source</option>
                      {sourceOptions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="drawer-info-card">
                <strong>Default LOS Assignment</strong>
                <p>
                  The lead will be created with stage <b>New</b> and assigned
                  to the logged-in sales user.
                </p>
              </div>

              <div className="drawer-actions">
                <button
                  type="button"
                  className="secondary-action-button"
                  onClick={handleCloseCreatePanel}
                >
                  Cancel
                </button>
                <button type="submit" className="header-action-button create-action">
                  <span className="header-action-icon">＋</span>
                  Create Lead
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
