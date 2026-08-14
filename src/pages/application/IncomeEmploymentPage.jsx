import { useState } from "react";
import "./IncomeEmploymentPage.css";

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
const SendIcon = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.1">
    <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
  </svg>
);
const SpinnerIcon = () => (
  <svg className="ie-spin-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
const BriefcaseIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1" />
    <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    <path d="M3 13h18" />
  </svg>
);
const CloudIcon = () => (
  <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
  </svg>
);
const LinkIcon = () => (
  <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

/* ── Employment profile value map (API → component) ─────────────────── */
const EMPLOYMENT_PROFILE_MAP = {
  Salaried:                    "Salaried",
  "Self Employed Professional": "SEP",
  SEP:                         "SEP",
  "Self Employed Non Professional": "SENP",
  SENP:                        "SENP",
};

/* ── Seed form from leadDetails (returns only defined fields) ─────────── */
const buildFormFromLead = (leadDetails = null) => {
  const empty = {
    employmentType: "Salaried",
    employerName: "",
    employerType: "",
    designation: "",
    department: "",
    employeeId: "",
    totalExperienceYears: "",
    currentExperienceYears: "",
    salaryMode: "",
    monthlyGrossSalary: "",
    monthlyNetSalary: "",
    annualBonus: "",
    businessName: "",
    constitutionType: "",
    industryType: "",
    businessVintageYears: "",
    annualTurnover: "",
    monthlyBusinessIncome: "",
    netMonthlyIncome: "",
    professionalType: "",
    gstNumber: "",
    udyamNumber: "",
    cinNumber: "",
    businessPan: "",
    shopActNumber: "",
    officePhone: "",
    officialEmail: "",
    businessEmail: "",
    preferredContactTime: "",
    officeAddressLine1: "",
    officeAddressLine2: "",
    officeLandmark: "",
    officeCity: "",
    officeDistrict: "",
    officeState: "",
    officePincode: "",
    officeCountry: "",
  };
  const inc = leadDetails?.incomeDetails || {};
  return {
    ...empty,
    employmentType:       EMPLOYMENT_PROFILE_MAP[leadDetails?.employmentProfile] || "Salaried",
    employerType:         "Private Limited",
    totalExperienceYears: "5",
    currentExperienceYears: "5",
    employerName:         inc.employerName        || "",
    designation:          inc.designation         || "",
    monthlyGrossSalary:   inc.grossMonthlySalary != null ? String(inc.grossMonthlySalary) : "",
    monthlyNetSalary:     inc.netInHandSalary     != null ? String(inc.netInHandSalary)    : "",
  };
};

/* ── Options ─────────────────────────────────────────────────────────── */
const EMPLOYMENT_TYPES = [
  { value: "Salaried", title: "Salaried",                      sub: "Fixed salary from employer" },
  { value: "SEP",      title: "Self Employed Professional",     sub: "Doctors, CAs, consultants" },
  { value: "SENP",     title: "Self Employed Non Professional", sub: "Business owners, traders" },
];
const EMPLOYER_TYPES      = ["Government","Public Sector","Private Limited","Public Limited","Partnership","Proprietorship","MNC","Other"];
const CONSTITUTION_TYPES  = ["Proprietorship","Partnership","LLP","Private Limited","Public Limited","Trust","Society","HUF","Other"];
const INDUSTRY_TYPES      = ["Trading","Manufacturing","Services","Professional Services","Healthcare","Education","Real Estate","Retail","Transport","IT / Software","Other"];
const PROFESSIONAL_TYPES  = ["Doctor","Chartered Accountant","Consultant","Architect","Lawyer","Engineer","Interior Designer","Other Professional"];
const SALARY_MODES        = ["Bank Transfer","Cheque","Cash","Mixed"];
const CONTACT_TIMES       = ["9 AM - 10 AM","10 AM - 1 PM","1 PM - 4 PM","4 PM - 7 PM","Anytime"];

/* ── Income request configs ──────────────────────────────────────────── */
const SALARIED_REQUESTS = [
  {
    key: "bankStatement",
    title: "Bank Statement",
    tag: "Online fetch",
    tagType: "online",
    description: "Customer receives a secure OTP-based link to authorize 6-month bank statement via account aggregator.",
  },
  {
    key: "salarySlip",
    title: "Salary Slips",
    tag: "Customer upload",
    tagType: "upload",
    description: "A link is sent to the customer to upload last 3 months' salary slips from their registered mobile.",
  },
  {
    key: "form16",
    title: "Form 16 / ITR",
    tag: "Customer upload",
    tagType: "upload",
    description: "Customer receives a link to share Form 16 or ITR acknowledgement for income verification.",
  },
];

const SELFEMPLOYED_REQUESTS = [
  {
    key: "itr",
    title: "ITR",
    tag: "Online fetch",
    tagType: "online",
    description: "Initiates a secure consent link to fetch ITR data directly from the Income Tax portal.",
  },
  {
    key: "gstReturns",
    title: "GST Returns",
    tag: "Online fetch",
    tagType: "online",
    description: "Customer authorizes access to their GST filing history via the GSTN portal.",
    requiresGst: true,
  },
  {
    key: "bankStatement",
    title: "Bank Statement",
    tag: "Online fetch",
    tagType: "online",
    description: "Customer receives a secure OTP-based link to authorize 12-month bank statement via account aggregator.",
  },
];

/* ── Field components ────────────────────────────────────────────────── */
function FieldRow({ label, value, editing, onChange, placeholder, type = "text", wide }) {
  return (
    <div className={`ie-field${wide ? " wide" : ""}`}>
      <span className="ie-field-label">{label}</span>
      {editing ? (
        <input
          className="ie-input" type={type}
          value={value || ""} placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <div className="ie-field-readonly">
          {value || <span className="ie-field-empty">—</span>}
        </div>
      )}
    </div>
  );
}

function SelectField({ label, value, editing, onChange, options, wide }) {
  return (
    <div className={`ie-field${wide ? " wide" : ""}`}>
      <span className="ie-field-label">{label}</span>
      {editing ? (
        <select className="ie-input ie-select" value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
        </select>
      ) : (
        <div className="ie-field-readonly">{value || <span className="ie-field-empty">—</span>}</div>
      )}
    </div>
  );
}

function CurrencyField({ label, value, editing, onChange, placeholder, wide }) {
  const display = value ? `₹ ${Number(value).toLocaleString("en-IN")}` : "";
  return (
    <div className={`ie-field${wide ? " wide" : ""}`}>
      <span className="ie-field-label">{label}</span>
      {editing ? (
        <div className="ie-currency-wrap">
          <span>₹</span>
          <input
            type="number" className="ie-currency-inner"
            value={value || ""} placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      ) : (
        <div className="ie-field-readonly">{display || <span className="ie-field-empty">—</span>}</div>
      )}
    </div>
  );
}

/* ── Request card ────────────────────────────────────────────────────── */
function RequestCard({ title, tag, tagType, description, status, onRequest, disabled }) {
  return (
    <div className={`ie-request-item${status === "sent" ? " sent" : ""}`}>
      <div className="ie-request-body">
        <div className="ie-request-name-row">
          <span className="ie-request-title">{title}</span>
          <span className={`ie-request-tag ${tagType}`}>
            {tagType === "online" ? <CloudIcon /> : <LinkIcon />}
            {tag}
          </span>
        </div>
        <span className="ie-request-desc">{description}</span>
        {status === "sent" && (
          <div className="ie-request-sent-note">
            <CheckIcon /> Request sent · Link delivered to customer's registered mobile
          </div>
        )}
      </div>
      <div className="ie-request-ctrl">
        {status === "idle" && (
          <button className="ie-btn-primary small" type="button" onClick={onRequest} disabled={disabled}>
            <SendIcon /> Send Request
          </button>
        )}
        {status === "sending" && (
          <button className="ie-btn-primary small" type="button" disabled>
            <SpinnerIcon /> Sending…
          </button>
        )}
        {status === "sent" && (
          <span className="ie-badge green"><CheckIcon /> Sent</span>
        )}
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────── */
function IncomeEmploymentPage({ lead }) {
  const [form, setForm]               = useState(() => buildFormFromLead(lead?.leadDetails ?? null));
  const [isEditing, setIsEditing]     = useState({
    employer: false, income: false, identifiers: false,
    address: false,  communication: false,
  });
  const [requestStatuses, setRequestStatuses] = useState({
    bankStatement: "idle", salarySlip: "idle", form16: "idle",
    itr: "idle",           gstReturns: "idle",
  });

  const isSalaried     = form.employmentType === "Salaried";
  const isSEP          = form.employmentType === "SEP";
  const isSelfEmployed = isSEP || form.employmentType === "SENP";

  const updateForm    = (key, val) => setForm((p) => ({ ...p, [key]: val }));
  const toggleSection = (key) => setIsEditing((p) => ({ ...p, [key]: !p[key] }));

  const handleTypeChange = (val) => {
    updateForm("employmentType", val);
    setRequestStatuses({ bankStatement: "idle", salarySlip: "idle", form16: "idle", itr: "idle", gstReturns: "idle" });
    setIsEditing({ employer: false, income: false, identifiers: false, address: false, communication: false });
  };

  const sendRequest = (key) => {
    setRequestStatuses((p) => ({ ...p, [key]: "sending" }));
    window.setTimeout(() => setRequestStatuses((p) => ({ ...p, [key]: "sent" })), 1200);
  };

  const currentRequests = isSalaried ? SALARIED_REQUESTS : SELFEMPLOYED_REQUESTS;

  return (
    <div className="ie-page">

      {/* ── Employment Type ──────────────────────────────────────────── */}
      <div className="ie-section">
        <div className="ie-section-head">
          <div>
            <span className="ie-section-title">Employment Type</span>
            <span className="ie-section-sub">Select the category that best describes the applicant's employment</span>
          </div>
        </div>
        <div className="ie-type-grid">
          {EMPLOYMENT_TYPES.map((t) => (
            <button
              key={t.value} type="button"
              className={`ie-type-card${form.employmentType === t.value ? " active" : ""}`}
              onClick={() => handleTypeChange(t.value)}
            >
              <div className="ie-type-icon"><BriefcaseIcon /></div>
              <div className="ie-type-text">
                <span className="ie-type-title">{t.title}</span>
                <span className="ie-type-sub">{t.sub}</span>
              </div>
              <span className="ie-type-radio" />
            </button>
          ))}
        </div>
      </div>

      <div className="ie-divider" />

      {/* ── Employer / Business Details ──────────────────────────────── */}
      <div className="ie-section">
        <div className="ie-section-head">
          <div>
            <span className="ie-section-title">
              {isSalaried ? "Employer Details" : isSEP ? "Practice Details" : "Business Details"}
            </span>
            <span className="ie-section-sub">
              {isSalaried ? "Current employment and organisation information" : "Business or practice information"}
            </span>
          </div>
          <button className="ie-edit-btn" type="button" onClick={() => toggleSection("employer")}>
            {isEditing.employer ? <><CheckIcon /> Done</> : <><PencilIcon /> Edit</>}
          </button>
        </div>

        {isSalaried && (
          <div className="ie-field-grid-3">
            <FieldRow    label="Employer Name"              value={form.employerName}           editing={isEditing.employer} placeholder="Employer / company name" onChange={(v) => updateForm("employerName", v)} />
            <SelectField label="Employer Type"              value={form.employerType}           editing={isEditing.employer} options={EMPLOYER_TYPES}              onChange={(v) => updateForm("employerType", v)} />
            <FieldRow    label="Designation"                value={form.designation}            editing={isEditing.employer} placeholder="Designation"             onChange={(v) => updateForm("designation", v)} />
            <FieldRow    label="Department"                 value={form.department}             editing={isEditing.employer} placeholder="Department"              onChange={(v) => updateForm("department", v)} />
            <FieldRow    label="Employee ID"                value={form.employeeId}             editing={isEditing.employer} placeholder="Employee ID"             onChange={(v) => updateForm("employeeId", v)} />
            <SelectField label="Salary Mode"                value={form.salaryMode}             editing={isEditing.employer} options={SALARY_MODES}                onChange={(v) => updateForm("salaryMode", v)} />
            <FieldRow    label="Total Experience (years)"   value={form.totalExperienceYears}   editing={isEditing.employer} placeholder="Years" type="number"     onChange={(v) => updateForm("totalExperienceYears", v)} />
            <FieldRow    label="Current Employer (years)"   value={form.currentExperienceYears} editing={isEditing.employer} placeholder="Years" type="number"     onChange={(v) => updateForm("currentExperienceYears", v)} />
          </div>
        )}

        {isSelfEmployed && (
          <div className="ie-field-grid-3">
            <FieldRow label={isSEP ? "Practice / Firm Name" : "Business Name"} value={form.businessName}       editing={isEditing.employer} placeholder="Name"    onChange={(v) => updateForm("businessName", v)} />
            {isSEP && (
              <SelectField label="Professional Type"  value={form.professionalType}     editing={isEditing.employer} options={PROFESSIONAL_TYPES}  onChange={(v) => updateForm("professionalType", v)} />
            )}
            <SelectField label="Constitution Type"    value={form.constitutionType}     editing={isEditing.employer} options={CONSTITUTION_TYPES}   onChange={(v) => updateForm("constitutionType", v)} />
            <SelectField label="Industry Type"        value={form.industryType}         editing={isEditing.employer} options={INDUSTRY_TYPES}        onChange={(v) => updateForm("industryType", v)} />
            <FieldRow    label="Business Vintage (years)" value={form.businessVintageYears} editing={isEditing.employer} placeholder="Years" type="number" onChange={(v) => updateForm("businessVintageYears", v)} />
          </div>
        )}
      </div>

      <div className="ie-divider" />

      {/* ── Salary / Income Details + Requests ──────────────────────── */}
      <div className="ie-section">
        <div className="ie-section-head">
          <div>
            <span className="ie-section-title">{isSalaried ? "Salary Details" : "Income Details"}</span>
            <span className="ie-section-sub">
              {isSalaried ? "Monthly income declaration" : "Business turnover and net income"}
            </span>
          </div>
          <button className="ie-edit-btn" type="button" onClick={() => toggleSection("income")}>
            {isEditing.income ? <><CheckIcon /> Done</> : <><PencilIcon /> Edit</>}
          </button>
        </div>

        {isSalaried ? (
          <div className="ie-field-grid-3">
            <CurrencyField label="Monthly Gross Salary" value={form.monthlyGrossSalary} editing={isEditing.income} placeholder="Gross salary" onChange={(v) => updateForm("monthlyGrossSalary", v)} />
            <CurrencyField label="Monthly Net Salary"   value={form.monthlyNetSalary}   editing={isEditing.income} placeholder="Net salary"   onChange={(v) => updateForm("monthlyNetSalary", v)} />
            <CurrencyField label="Annual Bonus"         value={form.annualBonus}         editing={isEditing.income} placeholder="Annual bonus" onChange={(v) => updateForm("annualBonus", v)} />
          </div>
        ) : (
          <div className="ie-field-grid-3">
            <CurrencyField label="Annual Turnover"         value={form.annualTurnover}        editing={isEditing.income} placeholder="Annual turnover"         onChange={(v) => updateForm("annualTurnover", v)} />
            <CurrencyField label="Monthly Business Income" value={form.monthlyBusinessIncome} editing={isEditing.income} placeholder="Monthly business income" onChange={(v) => updateForm("monthlyBusinessIncome", v)} />
            <CurrencyField label="Net Monthly Income"      value={form.netMonthlyIncome}      editing={isEditing.income} placeholder="Net monthly income"       onChange={(v) => updateForm("netMonthlyIncome", v)} />
          </div>
        )}

        {/* ── Income document requests ──────────────── */}
        <div className="ie-requests-block">
          <span className="ie-requests-heading">Income Documents</span>
          <div className="ie-request-list">
            {currentRequests.map((req) => (
              <RequestCard
                key={req.key}
                title={req.title}
                tag={req.tag}
                tagType={req.tagType}
                description={req.description}
                status={requestStatuses[req.key]}
                onRequest={() => sendRequest(req.key)}
                disabled={req.requiresGst && !form.gstNumber}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Business Identifiers (self-employed only) ────────────────── */}
      {isSelfEmployed && (
        <>
          <div className="ie-divider" />
          <div className="ie-section">
            <div className="ie-section-head">
              <div>
                <span className="ie-section-title">Business Identifiers</span>
                <span className="ie-section-sub">GST, Udyam, CIN and registration details</span>
              </div>
              <button className="ie-edit-btn" type="button" onClick={() => toggleSection("identifiers")}>
                {isEditing.identifiers ? <><CheckIcon /> Done</> : <><PencilIcon /> Edit</>}
              </button>
            </div>
            <div className="ie-field-grid-3">
              <FieldRow label="GST Number"          value={form.gstNumber}     editing={isEditing.identifiers} placeholder="27ABCDE1234F1Z5"       onChange={(v) => updateForm("gstNumber", v.toUpperCase())} />
              <FieldRow label="Udyam Number"         value={form.udyamNumber}   editing={isEditing.identifiers} placeholder="UDYAM-MH-19-0012345"   onChange={(v) => updateForm("udyamNumber", v.toUpperCase())} />
              <FieldRow label="CIN Number"           value={form.cinNumber}     editing={isEditing.identifiers} placeholder="U72900MH2020PTC123456"  onChange={(v) => updateForm("cinNumber", v.toUpperCase())} />
              <FieldRow label="Business PAN"         value={form.businessPan}   editing={isEditing.identifiers} placeholder="ABCDE1234F"             onChange={(v) => updateForm("businessPan", v.toUpperCase())} />
              <FieldRow label="Shop Act / Trade Reg" value={form.shopActNumber} editing={isEditing.identifiers} placeholder="Registration number"    onChange={(v) => updateForm("shopActNumber", v.toUpperCase())} />
            </div>
          </div>
        </>
      )}

      <div className="ie-divider" />

      {/* ── Office / Business Address ────────────────────────────────── */}
      <div className="ie-section">
        <div className="ie-section-head">
          <div>
            <span className="ie-section-title">{isSalaried ? "Office Address" : "Business Address"}</span>
            <span className="ie-section-sub">
              {isSalaried ? "Employer's office location" : "Primary place of business or practice"}
            </span>
          </div>
          <button className="ie-edit-btn" type="button" onClick={() => toggleSection("address")}>
            {isEditing.address ? <><CheckIcon /> Done</> : <><PencilIcon /> Edit</>}
          </button>
        </div>
        <div className="ie-field-grid-2">
          <FieldRow label="Line 1"   value={form.officeAddressLine1} editing={isEditing.address} wide placeholder="Building / office / shop" onChange={(v) => updateForm("officeAddressLine1", v)} />
          <FieldRow label="Line 2"   value={form.officeAddressLine2} editing={isEditing.address} wide placeholder="Street / area"            onChange={(v) => updateForm("officeAddressLine2", v)} />
          <FieldRow label="Landmark" value={form.officeLandmark}     editing={isEditing.address}      placeholder="Nearby landmark"          onChange={(v) => updateForm("officeLandmark", v)} />
          <FieldRow label="City"     value={form.officeCity}         editing={isEditing.address}      placeholder="City"                     onChange={(v) => updateForm("officeCity", v)} />
          <FieldRow label="District" value={form.officeDistrict}     editing={isEditing.address}      placeholder="District"                 onChange={(v) => updateForm("officeDistrict", v)} />
          <FieldRow label="State"    value={form.officeState}        editing={isEditing.address}      placeholder="State"                    onChange={(v) => updateForm("officeState", v)} />
          <FieldRow label="PIN Code" value={form.officePincode}      editing={isEditing.address}      placeholder="PIN code"                 onChange={(v) => updateForm("officePincode", v)} />
          <FieldRow label="Country"  value={form.officeCountry}      editing={isEditing.address}      placeholder="Country"                  onChange={(v) => updateForm("officeCountry", v)} />
        </div>
      </div>

      <div className="ie-divider" />

      {/* ── Communication ────────────────────────────────────────────── */}
      <div className="ie-section">
        <div className="ie-section-head">
          <div>
            <span className="ie-section-title">Communication</span>
            <span className="ie-section-sub">Office contact details and preferred reach time</span>
          </div>
          <button className="ie-edit-btn" type="button" onClick={() => toggleSection("communication")}>
            {isEditing.communication ? <><CheckIcon /> Done</> : <><PencilIcon /> Edit</>}
          </button>
        </div>
        <div className="ie-field-grid-3">
          <FieldRow label={isSalaried ? "Office Phone" : "Business Phone"}
            value={form.officePhone} editing={isEditing.communication}
            placeholder="Phone number" onChange={(v) => updateForm("officePhone", v)} />
          {isSalaried ? (
            <FieldRow label="Official Email" value={form.officialEmail} editing={isEditing.communication}
              type="email" placeholder="email@company.com" onChange={(v) => updateForm("officialEmail", v)} />
          ) : (
            <FieldRow label="Business Email" value={form.businessEmail} editing={isEditing.communication}
              type="email" placeholder="email@business.com" onChange={(v) => updateForm("businessEmail", v)} />
          )}
          <SelectField label="Preferred Contact Time" value={form.preferredContactTime}
            editing={isEditing.communication} options={CONTACT_TIMES}
            onChange={(v) => updateForm("preferredContactTime", v)} />
        </div>
      </div>

    </div>
  );
}

export default IncomeEmploymentPage;