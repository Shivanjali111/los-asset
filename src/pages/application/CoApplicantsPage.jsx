//_______________This Code was generated using GenAI tool: Codify, Please check for accuracy_______________//
import { useMemo, useState } from "react";
import "./CoApplicantsPage.css";
import CustomerIdentityPage from "./CustomerIdentityPage";
import ApplicantProfilePage from "./ApplicantProfilePage";
import IncomeEmploymentPage from "./IncomeEmploymentPage";

/* ── Icons ───────────────────────────────────────────────────────────── */
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.7">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const PencilIcon = () => (
  <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4">
    <path d="M18 6 6 18" /><path d="M6 6l12 12" />
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.4">
    <path d="M12 5v14" /><path d="M5 12h14" />
  </svg>
);
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.63 4.35 2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const MailIcon = () => (
  <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <path d="m22 6-10 7L2 6" />
  </svg>
);
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
  </svg>
);
const BriefcaseIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1" />
    <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    <path d="M3 13h18" />
  </svg>
);
const UserIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const UsersIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

/* ── Data ────────────────────────────────────────────────────────────── */
const partyTypes = [
  "Co-Applicant", "Guarantor", "Borrower",
  "Power of Attorney", "Property Owner", "Financial Co-Borrower",
];
const relationOptions = [
  "Spouse","Father","Mother","Son","Daughter",
  "Brother","Sister","Business Partner","Director","Other",
];


const defaultForm = {
  partyType: "Co-Applicant",
  relationshipWithApplicant: "Spouse",
  firstName: "", middleName: "", lastName: "",
  mobile: "", email: "",
  mobileVerified: false, emailVerified: false,
};

const PARTY_GUIDE = [
  { type: "Co-Applicant",          desc: "Income or ownership linked applicant" },
  { type: "Guarantor",             desc: "Repayment support, not primary borrower" },
  { type: "Borrower",              desc: "Financially liable party on the loan" },
  { type: "POA",                   desc: "Authorized representative for execution" },
  { type: "Property Owner",        desc: "Owner of the collateral property" },
  { type: "Financial Co-Borrower", desc: "Joint borrower sharing repayment liability" },
];

/* ── Seed helper — builds initial parties list from lead prop ────────── */
const buildInitialParties = (lead) => {
  const cd = lead?.leadDetails?.coApplicantDetails;
  if (!cd || !cd.firstName) return [];
  return [{
    id: "LEAD-CO-APPLICANT",
    partyType: "Co-Applicant",
    name: `${cd.firstName} ${cd.lastName}`,
    relation: cd.relationship || "Not Specified",
    mobile: cd.mobile || "Not captured",
    email: "Not captured",
    pan: "Pending",
    employmentType: "Pending",
    income: "Pending",
    status: "Pending Verification",
    mobileVerified: false,
    emailVerified: false,
    fromLead: true,
  }];
};

/* ── Form field components (drawer forms — always in edit mode) ───────── */
function FormField({ label, value, onChange, placeholder, type = "text", wide }) {
  return (
    <div className={`co-field${wide ? " wide" : ""}`}>
      <span className="co-field-label">{label}</span>
      <input
        className="co-input" type={type}
        value={value || ""} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function FormSelect({ label, value, onChange, options, wide }) {
  return (
    <div className={`co-field${wide ? " wide" : ""}`}>
      <span className="co-field-label">{label}</span>
      <select className="co-input co-select" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

/* ── Party Card ──────────────────────────────────────────────────────── */
function PartyCard({ party, onEdit }) {
  const isComplete = party.status === "Completed";
  const initials   = party.name.split(" ").map((n) => n[0]).slice(0, 2).join("");

  return (
    <div className="co-party-card">
      {/* Top row */}
      <div className="co-party-top">
        <div className="co-avatar">{initials}</div>
        <div className="co-party-meta">
          <span className="co-party-name">{party.name}</span>
          <div className="co-party-chips">
            {party.fromLead && <span className="co-chip from-lead">From Lead</span>}
            <span className="co-chip blue">{party.partyType}</span>
            <span className="co-chip gray">{party.relation}</span>
            <span className="co-chip gray">{party.employmentType}</span>
          </div>
        </div>
        <div className="co-party-right">
          <span className={`co-status-pill ${isComplete ? "green" : "amber"}`}>
            {party.status}
          </span>
          <button className="co-edit-btn" type="button" onClick={() => onEdit(party)}>
            <PencilIcon /> Edit
          </button>
        </div>
      </div>

      {/* Data grid */}
      <div className="co-party-data">
        <div className="co-data-cell">
          <span>Mobile</span>
          <strong>{party.mobile}</strong>
        </div>
        <div className="co-data-cell">
          <span>Email</span>
          <strong>{party.email}</strong>
        </div>
        <div className="co-data-cell">
          <span>PAN</span>
          <strong>{party.pan}</strong>
        </div>
        <div className="co-data-cell">
          <span>Net Income</span>
          <strong>{party.income}</strong>
        </div>
      </div>

      {/* Verification row */}
      <div className="co-party-verif">
        <span className={`co-verif-chip${party.mobileVerified ? " done" : ""}`}>
          <PhoneIcon /> Mobile {party.mobileVerified ? "Verified" : "Pending"}
        </span>
        <span className={`co-verif-chip${party.emailVerified ? " done" : ""}`}>
          <MailIcon /> Email {party.emailVerified ? "Verified" : "Pending"}
        </span>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────── */
function CoApplicantsPage({ lead }) {
  const [parties,            setParties]            = useState(() => buildInitialParties(lead));
  const [selectedPartyType,  setSelectedPartyType]  = useState("Co-Applicant");
  const [isPanelOpen,        setIsPanelOpen]        = useState(false);
  const [drawerStep,         setDrawerStep]         = useState("minimal");
  const [activeTab,          setActiveTab]          = useState("identity");
  const [form,               setForm]               = useState(defaultForm);
  const [editingPartyId,     setEditingPartyId]     = useState(null);

  const updateForm    = (key, val) => setForm((p) => ({ ...p, [key]: val }));
  const getFullName   = () => [form.firstName, form.middleName, form.lastName].filter(Boolean).join(" ");
  const canContinue   = Boolean(form.partyType && form.relationshipWithApplicant && form.firstName && form.lastName && form.mobile);

  const handleCloseDrawer = () => { setEditingPartyId(null); setIsPanelOpen(false); };

  const openAddPanel = () => {
    setEditingPartyId(null);
    setForm({ ...defaultForm, partyType: selectedPartyType });
    setDrawerStep("minimal");
    setActiveTab("identity");
    setIsPanelOpen(true);
  };

  const handleEditParty = (party) => {
    const parts = party.name.split(" ");
    setEditingPartyId(party.id);
    setForm({
      ...defaultForm,
      partyType: party.partyType,
      relationshipWithApplicant: party.relation,
      firstName:  parts[0] || "",
      middleName: parts.length > 2 ? parts.slice(1, -1).join(" ") : "",
      lastName:   parts.length > 1 ? parts[parts.length - 1] : "",
      mobile:         party.mobile  === "Not captured" ? "" : party.mobile,
      email:          party.email   === "Not captured" ? "" : party.email,
      mobileVerified: Boolean(party.mobileVerified),
      emailVerified:  Boolean(party.emailVerified),
    });
    setDrawerStep("details");
    setActiveTab("identity");
    setIsPanelOpen(true);
  };

  const handleSaveParty = () => {
    const fullName = getFullName();
    const existing = editingPartyId ? parties.find((p) => p.id === editingPartyId) : null;
    const saved = {
      id:             editingPartyId || `${form.partyType.toUpperCase().replace(/ /g, "-")}-${Date.now()}`,
      partyType:      form.partyType,
      name:           fullName || "New Party",
      relation:       form.relationshipWithApplicant,
      mobile:         form.mobile  || "Not captured",
      email:          form.email   || "Not captured",
      pan:            existing?.pan            || "Pending",
      employmentType: existing?.employmentType || "Pending",
      income:         existing?.income         || "Pending",
      status:         form.mobileVerified && form.emailVerified ? "Completed" : "Pending Verification",
      mobileVerified: form.mobileVerified,
      emailVerified:  form.emailVerified,
    };
    setParties((p) => editingPartyId ? p.map((item) => item.id === editingPartyId ? saved : item) : [saved, ...p]);
    setIsPanelOpen(false);
  };

  const stats = useMemo(() => {
    const completed = parties.filter((p) => p.status === "Completed").length;
    return { total: parties.length, completed, pending: parties.length - completed };
  }, [parties]);

  /* ── Render ── */
  return (
    <div className="co-page">

      {/* ── Page bar ────────────────────────────────────────────────── */}
      <div className="co-page-bar">
        <div className="co-bar-info">
          <span className="co-bar-title">Linked Parties</span>
          <span className="co-bar-sub">Co-applicants, guarantors and related parties on this application</span>
        </div>
        <div className="co-add-row">
          <select
            className="co-type-select"
            value={selectedPartyType}
            onChange={(e) => setSelectedPartyType(e.target.value)}
          >
            {partyTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <button className="co-add-btn" type="button" onClick={openAddPanel}>
            <PlusIcon /> Add {selectedPartyType}
          </button>
        </div>
      </div>

      {/* ── Requirement banner ──────────────────────────────────────── */}
      {parties.length === 0 && (
        <div className="co-req-banner">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4" /><path d="M12 16h.01" />
          </svg>
          At least 1 co-applicant or guarantor is required to proceed with this application.
        </div>
      )}

      {/* ── Two-column layout ────────────────────────────────────────── */}
      <div className="co-layout">
        <main className="co-main">
          {parties.length === 0 ? (
            <div className="co-empty-state">
              <UsersIcon />
              <strong>No parties linked yet</strong>
              <p>Use the button above to add a co-applicant, guarantor or other related party.</p>
            </div>
          ) : (
            <div className="co-party-list">
              {parties.map((party) => (
                <PartyCard key={party.id} party={party} onEdit={handleEditParty} />
              ))}
            </div>
          )}
        </main>

        <aside className="co-side">
          {/* Stats */}
          <div className="co-side-stats">
            <div>
              <strong>{stats.total}</strong>
              <span>Total</span>
            </div>
            <div>
              <strong className={stats.completed > 0 ? "green" : ""}>{stats.completed}</strong>
              <span>Completed</span>
            </div>
            <div>
              <strong className={stats.pending > 0 ? "amber" : "green"}>{stats.pending}</strong>
              <span>Pending</span>
            </div>
          </div>

          {/* Party type guidance */}
          <div className="co-side-card">
            <span className="co-side-card-title">Party Type Reference</span>
            <div className="co-guidance-list">
              {PARTY_GUIDE.map((item) => (
                <div key={item.type} className="co-guide-row">
                  <span className="co-guide-type">{item.type}</span>
                  <span className="co-guide-desc">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ── Backdrop ────────────────────────────────────────────────── */}
      <div
        className={`co-drawer-backdrop${isPanelOpen ? " open" : ""}`}
        onClick={handleCloseDrawer}
      />

      {/* ── Slide-in drawer (fixed, right edge) ─────────────────────── */}
      <aside className={`co-drawer${isPanelOpen ? " open" : ""}`}>

        {/* Header */}
        <header className="co-drawer-header">
          <div className="co-drawer-header-info">
            <span className="co-drawer-title">
              {editingPartyId ? "Edit" : "Add"} {form.partyType}
            </span>
            {drawerStep === "details" && (
              <span className="co-drawer-sub">
                {getFullName() || "New party"} · {form.relationshipWithApplicant} · {form.mobile || "Mobile pending"}
              </span>
            )}
          </div>
          <button className="co-drawer-close" type="button" onClick={handleCloseDrawer}>
            <XIcon />
          </button>
        </header>

        {/* Body */}
        <div className="co-drawer-body">

          {/* ── Minimal step ── */}
          {drawerStep === "minimal" && (
            <div className="co-minimal-form">
              <div className="co-field-grid-2">
                <FormSelect label="Party Type"                   value={form.partyType}                 onChange={(v) => updateForm("partyType", v)}                 options={partyTypes} />
                <FormSelect label="Relationship with Applicant"  value={form.relationshipWithApplicant} onChange={(v) => updateForm("relationshipWithApplicant", v)}  options={relationOptions} />
                <FormField  label="First Name"   value={form.firstName}  onChange={(v) => updateForm("firstName", v)}  placeholder="First name" />
                <FormField  label="Middle Name"  value={form.middleName} onChange={(v) => updateForm("middleName", v)} placeholder="Middle name" />
                <FormField  label="Last Name"    value={form.lastName}   onChange={(v) => updateForm("lastName", v)}   placeholder="Last name" />
              </div>

              <div className="co-contact-grid">
                <div className="co-field">
                  <span className="co-field-label">Mobile Number</span>
                  <div className="co-verify-row">
                    <input
                      className="co-input" type="tel"
                      value={form.mobile} placeholder="10-digit mobile"
                      onChange={(e) => updateForm("mobile", e.target.value)}
                    />
                    <button
                      type="button"
                      className={`co-verify-btn${form.mobileVerified ? " done" : ""}`}
                      onClick={() => updateForm("mobileVerified", true)}
                    >
                      {form.mobileVerified ? <><CheckIcon /> Verified</> : "Verify"}
                    </button>
                  </div>
                </div>

                <div className="co-field">
                  <span className="co-field-label">Email Address</span>
                  <div className="co-verify-row">
                    <input
                      className="co-input" type="email"
                      value={form.email} placeholder="Email address"
                      onChange={(e) => updateForm("email", e.target.value)}
                    />
                    <button
                      type="button"
                      className={`co-verify-btn${form.emailVerified ? " done" : ""}`}
                      onClick={() => updateForm("emailVerified", true)}
                    >
                      {form.emailVerified ? <><CheckIcon /> Verified</> : "Verify"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Mini profile preview */}
              <div className="co-mini-profile--inline">
                <div className="co-mini-top">
                  <div className="co-mini-avatar">
                    {form.firstName || form.lastName
                      ? `${form.firstName?.[0] || ""}${form.lastName?.[0] || ""}`
                      : "·"}
                  </div>
                  <div className="co-mini-info">
                    <span className="co-mini-type">{form.partyType}</span>
                    <span className="co-mini-name">{getFullName() || "New Party"}</span>
                    <span className="co-mini-relation">{form.relationshipWithApplicant}</span>
                  </div>
                </div>
                <div className="co-mini-checks">
                  <div className={`co-mini-check${form.firstName && form.lastName ? " done" : ""}`}>
                    <span>{form.firstName && form.lastName ? <CheckIcon /> : "·"}</span>
                    Name captured
                  </div>
                  <div className={`co-mini-check${form.mobile ? " done" : ""}`}>
                    <span>{form.mobile ? <CheckIcon /> : "·"}</span>
                    Mobile captured
                  </div>
                  <div className={`co-mini-check${form.mobileVerified ? " done" : ""}`}>
                    <span>{form.mobileVerified ? <CheckIcon /> : "·"}</span>
                    Mobile verified
                  </div>
                  <div className={`co-mini-check${form.emailVerified ? " done" : ""}`}>
                    <span>{form.emailVerified ? <CheckIcon /> : "·"}</span>
                    Email verified
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Details step ── */}
          {drawerStep === "details" && (
            <div className="co-details-screen">
              {/* Party strip */}
              <div className="co-party-strip">
                <div className="co-strip-avatar">
                  {getFullName().split(" ").map((n) => n[0]).slice(0, 2).join("") || "·"}
                </div>
                <div className="co-strip-info">
                  <span className="co-strip-name">{getFullName() || "New Party"}</span>
                  <span className="co-strip-meta">
                    {form.partyType} · {form.relationshipWithApplicant} · {form.mobile || "Mobile pending"}
                  </span>
                </div>
              </div>

              {/* Tabs */}
              <div className="co-panel-tabs">
                <button type="button" className={`co-panel-tab${activeTab === "identity" ? " active" : ""}`} onClick={() => setActiveTab("identity")}>
                  <ShieldIcon /> Customer Identity
                </button>
                <button type="button" className={`co-panel-tab${activeTab === "profile" ? " active" : ""}`} onClick={() => setActiveTab("profile")}>
                  <UserIcon /> Applicant Profile
                </button>
                <button type="button" className={`co-panel-tab${activeTab === "employment" ? " active" : ""}`} onClick={() => setActiveTab("employment")}>
                  <BriefcaseIcon /> Income & Employment
                </button>
              </div>

              {/* Embedded page */}
              <div className="co-embedded-step">
                {activeTab === "identity"   && <CustomerIdentityPage isCoApplicant={true} />}
                {activeTab === "profile"    && <ApplicantProfilePage isCoApplicant={true} />}
                {activeTab === "employment" && <IncomeEmploymentPage />}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="co-drawer-footer">
          <button className="co-btn-ghost" type="button" onClick={handleCloseDrawer}>
            {drawerStep === "minimal" ? "Cancel" : "Close"}
          </button>
          {drawerStep === "minimal" ? (
            <button
              className="co-btn-primary"
              type="button"
              disabled={!canContinue}
              onClick={() => setDrawerStep("details")}
            >
              Continue to Details
            </button>
          ) : (
            <button className="co-btn-primary" type="button" onClick={handleSaveParty}>
              {editingPartyId ? "Update" : "Save"} {form.partyType}
            </button>
          )}
        </footer>
      </aside>

    </div>
  );
}

export default CoApplicantsPage;
//__________________________GenAI: Generated code ends here______________________________//
