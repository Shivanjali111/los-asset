import "./LeadDetailPage.css";

/* ── SVG Icons ───────────────────────────── */

const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const BackIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

/* ── Data helpers ────────────────────────── */

const buildLeadDetails = (lead) => ({
  alternateMobile:        lead.alternateMobile       || "—",
  applicantCategory:      lead.applicantCategory     || "Salaried",
  applicantType:          lead.applicantType         || "Individual",
  apsNumber:              lead.apsNumber             || "—",
  assignedTo:             lead.assignedTo            || "USR-1024",
  assignedToName:         lead.assignedToName        || lead.owner || "Sales User",
  balanceTransferBank:    lead.balanceTransferBank   || "—",
  balanceTransferBankName:lead.balanceTransferBankName|| "—",
  branchName:             lead.branchName            || "Mumbai Andheri Branch",
  btBankFunnel:           lead.btBankFunnel          || "—",
  constitutionType:       lead.constitutionType      || "Individual",
  consumerSystemName:     lead.consumerSystemName    || "LOS Web",
  countryCode:            lead.countryCode           || "+91",
  daysSinceLastActivity:  lead.daysSinceLastActivity || "0",
  emailVerified:          lead.emailVerified         || "No",
  generationMode:         lead.generationMode        || "Manual",
  leadAge:                lead.leadAge               || "0 Days",
  leadNumber:             lead.id,
  leadOrigin:             lead.leadOrigin            || "Direct",
  leadStage:              lead.leadStage             || lead.status || "New",
  leadSubDisposition:     lead.leadSubDisposition    || "—",
  leadSubSource:          lead.leadSubSource         || "—",
  leadSubSubSource:       lead.leadSubSubSource      || "—",
  loanFileStatus:         lead.loanFileStatus        || "Lead Draft",
  loanPurpose:            lead.loanPurpose           || "Purchase",
  loanTenureYears:        lead.loanTenureYears       || "20",
  loanType:               lead.loanType              || lead.product || "Home Loan",
  losOwnerTeam:           lead.losOwnerTeam          || "Sales Team",
  losVerificationUser:    lead.losVerificationUser   || "—",
  mobileVerified:         lead.mobileVerified        || "No",
  monthlyGrossSalary:     lead.monthlyGrossSalary    || "₹85,000",
  ownerName:              lead.ownerName             || lead.owner || "Sales User",
  product:                lead.product               || "—",
  projectPropertyName:    lead.projectPropertyName   || "—",
  propertyIdentified:     lead.propertyIdentified    || "No",
  requestedLoanAmount:    lead.requestedLoanAmount   || "₹45,00,000",
  residentialStatus:      lead.residentialStatus     || "Resident Indian",
  typeOfProperty:         lead.typeOfProperty        || "Flat / Apartment",
});

/* ── Reusable sub-components ─────────────── */

function EditableField({ label, value }) {
  return (
    <div className="record-field">
      <div className="record-field-content">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <button className="field-edit-btn" title={`Edit ${label}`}>
        <EditIcon />
      </button>
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <section className="record-section">
      <div className="record-section-header">
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <button className="section-edit-btn">
          <EditIcon />
          Edit
        </button>
      </div>
      <div className="record-field-grid">{children}</div>
    </section>
  );
}

const navItems = [
  { icon: "▦", label: "Dashboard", active: false, isBack: true },
  { icon: "◎", label: "Leads",     active: true,  isBack: false },
  { icon: "▣", label: "Loan Files",active: false, isBack: false },
  { icon: "◌", label: "Applicants",active: false, isBack: false },
  { icon: "□", label: "Documents", active: false, isBack: false },
  { icon: "◇", label: "Approvals", active: false, isBack: false },
];

/* ── Main component ──────────────────────── */

function LeadDetailPage({ lead, onBack, onLogout }) {
  const d = buildLeadDetails(lead);

  return (
    <div className="lead-detail-layout">

      {/* ── SIDEBAR ─────────────────────────── */}
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">LOS</div>
          <div className="sidebar-brand-text">
            <h2>LOS Portal</h2>
            <p>Loan Origination Workspace</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`nav-item${item.active ? " active" : ""}`}
              onClick={item.isBack ? onBack : undefined}
              title={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-insight-card">
          <span>Lead Context</span>
          <strong>{d.leadNumber} — {lead.firstName} {lead.lastName}</strong>
          <p>{d.product} · {d.branchName}</p>
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
      <main className="lead-detail-main">

        {/* Topbar */}
        <header className="record-topbar">
          <div className="record-topbar-left">
            <button className="back-btn" onClick={onBack}>
              <BackIcon />
              Back to Dashboard
            </button>

            <div className="record-title-row">
              <div className="record-avatar">
                {lead.firstName.charAt(0)}{lead.lastName.charAt(0)}
              </div>
              <div>
                <span className="page-eyebrow">Lead Details</span>
                <div className="record-title-line">
                  <h1>{lead.firstName} {lead.lastName}</h1>
                  <button className="title-edit-btn" title="Edit lead name">
                    <EditIcon />
                  </button>
                </div>
                <p className="record-meta">
                  {d.leadNumber} · {d.product} · {d.branchName}
                </p>
              </div>
            </div>
          </div>

          <div className="record-actions">
            <button className="record-action-logout" onClick={onLogout}>
              <LogoutIcon />
              Sign Out
            </button>
            <button className="record-action-outline">Verify Mobile</button>
            <button className="record-action-outline">Verify Email</button>
            <button className="record-action-primary">Convert Lead</button>
          </div>
        </header>

        {/* Summary strip */}
        <section className="record-summary-strip">
          <div className="summary-item">
            <span>Lead Stage</span>
            <strong>{d.leadStage}</strong>
          </div>
          <div className="summary-item">
            <span>Loan File Status</span>
            <strong>{d.loanFileStatus}</strong>
          </div>
          <div className="summary-item">
            <span>Requested Amount</span>
            <strong>{d.requestedLoanAmount}</strong>
          </div>
          <div className="summary-item">
            <span>Assigned To</span>
            <strong>{d.assignedToName}</strong>
          </div>
          <div className="summary-item">
            <span>Mobile Verified</span>
            <strong className={d.mobileVerified === "Yes" ? "text-green" : "text-amber"}>
              {d.mobileVerified}
            </strong>
          </div>
        </section>

        {/* Page grid */}
        <div className="record-page-grid">

          {/* Main column */}
          <div className="record-main-col">

            <Section title="Primary Lead Information" subtitle="Core details captured for this lead.">
              <EditableField label="Lead Number"            value={d.leadNumber} />
              <EditableField label="Product"               value={d.product} />
              <EditableField label="Lead Stage"            value={d.leadStage} />
              <EditableField label="Lead Origin"           value={d.leadOrigin} />
              <EditableField label="Lead Sub Source"       value={d.leadSubSource} />
              <EditableField label="Lead Sub Sub Source"   value={d.leadSubSubSource} />
              <EditableField label="Lead Sub Disposition"  value={d.leadSubDisposition} />
              <EditableField label="Generation Mode"       value={d.generationMode} />
              <EditableField label="Consumer System Name"  value={d.consumerSystemName} />
              <EditableField label="Lead Age"              value={d.leadAge} />
              <EditableField label="Days Since Last Activity" value={d.daysSinceLastActivity} />
            </Section>

            <Section title="Customer & Contact Information" subtitle="Applicant identity and contact details.">
              <EditableField label="First Name"        value={lead.firstName} />
              <EditableField label="Last Name"         value={lead.lastName} />
              <EditableField label="Country Code"      value={d.countryCode} />
              <EditableField label="Mobile"            value={lead.mobile} />
              <EditableField label="Alternate Mobile"  value={d.alternateMobile} />
              <EditableField label="Mobile Verified?"  value={d.mobileVerified} />
              <EditableField label="Email Verified?"   value={d.emailVerified} />
              <EditableField label="Residential Status"value={d.residentialStatus} />
            </Section>

            <Section title="Applicant Details" subtitle="Applicant profile and employment category.">
              <EditableField label="Applicant Type"       value={d.applicantType} />
              <EditableField label="Applicant Category"   value={d.applicantCategory} />
              <EditableField label="Constitution Type"    value={d.constitutionType} />
              <EditableField label="Monthly Gross Salary" value={d.monthlyGrossSalary} />
            </Section>

            <Section title="Loan Details" subtitle="Loan requirement, purpose, tenure, and property details.">
              <EditableField label="Loan Type"              value={d.loanType} />
              <EditableField label="Loan Purpose"           value={d.loanPurpose} />
              <EditableField label="Requested Loan Amount"  value={d.requestedLoanAmount} />
              <EditableField label="Loan Tenure (Years)"    value={d.loanTenureYears} />
              <EditableField label="Property Identified"    value={d.propertyIdentified} />
              <EditableField label="Project / Property Name"value={d.projectPropertyName} />
              <EditableField label="Type of Property"       value={d.typeOfProperty} />
            </Section>

            <Section title="Balance Transfer Details" subtitle="Balance transfer bank information, if applicable.">
              <EditableField label="Balance Transfer Bank"      value={d.balanceTransferBank} />
              <EditableField label="Balance Transfer Bank Name" value={d.balanceTransferBankName} />
              <EditableField label="BT Bank (Funnel)"           value={d.btBankFunnel} />
            </Section>

            <Section title="Ownership & Assignment" subtitle="Team, owner, branch, and verification assignment.">
              <EditableField label="Owner Name"            value={d.ownerName} />
              <EditableField label="LOS Owner Team"        value={d.losOwnerTeam} />
              <EditableField label="Assigned To"           value={d.assignedTo} />
              <EditableField label="Assigned To Name"      value={d.assignedToName} />
              <EditableField label="Branch Name"           value={d.branchName} />
              <EditableField label="LOS Verification User" value={d.losVerificationUser} />
            </Section>

            <Section title="Application & APS Information" subtitle="Application linkage and APS details.">
              <EditableField label="APS Number"       value={d.apsNumber} />
              <EditableField label="Loan File Status" value={d.loanFileStatus} />
            </Section>
          </div>

          {/* Sidebar column */}
          <aside className="record-side-col">

            {/* Verification */}
            <section className="side-card">
              <h3>Verification</h3>
              {[
                { label: "Mobile", value: lead.mobile,      status: d.mobileVerified },
                { label: "Email",  value: "Not captured",   status: d.emailVerified  },
              ].map((item) => (
                <div className="verify-row" key={item.label}>
                  <div>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                    <p>Status: {item.status}</p>
                  </div>
                  <button className="verify-chip">Verify</button>
                </div>
              ))}
            </section>

            {/* Lead Journey */}
            <section className="side-card">
              <h3>Lead Journey</h3>
              <div className="journey-list">
                {[
                  { num: 1, title: "Lead Created",  desc: "Basic lead details are available.", active: true },
                  { num: 2, title: "Verification",  desc: "Mobile, email, and applicant checks can be completed.", active: false },
                  { num: 3, title: "Application",   desc: "Convert lead and create loan application.", active: false },
                ].map((step) => (
                  <div className={`journey-step${step.active ? " active" : ""}`} key={step.num}>
                    <div className="journey-num">{step.num}</div>
                    <div>
                      <strong>{step.title}</strong>
                      <p>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Quick Actions */}
            <section className="side-card">
              <h3>Quick Actions</h3>
              <div className="quick-actions">
                <button className="quick-btn">Add Activity</button>
                <button className="quick-btn">Assign Lead</button>
                <button className="quick-btn">Upload Document</button>
                <button className="quick-btn primary">Convert Lead</button>
              </div>
            </section>

          </aside>
        </div>
      </main>
    </div>
  );
}

export default LeadDetailPage;
