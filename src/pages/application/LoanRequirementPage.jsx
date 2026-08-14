import { useState } from "react";
import "./LoanRequirementPage.css";

/* ── Icons ───────────────────────────────────────────────────────── */
const PencilIcon = () => (
  <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);
const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.1">
    <path d="M21 12a9 9 0 0 1-15.5 6.3" /><path d="M3 12A9 9 0 0 1 18.5 5.7" />
    <path d="M18 2v4h4" /><path d="M6 22v-4H2" />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const AlertIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9v4" /><path d="M12 17h.01" />
  </svg>
);

/* ── Data ────────────────────────────────────────────────────────── */
const productOptions = [
  "Home Loan",
  "Loan Against Property",
  "Business Loan",
  "Working Capital",
  "Personal Loan",
];

const loanTypeOptions = [
  { value: "New Loan",          desc: "Fresh loan application for new funding requirement." },
  { value: "Balance Transfer",  desc: "Transfer existing loan from another bank or financial institution." },
  { value: "Top Up",            desc: "Additional amount against an existing active loan relationship." },
];

const purposeByProduct = {
  "Home Loan":              ["Purchase of New Property", "Resale Purchase", "Self Construction", "Home Extension", "Home Improvement", "Plot Purchase"],
  "Loan Against Property":  ["Business Expansion", "Working Capital", "Debt Consolidation", "Education", "Medical Expense", "Personal Requirement"],
  "Business Loan":          ["Business Expansion", "Working Capital", "Inventory Purchase", "Machinery Purchase", "Vendor Payment", "Debt Consolidation"],
  "Working Capital":        ["Inventory Funding", "Receivables Funding", "Vendor Payment", "Operational Expenses"],
  "Personal Loan":          ["Personal Requirement", "Education", "Medical Expense", "Travel", "Debt Consolidation"],
};

const btBanks = [
  "HDFC Bank", "ICICI Bank", "Axis Bank", "State Bank of India", "Kotak Mahindra Bank",
  "Bank of Baroda", "Punjab National Bank", "Bajaj Finance", "Tata Capital", "Aditya Birla Finance", "Other",
];

const mockExistingLoans = [
  { id: "LN-900112", product: "Home Loan",             loanAccountNumber: "HL7845123098",    sanctionedAmount: "5200000", outstandingAmount: "3880000", emi: "42150", interestRate: "8.75",  disbursedDate: "12 Aug 2021", status: "Active", eligibleTopUpAmount: "1200000" },
  { id: "LN-900193", product: "Loan Against Property", loanAccountNumber: "LAP9012458831",   sanctionedAmount: "3500000", outstandingAmount: "2140000", emi: "38600", interestRate: "10.25", disbursedDate: "04 Jan 2023", status: "Active", eligibleTopUpAmount: "850000"  },
];

const initialForm = {
  product:                "Home Loan",
  loanType:               "New Loan",
  loanPurpose:            "Purchase of New Property",
  requestedLoanAmount:    "5000000",
  loanTenureYears:        "15",
  repaymentType:          "EMI",
  rateType:               "Floating",
  preferredEmi:           "",
  applicantPan:           "ABCDE1234F",
  btBankName:             "",
  btLoanAccountNumber:    "",
  btOutstandingAmount:    "",
  btCurrentEmi:           "",
  btCurrentInterestRate:  "",
  btRemainingTenureMonths: "",
  btReason:               "Lower Interest Rate",
  selectedExistingLoanId: "",
  topUpAmount:            "",
};

/* ── Field components ───────────────────────────────────────────── */
function FieldRow({ label, value, onChange, editing, type = "text", placeholder }) {
  return (
    <div className="lr-field">
      <span className="lr-field-label">{label}</span>
      {editing ? (
        <input className="lr-input" type={type} value={value || ""} placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)} />
      ) : (
        <div className={`lr-field-ro${!value ? " empty" : ""}`}>{value || "—"}</div>
      )}
    </div>
  );
}

function SelectField({ label, value, onChange, editing, options }) {
  return (
    <div className="lr-field">
      <span className="lr-field-label">{label}</span>
      {editing ? (
        <select className="lr-input lr-select" value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => <option key={o} value={o}>{o || "Select…"}</option>)}
        </select>
      ) : (
        <div className={`lr-field-ro${!value ? " empty" : ""}`}>{value || "—"}</div>
      )}
    </div>
  );
}

function CurrencyField({ label, value, onChange, editing }) {
  const formatted = value ? `₹ ${Number(value).toLocaleString("en-IN")}` : "—";
  return (
    <div className="lr-field">
      <span className="lr-field-label">{label}</span>
      {editing ? (
        <div className="lr-currency-wrap">
          <span>₹</span>
          <input className="lr-currency-inner" type="number" value={value || ""}
            onChange={(e) => onChange(e.target.value)} />
        </div>
      ) : (
        <div className={`lr-field-ro${!value ? " empty" : ""}`}>{formatted}</div>
      )}
    </div>
  );
}

function SectionHead({ title, sub, editing, onEdit }) {
  return (
    <div className="lr-section-head">
      <div>
        <span className="lr-section-title">{title}</span>
        {sub && <span className="lr-section-sub">{sub}</span>}
      </div>
      <button className="lr-edit-btn" type="button" onClick={onEdit}>
        <PencilIcon /> {editing ? "Done" : "Edit"}
      </button>
    </div>
  );
}

function formatCurrency(value) {
  if (!value) return "₹0";
  return `₹ ${Number(value).toLocaleString("en-IN")}`;
}

/* ── Component ───────────────────────────────────────────────────── */
function LoanRequirementPage() {
  const [form, setForm]                     = useState(initialForm);
  const [existingLoans, setExistingLoans]   = useState([]);
  const [isFetching, setIsFetching]         = useState(false);
  const [fetchMessage, setFetchMessage]     = useState("");
  const [editing, setEditing]               = useState({ details: false, bt: false });

  const isBalanceTransfer = form.loanType === "Balance Transfer";
  const isTopUp           = form.loanType === "Top Up";
  const selectedLoan      = existingLoans.find((l) => l.id === form.selectedExistingLoanId);
  const purposeOptions    = purposeByProduct[form.product] || [];

  const updateForm = (key, val) => setForm((p) => ({ ...p, [key]: val }));
  const toggle     = (s)        => setEditing((p) => ({ ...p, [s]: !p[s] }));

  const handleProductChange = (product) => {
    const nextPurposes = purposeByProduct[product] || [];
    setForm((p) => ({ ...p, product, loanPurpose: nextPurposes[0] || "" }));
  };

  const handleLoanTypeChange = (loanType) => {
    setForm((p) => ({ ...p, loanType, selectedExistingLoanId: "", topUpAmount: "" }));
    if (loanType !== "Top Up") { setExistingLoans([]); setFetchMessage(""); }
  };

  const fetchExistingLoans = () => {
    if (!form.applicantPan) { setFetchMessage("Enter applicant PAN before fetching."); return; }
    setIsFetching(true); setFetchMessage("");
    window.setTimeout(() => {
      setExistingLoans(mockExistingLoans);
      setIsFetching(false);
      setFetchMessage(`${mockExistingLoans.length} active loans found for PAN ${form.applicantPan}.`);
    }, 900);
  };

  const selectExistingLoan = (loan) => {
    setForm((p) => ({
      ...p,
      selectedExistingLoanId: loan.id,
      product:              loan.product,
      requestedLoanAmount:  loan.eligibleTopUpAmount,
      topUpAmount:          loan.eligibleTopUpAmount,
      loanPurpose:          p.topUpPurpose || "Home Improvement",
    }));
  };

  return (
    <div className="lr-page">

      {/* ── Page bar ──────────────────────────────────────────────── */}
      <div className="lr-page-bar">
        <span className="lr-page-title">Loan Requirement</span>
        <span className="lr-page-sub">Product, type, purpose, amount and tenure for this application</span>
      </div>

      {/* ── Main panel ────────────────────────────────────────────── */}
      <div className="lr-panel">

        {/* ── Application Type ── */}
        <div className="lr-section">
          <div className="lr-section-head no-btn">
            <span className="lr-section-title">Application Type</span>
            <span className="lr-section-sub">Select the type of loan application</span>
          </div>
          <div className="lr-type-tabs">
            {loanTypeOptions.map((item) => (
              <button
                key={item.value}
                type="button"
                className={`lr-type-tab${form.loanType === item.value ? " active" : ""}`}
                onClick={() => handleLoanTypeChange(item.value)}
              >
                <span className="lr-type-name">{item.value}</span>
                <span className="lr-type-desc">{item.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="lr-divider" />

        {/* ── Loan Details ── */}
        <div className="lr-section">
          <SectionHead
            title="Loan Details"
            sub="Product, purpose, amount and repayment preference"
            editing={editing.details}
            onEdit={() => toggle("details")}
          />
          <div className="lr-field-grid-3">
            <SelectField   label="Product"           value={form.product}             onChange={handleProductChange}                            editing={editing.details} options={productOptions} />
            <SelectField   label="Loan Purpose"      value={form.loanPurpose}         onChange={(v) => updateForm("loanPurpose", v)}            editing={editing.details} options={purposeOptions} />
            <CurrencyField label="Requested Amount"  value={form.requestedLoanAmount} onChange={(v) => updateForm("requestedLoanAmount", v)}   editing={editing.details} />
            <FieldRow      label="Tenure (Years)"    value={form.loanTenureYears}     onChange={(v) => updateForm("loanTenureYears", v)}        editing={editing.details} type="number" placeholder="Years" />
            <SelectField   label="Repayment Type"    value={form.repaymentType}       onChange={(v) => updateForm("repaymentType", v)}          editing={editing.details} options={["EMI", "Bullet", "Step Up EMI", "Flexible EMI"]} />
            <SelectField   label="Rate Type"         value={form.rateType}            onChange={(v) => updateForm("rateType", v)}               editing={editing.details} options={["Floating", "Fixed", "Hybrid"]} />
            <CurrencyField label="Preferred EMI"     value={form.preferredEmi}        onChange={(v) => updateForm("preferredEmi", v)}           editing={editing.details} />
          </div>
        </div>

        {/* ── Balance Transfer Details ── */}
        {isBalanceTransfer && (
          <>
            <div className="lr-divider" />
            <div className="lr-section">
              <SectionHead
                title="Balance Transfer Details"
                sub="Existing lender and outstanding loan information"
                editing={editing.bt}
                onEdit={() => toggle("bt")}
              />
              <div className="lr-field-grid-3">
                <SelectField   label="Existing Lender"            value={form.btBankName}              onChange={(v) => updateForm("btBankName", v)}              editing={editing.bt} options={["", ...btBanks]} />
                <FieldRow      label="Loan Account Number"        value={form.btLoanAccountNumber}     onChange={(v) => updateForm("btLoanAccountNumber", v)}     editing={editing.bt} placeholder="Loan account number" />
                <CurrencyField label="Outstanding Amount"         value={form.btOutstandingAmount}     onChange={(v) => updateForm("btOutstandingAmount", v)}     editing={editing.bt} />
                <CurrencyField label="Current EMI"                value={form.btCurrentEmi}            onChange={(v) => updateForm("btCurrentEmi", v)}            editing={editing.bt} />
                <FieldRow      label="Current Interest Rate %"    value={form.btCurrentInterestRate}   onChange={(v) => updateForm("btCurrentInterestRate", v)}   editing={editing.bt} type="number" placeholder="e.g. 9.25" />
                <FieldRow      label="Remaining Tenure (Months)"  value={form.btRemainingTenureMonths} onChange={(v) => updateForm("btRemainingTenureMonths", v)} editing={editing.bt} type="number" placeholder="Months" />
                <SelectField   label="Transfer Reason"            value={form.btReason}                onChange={(v) => updateForm("btReason", v)}                editing={editing.bt} options={["Lower Interest Rate", "Top Up Requirement", "Better Service", "Longer Tenure", "Consolidation"]} />
              </div>
            </div>
          </>
        )}

        {/* ── Top Up ── */}
        {isTopUp && (
          <>
            <div className="lr-divider" />
            <div className="lr-section">
              <div className="lr-section-head no-btn">
                <span className="lr-section-title">Top Up Loan</span>
                <span className="lr-section-sub">Fetch and select an existing loan for top up</span>
              </div>

              <div className="lr-fetch-row">
                <div className="lr-field">
                  <span className="lr-field-label">Applicant PAN</span>
                  <input
                    className="lr-input"
                    value={form.applicantPan}
                    placeholder="ABCDE1234F"
                    onChange={(e) => updateForm("applicantPan", e.target.value.toUpperCase())}
                  />
                </div>
                <button className="lr-fetch-btn" type="button" onClick={fetchExistingLoans} disabled={isFetching}>
                  {isFetching ? <RefreshIcon /> : <SearchIcon />}
                  {isFetching ? "Fetching…" : "Fetch Loans"}
                </button>
              </div>

              {fetchMessage && (
                <div className={`lr-fetch-msg${existingLoans.length ? " success" : " warn"}`}>
                  {existingLoans.length ? <CheckIcon /> : <AlertIcon />}
                  {fetchMessage}
                </div>
              )}

              {existingLoans.length > 0 && (
                <div className="lr-loan-list">
                  {existingLoans.map((loan) => {
                    const isSelected = form.selectedExistingLoanId === loan.id;
                    return (
                      <button
                        key={loan.id}
                        type="button"
                        className={`lr-loan-row${isSelected ? " selected" : ""}`}
                        onClick={() => selectExistingLoan(loan)}
                      >
                        <div className="lr-loan-info">
                          <span className="lr-loan-product">{loan.product}</span>
                          <span className="lr-loan-acct">{loan.loanAccountNumber}</span>
                        </div>
                        <div className="lr-loan-stats">
                          <div><span>Sanctioned</span><strong>{formatCurrency(loan.sanctionedAmount)}</strong></div>
                          <div><span>Outstanding</span><strong>{formatCurrency(loan.outstandingAmount)}</strong></div>
                          <div><span>EMI</span><strong>{formatCurrency(loan.emi)}</strong></div>
                          <div><span>Eligible Top Up</span><strong>{formatCurrency(loan.eligibleTopUpAmount)}</strong></div>
                        </div>
                        <span className={`lr-loan-badge${isSelected ? " sel" : ""}`}>
                          {isSelected ? <><CheckIcon /> Selected</> : loan.status}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default LoanRequirementPage;