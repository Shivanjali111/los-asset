import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardPage.css";

/* Inline SVG Icons */

const LogoutIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const CollapseIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ExpandIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ICON_PATHS = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  "gold-loan": (
    <>
      <path d="M6.5 4h11l3 5-8.5 11L3.5 9l3-5Z" />
      <path d="m3.5 9 8.5 3 8.5-3M8.5 4 12 12 15.5 4" />
    </>
  ),
  appraisal: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4M8.5 11l1.7 1.7 3.5-3.7" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 7v5h-5" />
      <path d="M18.2 16a8 8 0 1 1 .8-8.9L20 12" />
    </>
  ),
  sanction: (
    <>
      <path d="M12 3 4.5 6v5.5c0 4.7 3.2 7.7 7.5 9.5 4.3-1.8 7.5-4.8 7.5-9.5V6L12 3Z" />
      <path d="m8.5 12 2.2 2.2 4.8-5" />
    </>
  ),
  disbursement: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18M7 15h3" />
    </>
  ),
  branch: (
    <>
      <path d="m3 9 9-5 9 5" />
      <path d="M5 9h14M6 9v8M10 9v8M14 9v8M18 9v8M4 20h16" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.7-4 3-6 7-6s6.3 2 7 6" />
    </>
  ),
  broker: (
    <>
      <path d="M4 11.5 8.5 7l3 3 4.5-4.5L20 9.5" />
      <path d="M3 18h18M5 15l3-3 3 2 5-4 3 3" />
    </>
  ),
  check: <path d="m5 12.5 4.2 4.2L19.5 6.5" />,
  rupee: (
    <>
      <path d="M6 5h12M6 9h12M7 5c5.5 0 7.5 1.8 7.5 4.5S12.5 14 7 14l8 6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  download: (
    <>
      <path d="M12 3v12" />
      <path d="m7.5 10.5 4.5 4.5 4.5-4.5M5 21h14" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
};

const AppIcon = ({ name, size = 18, className = "" }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {ICON_PATHS[name]}
  </svg>
);

/* Static Data */

const listViews = [
  "Today's Gold Loans",
  "All Gold Loans",
  "Fresh Loans",
  "Renewals",
  "Completed",
  "Needs Attention",
];

const FIXED_LEAD_SOURCE = "Branch Walk-in";

const emptyLeadForm = {
  firstName: "",
  lastName: "",
  mobile: "",
  email: "",
  product: "Gold Loan",
  source: FIXED_LEAD_SOURCE,
};

const channelData = [
  { label: "Branch Walk-in", count: 25, value: "60%", width: "100%", icon: "branch" },
  { label: "RM Referral", count: 11, value: "26%", width: "44%", icon: "person" },
  { label: "Gold Broker", count: 6, value: "14%", width: "24%", icon: "broker" },
];

const monthlyProcessingData = [
  { label: "Week 1", value: 198 },
  { label: "Week 2", value: 214 },
  { label: "Week 3", value: 236 },
  { label: "Week 4", value: 188 },
];

const activityData = [
  {
    title: "Fresh gold loan disbursed",
    subtitle: "\u20B94.80 lakh disbursed for GL-2026-01853 in 11 minutes.",
    time: "12 min ago",
    icon: "check",
  },
  {
    title: "Jewellery appraisal completed",
    subtitle: "Net eligible gold weight recorded for GL-2026-01851.",
    time: "38 min ago",
    icon: "gold-loan",
  },
  {
    title: "Gold loan renewed",
    subtitle: "Renewal completed for GL-2025-00982 in 8 minutes.",
    time: "1 hr ago",
    icon: "refresh",
  },
  {
    title: "Sanction approved by checker",
    subtitle: "GL-2026-01848 is ready for disbursement.",
    time: "2 hrs ago",
    icon: "sanction",
  },
];

const navItems = [
  { icon: "dashboard", label: "Dashboard", active: true },
  { icon: "gold-loan", label: "Gold Loans", active: false },
  { icon: "appraisal", label: "Appraisals", active: false },
  { icon: "refresh", label: "Renewals", active: false },
  { icon: "sanction", label: "Sanctions", active: false },
  { icon: "disbursement", label: "Disbursements", active: false },
];

/* Component */

function DashboardPage({ leads = [], onCreateLead, onLogout }) {
  const navigate = useNavigate();

  const [selectedListView, setSelectedListView] = useState(
    "Today's Gold Loans",
  );
  const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [leadForm, setLeadForm] = useState(emptyLeadForm);
  const [apiLeads, setApiLeads] = useState([]);
  const [isTodayLeadsLoading, setIsTodayLeadsLoading] = useState(true);
  const [todayLeadsError, setTodayLeadsError] = useState("");
  const [isCreatingLead, setIsCreatingLead] = useState(false);
  const [createLeadError, setCreateLeadError] = useState("");

  useEffect(() => {
    const fetchTodayLeads = async () => {
      try {
        setIsTodayLeadsLoading(true);
        setTodayLeadsError("");

        const response = await fetch(
          "https://xx8ep3p2ue.execute-api.ap-south-1.amazonaws.com/prod/leads/today",
        );

        if (!response.ok) {
          throw new Error("Unable to load today's leads.");
        }

        const data = await response.json();

        if (data.success) {
          const formattedLeads = data.data.map((lead) => ({
            id: lead.leadnumber,
            firstName: lead.first_name,
            lastName: lead.last_name,
            mobile: lead.mobile,
            email: lead.email,
            product: lead.product || "Gold Loan",
            loanType: lead.loan_type || lead.loanType || "Fresh",
            status: lead.stage || "New",
            owner: lead.owner || "Sales User",
            createdDate: new Date(lead.created_at).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
          }));

          setApiLeads(formattedLeads);
        } else {
          throw new Error(data.message || "Unable to load today's leads.");
        }
      } catch (error) {
        console.error("Fetch Today Leads Error:", error);
        setTodayLeadsError(error.message || "Unable to load today's leads.");
      } finally {
        setIsTodayLeadsLoading(false);
      }
    };

    fetchTodayLeads();
  }, []);

  const displayLeads =
    selectedListView === "Today's Gold Loans" ? apiLeads : leads;

  const filteredLeads = displayLeads.filter((lead) => {
    if (selectedListView === "All Gold Loans") return true;
    if (selectedListView === "Fresh Loans")
      return (lead.loanType || "Fresh") === "Fresh";
    if (selectedListView === "Renewals") return lead.loanType === "Renewal";
    if (selectedListView === "Completed")
      return ["Converted", "Disbursed", "Completed"].includes(lead.status);
    if (selectedListView === "Needs Attention")
      return ["Pending", "In Progress", "Exception"].includes(lead.status);
    if (selectedListView === "Today's Gold Loans") return true;

    return true;
  });

  const processedToday = 42;
  const freshLoans = 30;
  const renewalLoans = 12;
  const disbursedAmount = "\u20B91.86 Cr";
  const averageTat = "13 min";
  const withinSla = "88%";
  const currentDateLabel = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  const handleSignOut = async () => {
    try {
      await onLogout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleOpenCreatePanel = () => {
    setLeadForm(emptyLeadForm);
    setCreateLeadError("");
    setIsCreatePanelOpen(true);
  };

  const handleCloseCreatePanel = () => {
    setIsCreatePanelOpen(false);
    setLeadForm(emptyLeadForm);
    setCreateLeadError("");
  };

  const handleLeadFormChange = (e) => {
    const { name, value } = e.target;
    setLeadForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();

    try {
      setIsCreatingLead(true);
      setCreateLeadError("");
      const res = await fetch(
        "https://weaq9mioy2.execute-api.ap-south-1.amazonaws.com/create-lead",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...leadForm,
            source: FIXED_LEAD_SOURCE,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create lead");
      }

      const newLead = {
        id: data.leadnumber,
        firstName: leadForm.firstName,
        lastName: leadForm.lastName,
        mobile: leadForm.mobile,
        email: leadForm.email,
        product: leadForm.product,
        source: FIXED_LEAD_SOURCE,
        status: "New",
        owner: "Sales User",
        createdDate: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        ...data,
      };

      setApiLeads((currentLeads) => [newLead, ...currentLeads]);
      handleCloseCreatePanel();

      const newLeadId = onCreateLead ? onCreateLead(newLead) : newLead.id;
      navigate(`/applications/${newLeadId}/onboarding`);
    } catch (err) {
      alert(err)
      setCreateLeadError(
        err.message || "An error occurred while creating the lead.",
      );
    } finally {
      setIsCreatingLead(false);
    }
  };

  return (
    <div className="dashboard-page">
      {/* SIDEBAR */}
      <aside className={`app-sidebar${isSidebarCollapsed ? " collapsed" : ""}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <img
              src={
                isSidebarCollapsed
                  ? "/images/yes-bank-logo-icon.png"
                  : "/images/yes-bank-logo-dark-bg.png"
              }
              alt="YES BANK"
              className="sidebar-logo-img"
            />
          </div>
          <div className="sidebar-brand-text">
            <h2>Gold Loan Portal</h2>
            <p>Origination &amp; Appraisal</p>
          </div>
        </div>

        <button
          className="sidebar-collapse-btn"
          onClick={() => setIsSidebarCollapsed((c) => !c)}
          title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span className="sidebar-collapse-icon">
            {isSidebarCollapsed ? <ExpandIcon /> : <CollapseIcon />}
          </span>
          <span className="nav-label">Collapse</span>
        </button>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`nav-item${item.active ? " active" : ""}`}
              title={item.label}
              data-label={item.label}
            >
              <span className="nav-icon">
                <AppIcon name={item.icon} size={16} />
              </span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-insight-card">
          <span>15-Minute Service</span>
          <strong>88% completed within SLA</strong>
          <p>Five active cases need attention to protect branch turnaround time.</p>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-footer-avatar" title="Sales User">
            SU
          </div>
          <div className="sidebar-footer-info">
            <p>Logged in as</p>
            <strong>Sales User</strong>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="dashboard-title-block">
            <span className="page-eyebrow">Branch Lending Workspace</span>
            <h1>Gold Loan Processing Dashboard</h1>
            <p>Pune Camp Branch | {currentDateLabel}</p>
          </div>

          <div className="topbar-actions">
            <button
              className="logout-button"
              onClick={handleSignOut}
              title="Sign out"
              aria-label="Sign out"
            >
              <LogoutIcon />
              <span className="logout-label">Sign Out</span>
            </button>

            <button
              className="create-lead-button"
              onClick={handleOpenCreatePanel}
            >
              <span className="create-lead-plus"><AppIcon name="plus" size={16} /></span>
              Start Gold Loan
            </button>
          </div>
        </header>

        <section className="gold-dashboard-hero">
          <div className="gold-hero-copy">
            <span className="gold-hero-kicker">
              <i aria-hidden="true" />
              Pune Camp Branch | Live Operations
            </span>
            <h2>
              Complete every gold loan in{" "}
              <em>15 minutes or less.</em>
            </h2>
            <p>
              Track today's fresh loans and renewals, monitor appraisal and
              sanction turnaround, and act only on cases at risk of crossing
              the branch service SLA.
            </p>

            <div className="gold-journey-strip" aria-label="Gold loan processing stages">
              <span className="active">
                <b>01</b>Customer
              </span>
              <i aria-hidden="true" />
              <span>
                <b>02</b>Appraisal
              </span>
              <i aria-hidden="true" />
              <span>
                <b>03</b>Sanction
              </span>
              <i aria-hidden="true" />
              <span>
                <b>04</b>Disbursement
              </span>
            </div>
          </div>

          <div className="gold-hero-snapshot">
            <div className="snapshot-title">
              <span>Branch snapshot</span>
              <small>Live operational focus</small>
            </div>
            <div className="snapshot-metric appraisal">
              <strong>03</strong>
              <span>In appraisal</span>
            </div>
            <div className="snapshot-metric checker">
              <strong>02</strong>
              <span>Awaiting sanction</span>
            </div>
            <div className="snapshot-metric disbursed">
              <strong>42</strong>
              <span>Processed today</span>
            </div>
          </div>

          <div className="gold-hero-art" aria-hidden="true">
            <span className="hero-gold-ring hero-ring-large" />
            <span className="hero-gold-ring hero-ring-small" />
            <span className="hero-gold-coin hero-coin-one">916</span>
            <span className="hero-gold-coin hero-coin-two">24K</span>
            <img src="/images/yes-bank-logo-icon.png" alt="" />
            <b>*</b>
          </div>
        </section>

        <section className="kpi-grid">
          <div className="kpi-card primary-kpi">
            <div className="kpi-content">
              <span>Total Processed Today</span>
              <strong>{processedToday}</strong>
              <p>Fresh loans and renewals completed</p>
              <div className="kpi-trend up">Live branch throughput</div>
            </div>
            <div className="kpi-icon"><AppIcon name="check" size={21} /></div>
          </div>

          <div className="kpi-card">
            <div className="kpi-content">
              <span>Amount Disbursed</span>
              <strong>{disbursedAmount}</strong>
              <p>Total gold-loan value processed today</p>
              <div className="kpi-trend up">Across 42 loans</div>
            </div>
            <div className="kpi-icon"><AppIcon name="rupee" size={21} /></div>
          </div>

          <div className="kpi-card">
            <div className="kpi-content">
              <span>Average Turnaround</span>
              <strong>{averageTat}</strong>
              <p>Customer start to disbursement</p>
              <div className="kpi-trend up">Within 15-minute SLA</div>
            </div>
            <div className="kpi-icon"><AppIcon name="clock" size={21} /></div>
          </div>

          <div className="kpi-card">
            <div className="kpi-content">
              <span>Fresh Loans</span>
              <strong>{freshLoans}</strong>
              <p>New gold-loan accounts processed</p>
              <div className="kpi-trend neutral">71% of today's volume</div>
            </div>
            <div className="kpi-icon"><AppIcon name="plus" size={21} /></div>
          </div>

          <div className="kpi-card">
            <div className="kpi-content">
              <span>Renewals</span>
              <strong>{renewalLoans}</strong>
              <p>Existing gold loans renewed today</p>
              <div className="kpi-trend neutral">29% of today's volume</div>
            </div>
            <div className="kpi-icon"><AppIcon name="refresh" size={21} /></div>
          </div>

          <div className="kpi-card">
            <div className="kpi-content">
              <span>Completed Within SLA</span>
              <strong>{withinSla}</strong>
              <p>Processed in 15 minutes or less</p>
              <div className="kpi-trend up">Target &gt;= 85%</div>
            </div>
            <div className="kpi-icon"><AppIcon name="sanction" size={21} /></div>
          </div>
        </section>

        <section className="dashboard-first-row">
          <section className="lead-panel compact-lead-panel">
            <div className="lead-panel-header">
              <div>
                <span className="section-eyebrow">Today's Processing Register</span>
                <h2>{selectedListView}</h2>
                <p>
                  {selectedListView === "Today's Gold Loans"
                    ? "Fresh and renewal cases initiated at the branch today."
                    : "Gold loan cases based on the selected operational view."}
                </p>
                {todayLeadsError &&
                  selectedListView === "Today's Gold Loans" && (
                    <span className="table-inline-error" role="status">
                      {todayLeadsError}
                    </span>
                  )}
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
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <button className="small-action-button">
                  <span><AppIcon name="download" size={15} /></span>
                  Export
                </button>
              </div>
            </div>

            <div className="table-wrapper compact-table-wrapper">
              <table className="lead-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Customer</th>
                    <th>Loan Type</th>
                    <th>Status</th>
                    <th>Handled By</th>
                    <th>Started</th>
                  </tr>
                </thead>
                <tbody>
                  {isTodayLeadsLoading &&
                  selectedListView === "Today's Gold Loans" ? (
                    <tr>
                      <td colSpan="6">
                        <div className="table-empty-state">
                          Loading today's gold loans...
                        </div>
                      </td>
                    </tr>
                  ) : filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan="6">
                        <div className="table-empty-state">
                          No gold loan cases found for this view.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr key={lead.id}>
                        <td>
                          <button
                            type="button"
                            className="lead-link-button"
                            onClick={() => navigate(`/applications/${lead.id}/onboarding?leadId=${encodeURIComponent(lead.id)}`)}
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
                              <strong>
                                {lead.firstName} {lead.lastName}
                              </strong>
                              <p>{lead.mobile}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="gold-product-chip">
                            <i aria-hidden="true"><AppIcon name="gold-loan" size={14} /></i>
                            {lead.loanType || "Fresh"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`status-pill ${String(
                              lead.status || "New",
                            )
                              .toLowerCase()
                              .replaceAll(" ", "-")}`}
                          >
                            {lead.status || "New"}
                          </span>
                        </td>
                        <td>{lead.owner}</td>
                        <td>{lead.createdDate}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="insight-panel source-panel">
            <div className="panel-header">
              <div>
                <span className="section-eyebrow">Customer Source</span>
                <h2>Source Mix</h2>
                <p>Today's processed gold loans by source.</p>
              </div>
            </div>

            <div className="channel-list">
              {channelData.map((ch) => (
                <div className="channel-row" key={ch.label}>
                  <div className="channel-label">
                    <span>
                      <i><AppIcon name={ch.icon} size={14} /></i>
                      {ch.label}
                    </span>
                    <strong>{ch.count} | {ch.value}</strong>
                  </div>
                  <div className="channel-track">
                    <div className="channel-fill" style={{ width: ch.width }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="insight-panel verification-panel">
            <div className="panel-header">
              <div>
                <span className="section-eyebrow">Processed Today</span>
                <h2>Loan Type Mix</h2>
                <p>Fresh sanctions compared with renewals.</p>
              </div>
            </div>

            <div className="donut-card">
              <div className="donut-chart loan-type-donut">
                <span>42<small>Total</small></span>
              </div>
              <div className="donut-legend">
                <div>
                  <i className="legend-dot completed" />
                  Fresh<strong>30 | 71%</strong>
                </div>
                <div>
                  <i className="legend-dot pending" />
                  Renewal<strong>12 | 29%</strong>
                </div>
              </div>
            </div>
          </section>
        </section>

        <section className="dashboard-second-row">
          <section className="insight-panel throughput-panel">
            <div className="panel-header">
              <div>
                <span className="section-eyebrow">Branch Throughput</span>
                <h2>Monthly Processing Trend</h2>
                <p>Fresh loans and renewals completed during the current month.</p>
              </div>
              <span className="panel-pill">August | 836</span>
            </div>

            <div className="throughput-chart" aria-label="Monthly gold loans processed by week">
              {monthlyProcessingData.map((item) => (
                <div className="throughput-column" key={item.label}>
                  <strong>{item.value}</strong>
                  <div className="throughput-track">
                    <span style={{ height: `${Math.max(item.value / 2.5, 18)}%` }} />
                  </div>
                  <small>{item.label}</small>
                </div>
              ))}
            </div>
          </section>

          <section className="insight-panel">
            <div className="panel-header">
              <div>
                <span className="section-eyebrow">Today's Attention</span>
                <h2>Action Watchlist</h2>
                <p>Only cases at risk of delaying the 15-minute journey.</p>
              </div>
            </div>

            <div className="watchlist">
              <div>
                <span>Cases above 12 minutes</span>
                <strong>03</strong>
              </div>
              <div>
                <span>Awaiting appraiser action</span>
                <strong>02</strong>
              </div>
              <div>
                <span>Awaiting checker sanction</span>
                <strong>02</strong>
              </div>
              <div>
                <span>Renewals due today</span>
                <strong>04</strong>
              </div>
            </div>
          </section>

          <section className="insight-panel activity-panel">
            <div className="panel-header">
              <div>
                <span className="section-eyebrow">Activity Trail</span>
                <h2>Recent Activity</h2>
                <p>Latest gold loan journey updates.</p>
              </div>
            </div>

            <div className="activity-list">
              {activityData.map((activity) => (
                <div className="activity-item" key={activity.title}>
                  <div className="activity-icon">
                    <AppIcon name={activity.icon} size={17} />
                  </div>
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

      </main>

      {/* CREATE GOLD LOAN DRAWER */}
      {isCreatePanelOpen && (
        <div className="drawer-backdrop" onClick={handleCloseCreatePanel}>
          <aside
            className="create-lead-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-header">
              <div>
                <span className="drawer-eyebrow">Quick Gold Loan Processing</span>
                <h2>Start Gold Loan</h2>
                <p>
                  Capture the customer's basic details and source to begin the
                  15-minute branch journey.
                </p>
              </div>
              <button
                type="button"
                className="drawer-close-button"
                onClick={handleCloseCreatePanel}
                aria-label="Close create lead panel"
              >
                <AppIcon name="close" size={18} />
              </button>
            </div>

            <form className="create-lead-form" onSubmit={handleCreateLead}>
              <div className="drawer-product-card">
                <div className="drawer-product-icon" aria-hidden="true">
                  <span><AppIcon name="gold-loan" size={20} /></span>
                  <small>916</small>
                </div>
                <div className="drawer-product-copy">
                  <span>Selected product</span>
                  <strong>YES BANK Gold Loan</strong>
                  <p>Fresh loan or renewal | 15-minute service</p>
                </div>
                <span className="drawer-stage-pill">
                  <i aria-hidden="true" /> New Request
                </span>
              </div>

              <div className="form-section">
                <div className="form-section-heading">
                  <span>01</span>
                  <div>
                    <h3>Customer details</h3>
                    <p>
                      Capture the minimum information required to register the
                      enquiry.
                    </p>
                  </div>
                </div>

                <div className="form-grid two-column">
                  <div className="field-group">
                    <label htmlFor="firstName">
                      First Name <b aria-hidden="true">*</b>
                    </label>
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
                    <label htmlFor="lastName">
                      Last Name <b aria-hidden="true">*</b>
                    </label>
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

                <div className="form-grid two-column">
                  <div className="field-group">
                    <label htmlFor="mobile">
                      Mobile Number <b aria-hidden="true">*</b>
                    </label>
                    <div className="lead-input-with-prefix">
                      <span>+91</span>
                      <input
                        id="mobile"
                        name="mobile"
                        type="tel"
                        inputMode="numeric"
                        placeholder="10-digit mobile number"
                        value={leadForm.mobile}
                        onChange={handleLeadFormChange}
                        pattern="[6-9][0-9]{9}"
                        maxLength="10"
                        required
                      />
                    </div>
                  </div>

                  <div className="field-group">
                    <label htmlFor="email">
                      Email Address
                      <span className="optional-label">Optional</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="customer@example.com"
                      value={leadForm.email}
                      onChange={handleLeadFormChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-heading">
                  <span>02</span>
                  <div>
                    <h3>Enquiry source</h3>
                    <p>Source is fixed for branch-initiated gold loans.</p>
                  </div>
                </div>

                <div className="source-choice-grid fixed-source-grid">
                  <div className="source-choice selected locked-source">
                    <span className="source-choice-icon" aria-hidden="true">
                      <AppIcon name="branch" size={18} />
                    </span>
                    <span>
                      <strong>{FIXED_LEAD_SOURCE}</strong>
                      <small>Automatically assigned for this journey</small>
                    </span>
                    <i aria-hidden="true"><AppIcon name="lock" size={14} /></i>
                  </div>
                </div>
              </div>

              <div className="drawer-info-card">
                <div className="drawer-info-heading">
                  <span aria-hidden="true"><AppIcon name="check" size={17} /></span>
                  <div>
                    <strong>After the request is created</strong>
                    <p>Continue directly to customer verification and appraisal.</p>
                  </div>
                </div>
                <div className="drawer-next-steps">
                  <span>
                    <b>1</b>Verify Customer
                  </span>
                  <i aria-hidden="true" />
                  <span>
                    <b>2</b>Appraise Gold
                  </span>
                  <i aria-hidden="true" />
                  <span>
                    <b>3</b>Sanction &amp; Disburse
                  </span>
                </div>
              </div>

              {createLeadError && (
                <div className="drawer-error-message" role="alert">
                  {createLeadError}
                </div>
              )}

              <div className="drawer-actions">
                <button
                  type="button"
                  className="secondary-action-button"
                  onClick={handleCloseCreatePanel}
                  disabled={isCreatingLead}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="header-action-button create-action"
                  disabled={isCreatingLead}
                >
                  <span className="header-action-icon"><AppIcon name="plus" size={16} /></span>
                  {isCreatingLead ? "Starting Gold Loan..." : "Start Gold Loan"}
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