import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { generateClient } from "aws-amplify/api";
import "./LeadDetailPage.css";

import { EMAIL_TEMPLATES } from "../templates/emailTemplates";
import { renderTemplate } from "../templates/templateRenderer";
import { sendEmail } from "../services/emailService";

/* ══ SVG ICONS ══ */
const LogoutIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>);
const BackIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>);
const CollapseIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>);
const ExpandIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>);
const PencilIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>);
const PhoneIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.63 4.35 2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>);
const TaskIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>);
const MailIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>);
const NoteIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>);
const XIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);
const CheckIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>);
const BanIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>);
const TrashIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>);
const UploadIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>);
const SaveIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>);

/* ══ FIELD OPTIONS ══ */
const FIELD_OPTIONS = {
  product: ["Home Loan", "Loan Against Property", "Balance Transfer", "Top Up Loan", "Personal Loan"],
  loanType: ["Home Loan", "Loan Against Property", "Balance Transfer", "Top Up Loan", "Personal Loan"],
  leadStage: ["New", "In Progress", "Converted", "Disqualified"],
  leadOrigin: ["Direct", "Branch Walk-in", "Referral", "Online", "DSA", "Channel Partner", "Social Media"],
  leadSubSource: ["Google Ads", "Meta Ads", "Walk-In", "Call Center", "Agent", "Website", "Email Campaign"],
  generationMode: ["Manual", "Automatic", "API", "Import", "Web Form"],
  consumerSystemName: ["LOS Web", "Mobile App", "API", "Import", "Third Party"],
  applicantType: ["Individual", "Joint", "Company"],
  applicantCategory: ["Salaried", "Self-Employed Professional", "Self-Employed Non-Professional", "NRI", "Business"],
  constitutionType: ["Individual", "Partnership", "Pvt Ltd", "LLP", "OPC", "Trust", "HUF"],
  loanPurpose: ["Purchase", "Construction", "Renovation / Extension", "Balance Transfer", "Top Up", "Plot Purchase", "Plot + Construction"],
  propertyIdentified: ["Yes", "No"],
  typeOfProperty: ["Flat / Apartment", "Independent House", "Villa", "Plot", "Row House", "Commercial Office", "Warehouse", "Industrial"],
  residentialStatus: ["Resident Indian", "Non-Resident Indian (NRI)", "Person of Indian Origin (PIO)"],
  loanFileStatus: ["Lead Draft", "Application In Progress", "Sanctioned", "Disbursed", "Rejected", "On Hold"],
  losOwnerTeam: ["Sales Team", "Credit Team", "Operations", "Legal", "Technical", "Collections"],
  countryCode: ["+91", "+1", "+44", "+61", "+971", "+65", "+60"],
};

/* ══ FIELD DEFINITIONS ══ */
const fieldDefs = {
  leadNumber: { type: "text", readonly: true },
  product: { type: "select", options: FIELD_OPTIONS.product },
  leadStage: { type: "select", options: FIELD_OPTIONS.leadStage },
  leadOrigin: { type: "select", options: FIELD_OPTIONS.leadOrigin },
  leadSubSource: { type: "select", options: FIELD_OPTIONS.leadSubSource },
  leadSubSubSource: { type: "text" },
  leadSubDisposition: { type: "text" },
  generationMode: { type: "select", options: FIELD_OPTIONS.generationMode },
  consumerSystemName: { type: "select", options: FIELD_OPTIONS.consumerSystemName },
  leadAge: { type: "text", readonly: true },
  daysSinceLastActivity: { type: "number", readonly: true },
  firstName: { type: "text" },
  lastName: { type: "text" },
  countryCode: { type: "select", options: FIELD_OPTIONS.countryCode },
  mobile: { type: "tel" },
  alternateMobile: { type: "tel" },
  email: { type: "email" },
  mobileVerified: { type: "text", readonly: true },
  emailVerified: { type: "text", readonly: true },
  residentialStatus: { type: "select", options: FIELD_OPTIONS.residentialStatus },
  applicantType: { type: "select", options: FIELD_OPTIONS.applicantType },
  applicantCategory: { type: "select", options: FIELD_OPTIONS.applicantCategory },
  constitutionType: { type: "select", options: FIELD_OPTIONS.constitutionType },
  monthlyGrossSalary: { type: "currency" },
  loanType: { type: "select", options: FIELD_OPTIONS.loanType },
  loanPurpose: { type: "select", options: FIELD_OPTIONS.loanPurpose },
  requestedLoanAmount: { type: "currency" },
  loanTenureYears: { type: "number" },
  propertyIdentified: { type: "select", options: FIELD_OPTIONS.propertyIdentified },
  projectPropertyName: { type: "text" },
  typeOfProperty: { type: "select", options: FIELD_OPTIONS.typeOfProperty },
  balanceTransferBank: { type: "text" },
  balanceTransferBankName: { type: "text" },
  btBankFunnel: { type: "text" },
  ownerName: { type: "text" },
  losOwnerTeam: { type: "select", options: FIELD_OPTIONS.losOwnerTeam },
  assignedTo: { type: "text" },
  assignedToName: { type: "text" },
  branchName: { type: "text" },
  losVerificationUser: { type: "text" },
  apsNumber: { type: "text" },
  loanFileStatus: { type: "select", options: FIELD_OPTIONS.loanFileStatus },
};

/* ══ DATA HELPERS ══ */
const normalizeYesNo = (value) => {
  if (value === true) return "Yes";
  if (value === false) return "No";

  const text = String(value || "").trim().toLowerCase();
  if (["yes", "y", "true", "verified"].includes(text)) return "Yes";
  if (["no", "n", "false", "pending", "unverified"].includes(text)) return "No";

  return value || "No";
};

const buildLeadDetails = (lead = {}) => ({
  firstName: lead.firstName || "",
  lastName: lead.lastName || "",
  mobile: lead.mobile || "Not captured",
  email: lead.email || "Not captured",
  alternateMobile: lead.alternateMobile || "—",
  applicantCategory: lead.applicantCategory || "Salaried",
  applicantType: lead.applicantType || "Individual",
  apsNumber: lead.apsNumber || "—",
  assignedTo: lead.assignedTo || "USR-1024",
  assignedToName: lead.assignedToName || lead.owner || "Sales User",
  balanceTransferBank: lead.balanceTransferBank || "—",
  balanceTransferBankName: lead.balanceTransferBankName || "—",
  branchName: lead.branchName || "Mumbai Andheri Branch",
  btBankFunnel: lead.btBankFunnel || "—",
  constitutionType: lead.constitutionType || "Individual",
  consumerSystemName: lead.consumerSystemName || "LOS Web",
  countryCode: lead.countryCode || "+91",
  daysSinceLastActivity: lead.daysSinceLastActivity || "0",
  emailVerified: normalizeYesNo(lead.emailVerified ?? lead.emailverified ?? lead.email_verified),
  generationMode: lead.generationMode || "Manual",
  leadAge: lead.leadAge || "0 Days",
  leadNumber: lead.leadNumber || lead.id || "",
  leadOrigin: lead.leadOrigin || lead.source || "Direct",
  leadStage: lead.leadStage || lead.status || "New",
  leadSubDisposition: lead.leadSubDisposition || "—",
  leadSubSource: lead.leadSubSource || "—",
  leadSubSubSource: lead.leadSubSubSource || "—",
  loanFileStatus: lead.loanFileStatus || "Lead Draft",
  loanPurpose: lead.loanPurpose || "Purchase",
  loanTenureYears: lead.loanTenureYears || "20",
  loanType: lead.loanType || lead.product || "Home Loan",
  losOwnerTeam: lead.losOwnerTeam || "Sales Team",
  losVerificationUser: lead.losVerificationUser || "—",
  mobileVerified: normalizeYesNo(lead.mobileVerified ?? lead.mobileverified ?? lead.mobile_verified),
  monthlyGrossSalary: lead.monthlyGrossSalary || "₹85,000",
  ownerName: lead.ownerName || lead.owner || "Sales User",
  product: lead.product || "Home Loan",
  projectPropertyName: lead.projectPropertyName || "—",
  propertyIdentified: lead.propertyIdentified || "No",
  requestedLoanAmount: lead.requestedLoanAmount || "₹45,00,000",
  residentialStatus: lead.residentialStatus || "Resident Indian",
  typeOfProperty: lead.typeOfProperty || "Flat / Apartment",
});

const STATUS_STEPS = ["New", "In Progress", "Converted"];
const SEND_MOBILE_VERIFICATION_API_URL = "https://j0e80xdyw4.execute-api.ap-south-1.amazonaws.com/los-send-mobile-verification";

const validateIndianMobileNumber = (mobile = "") => {
  const cleaned = String(mobile).replace(/\D/g, "");
  return /^[6-9]\d{9}$/.test(cleaned);
};

const validateEmailAddress = (email = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());

const buildEmailVerificationLink = ({ email }) => {
  const emailParam = encodeURIComponent(email || "");
  return `https://main.d3prbk14vc3ef9.amplifyapp.com/email/${emailParam}`;
};

const useVerificationState = (leadData) => {
  const [verificationSent, setVerificationSent] = useState({ mobile: false, email: false });
  const [isLoading, setIsLoading] = useState({ mobile: false, email: false });
  const [errorMessage, setErrorMessage] = useState({ mobile: "", email: "" });
  const [successMessage, setSuccessMessage] = useState({ mobile: "", email: "" });

  const handleVerify = async (type) => {
    setErrorMessage(prev => ({ ...prev, [type]: "" }));
    setSuccessMessage(prev => ({ ...prev, [type]: "" }));

    if (type === "mobile") {
      const mobileNumber = leadData?.mobile;
      if (!mobileNumber || mobileNumber === "Not captured") {
        setErrorMessage(prev => ({ ...prev, mobile: "Mobile number is not available." }));
        return;
      }
      if (!validateIndianMobileNumber(mobileNumber)) {
        setErrorMessage(prev => ({ ...prev, mobile: "Please enter a valid Indian mobile number." }));
        return;
      }
      try {
        setIsLoading(prev => ({ ...prev, mobile: true }));
        const response = await fetch(SEND_MOBILE_VERIFICATION_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mobileNumber })
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          setErrorMessage(prev => ({ ...prev, mobile: data.message || "Failed to send SMS. Please try again." }));
          return;
        }
        setSuccessMessage(prev => ({ ...prev, mobile: "Verification link has been sent successfully." }));
        setVerificationSent(prev => ({ ...prev, mobile: true }));
      } catch (error) {
        console.error("Error while calling SMS API:", error);
        setErrorMessage(prev => ({ ...prev, mobile: "Unable to connect to SMS service. Please check API Gateway URL and CORS configuration." }));
      } finally {
        setIsLoading(prev => ({ ...prev, mobile: false }));
      }
      return;
    }

    if (type === "email") {
      const emailAddress = leadData?.email;
      if (!emailAddress || emailAddress === "Not captured") {
        setErrorMessage(prev => ({ ...prev, email: "Email address is not available." }));
        return;
      }
      if (!validateEmailAddress(emailAddress)) {
        setErrorMessage(prev => ({ ...prev, email: "Please enter a valid email address." }));
        return;
      }
      try {
        setIsLoading(prev => ({ ...prev, email: true }));
        const customerName = `${leadData?.firstName || ""} ${leadData?.lastName || ""}`.trim() || "Customer";
        const verificationLink = buildEmailVerificationLink({ leadNumber: leadData?.leadNumber, email: emailAddress });
        const renderedEmail = renderTemplate(EMAIL_TEMPLATES.EMAIL_VERIFICATION, {
          customerName,
          leadNumber: leadData?.leadNumber || "",
          product: leadData?.product || "",
          loanType: leadData?.loanType || "",
          requestedLoanAmount: leadData?.requestedLoanAmount || "",
          branchName: leadData?.branchName || "",
          verificationLink
        });
        await sendEmail({ toEmail: emailAddress, subject: renderedEmail.subject, bodyHtml: renderedEmail.bodyHtml });
        setSuccessMessage(prev => ({ ...prev, email: "Verification email has been sent successfully." }));
        setVerificationSent(prev => ({ ...prev, email: true }));
      } catch (error) {
        console.error("Error while sending verification email:", error);
        setErrorMessage(prev => ({ ...prev, email: error.message || "Unable to send verification email. Please check API Gateway, Lambda, SES and CORS configuration." }));
      } finally {
        setIsLoading(prev => ({ ...prev, email: false }));
      }
    }
  };

  const handleResend = async (type) => {
    setVerificationSent(prev => ({ ...prev, [type]: false }));
    await handleVerify(type);
  };

  return { verificationSent, isLoading, errorMessage, successMessage, handleVerify, handleResend };
};

const formatTime = () => new Date().toLocaleString("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit"
});

const formatFileSize = (b) => b < 1024 ? b + " B" : b < 1048576 ? (b / 1024).toFixed(1) + " KB" : (b / 1048576).toFixed(1) + " MB";

const navItems = [
  { icon: "▦", label: "Dashboard", active: false, isBack: true },
  { icon: "◎", label: "Leads", active: true, isBack: false },
  { icon: "▣", label: "Loan Files", active: false, isBack: false },
  { icon: "◌", label: "Applicants", active: false, isBack: false },
  { icon: "□", label: "Documents", active: false, isBack: false },
  { icon: "◇", label: "Approvals", active: false, isBack: false },
];

/* ══ RICH TEXT EDITOR ══ */
function RichTextEditor({ onChange, placeholder, value }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && value !== undefined && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  const exec = (cmd, val) => {
    document.execCommand(cmd, false, val || null);
    ref.current?.focus();
    if (onChange) onChange(ref.current?.innerHTML || "");
  };

  return (
    <div className="rte-wrap">
      <div className="rte-bar">
        <button type="button" className="rte-btn" onMouseDown={(e) => { e.preventDefault(); exec("bold"); }} title="Bold"><b>B</b></button>
        <button type="button" className="rte-btn" onMouseDown={(e) => { e.preventDefault(); exec("italic"); }} title="Italic"><i>I</i></button>
        <button type="button" className="rte-btn" onMouseDown={(e) => { e.preventDefault(); exec("underline"); }} title="Underline"><u>U</u></button>
        <span className="rte-sep" />
        <button type="button" className="rte-btn" onMouseDown={(e) => { e.preventDefault(); exec("insertUnorderedList"); }} title="Bullet list">• List</button>
        <button type="button" className="rte-btn" onMouseDown={(e) => { e.preventDefault(); exec("insertOrderedList"); }} title="Numbered list">1. List</button>
        <span className="rte-sep" />
        <select className="rte-select" onMouseDown={(e) => e.stopPropagation()} onChange={(e) => { exec("fontSize", e.target.value); e.target.value = ""; }}>
          <option value="">Size</option>
          <option value="1">Small</option>
          <option value="3">Normal</option>
          <option value="5">Large</option>
        </select>
        <span className="rte-sep" />
        <button type="button" className="rte-btn rte-clear" onMouseDown={(e) => { e.preventDefault(); exec("removeFormat"); }} title="Clear formatting">✕ Clear</button>
      </div>
      <div
        ref={ref}
        className="rte-area"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder || "Write your message…"}
        onInput={() => onChange && onChange(ref.current?.innerHTML || "")}
      />
    </div>
  );
}

/* ══ EDITABLE FIELD ══ */
function EditableField({ label, fieldKey, value, type = "text", options = null, sectionId, sectionEditMode, sectionDraft, onSectionDraftChange, editingField, onEdit, onChange, onSave, onCancel }) {
  const def = fieldDefs[fieldKey] || {};
  const fieldType = def.type || type;
  const fieldOptions = def.options || options;
  const isReadonly = def.readonly;
  const isInSectionEdit = sectionEditMode === sectionId;
  const isIndividualEdit = !isInSectionEdit && editingField?.key === fieldKey;

  const renderInput = (currentVal, onChg) => {
    if (isReadonly) return <strong className="field-value field-readonly">{currentVal || "—"}</strong>;
    if (fieldType === "select" && fieldOptions) {
      return (
        <select className="field-inline-select" value={currentVal || ""} onChange={(e) => onChg(e.target.value)} autoFocus={!isInSectionEdit}>
          <option value="">— Select —</option>
          {fieldOptions.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    }
    if (fieldType === "currency") return <input className="field-inline-input currency-input" type="text" value={currentVal || ""} onChange={(e) => onChg(e.target.value)} autoFocus={!isInSectionEdit} placeholder="e.g. ₹50,00,000" />;
    if (fieldType === "tel") return <input className="field-inline-input" type="tel" value={currentVal || ""} onChange={(e) => onChg(e.target.value)} autoFocus={!isInSectionEdit} />;
    if (fieldType === "email") return <input className="field-inline-input" type="email" value={currentVal || ""} onChange={(e) => onChg(e.target.value)} autoFocus={!isInSectionEdit} />;
    if (fieldType === "number") return <input className="field-inline-input" type="number" value={currentVal || ""} onChange={(e) => onChg(e.target.value)} autoFocus={!isInSectionEdit} />;
    return <input className="field-inline-input" type="text" value={currentVal || ""} onChange={(e) => onChg(e.target.value)} autoFocus={!isInSectionEdit} onKeyDown={(e) => { if (e.key === "Enter") onSave(); if (e.key === "Escape") onCancel(); }} />;
  };

  if (isInSectionEdit) {
    const draftVal = sectionDraft[fieldKey] !== undefined ? sectionDraft[fieldKey] : (value || "");
    return (
      <div className="record-field section-edit-active">
        <div className="record-field-content">
          <span className="field-label">{label}{isReadonly && <span className="field-ro-tag">auto</span>}</span>
          {renderInput(draftVal, (v) => onSectionDraftChange(fieldKey, v))}
        </div>
      </div>
    );
  }

  return (
    <div className={`record-field${isIndividualEdit ? " editing" : ""}`}>
      <div className="record-field-content">
        <span className="field-label">{label}</span>
        {isIndividualEdit ? (
          <>
            {renderInput(editingField.value, onChange)}
            <div className="field-inline-actions">
              <button className="field-save-btn" onClick={onSave}><CheckIcon /> Save</button>
              <button className="field-cancel-btn" onClick={onCancel}>Cancel</button>
            </div>
          </>
        ) : (
          <strong className="field-value">{value || "—"}</strong>
        )}
      </div>
      {!isIndividualEdit && !isReadonly && (
        <button className="field-edit-btn" title={`Edit ${label}`} onClick={() => onEdit(fieldKey, value)}>
          <PencilIcon />
        </button>
      )}
    </div>
  );
}

/* ══ SECTION WRAPPER ══ */
function Section({ id, title, subtitle, sectionIcon, accentColor, sectionEditMode, onSectionEdit, onSectionSave, onSectionCancel, children }) {
  const isEditing = sectionEditMode === id;
  return (
    <section className={`record-section${isEditing ? " section-in-edit" : ""}`}>
      <div className="record-section-header">
        <div className="section-title-group">
          <div className="section-icon-badge" style={{ background: accentColor + "18", color: accentColor }}>{sectionIcon}</div>
          <div>
            <h3>{title}</h3>
            {subtitle && <p className="section-subtitle">{subtitle}</p>}
          </div>
        </div>
        <div className="section-header-actions">
          {isEditing ? (
            <>
              <button className="section-save-btn" onClick={onSectionSave}><SaveIcon /> Save All</button>
              <button className="section-cancel-btn" onClick={onSectionCancel}>Cancel</button>
            </>
          ) : (
            <button className="section-edit-btn" onClick={() => onSectionEdit(id)}><PencilIcon /> Edit</button>
          )}
        </div>
      </div>
      <div className="record-field-grid">{children}</div>
    </section>
  );
}

function StatusPath({ currentStatus, onStepClick }) {
  const activeIdx = STATUS_STEPS.indexOf(currentStatus);
  const isDisq = currentStatus === "Disqualified";
  return (
    <div className="sf-path-wrap">
      <div className="sf-stages">
        {STATUS_STEPS.map((step, idx) => {
          const isActive = currentStatus === step;
          const isCompleted = !isDisq && activeIdx > idx;
          const cls = ["sf-stage", isActive ? "sf-active" : "", isCompleted ? "sf-completed" : "", idx === 0 ? "sf-first" : "", idx === STATUS_STEPS.length - 1 ? "sf-last" : ""].filter(Boolean).join(" ");
          return (
            <button key={step} className={cls} onClick={() => onStepClick(step)} title={`Move to ${step}`}>
              {isCompleted && <span className="sf-check"><CheckIcon /></span>}
              <span className="sf-label">{step}</span>
            </button>
          );
        })}
      </div>
      <button className={`sf-disq-btn${isDisq ? " sf-disq-active" : ""}`} onClick={() => onStepClick("Disqualified")}>
        <BanIcon /> {isDisq ? "Disqualified" : "Disqualify"}
      </button>
    </div>
  );
}

function BottomRightPanel({ type, title, onClose, children, footer }) {
  return (
    <div className={`brp brp-${type}`} role="dialog">
      <div className="brp-header">
        <div className="brp-title-row">
          <span className="brp-icon">{type === "call" && <PhoneIcon />}{type === "task" && <TaskIcon />}{type === "email" && <MailIcon />}{type === "notes" && <NoteIcon />}</span>
          <span className="brp-title">{title}</span>
        </div>
        <button className="brp-close" onClick={onClose}><XIcon /></button>
      </div>
      <div className="brp-body">{children}</div>
      {footer && <div className="brp-footer">{footer}</div>}
    </div>
  );
}

function LogCallPanel({ form, onChange, onSubmit, onClose }) {
  return (
    <BottomRightPanel type="call" title="Log a Call" onClose={onClose} footer={<><button className="brp-cancel-btn" onClick={onClose}>Cancel</button><button className="brp-submit-btn" onClick={onSubmit}><PhoneIcon /> Log Call</button></>}>
      <div className="form-row"><div className="form-group"><label>Call Type</label><select className="form-select" value={form.callType || ""} onChange={(e) => onChange("callType", e.target.value)}><option value="">Select…</option><option>Outbound</option><option>Inbound</option></select></div><div className="form-group"><label>Duration (mins)</label><input className="form-input" type="number" min="0" placeholder="e.g. 5" value={form.duration || ""} onChange={(e) => onChange("duration", e.target.value)} /></div></div>
      <div className="form-group"><label>Outcome</label><select className="form-select" value={form.outcome || ""} onChange={(e) => onChange("outcome", e.target.value)}><option value="">Select outcome…</option><option>Interested</option><option>Not Interested</option><option>Callback Requested</option><option>No Answer</option><option>Busy / Call Later</option><option>Wrong Number</option></select></div>
      <div className="form-row"><div className="form-group"><label>Call Date</label><input className="form-input" type="date" value={form.callDate || ""} onChange={(e) => onChange("callDate", e.target.value)} /></div><div className="form-group"><label>Call Time</label><input className="form-input" type="time" value={form.callTime || ""} onChange={(e) => onChange("callTime", e.target.value)} /></div></div>
      <div className="form-group"><label>Notes</label><textarea className="form-textarea" placeholder="Add call notes…" value={form.notes || ""} onChange={(e) => onChange("notes", e.target.value)} /></div>
    </BottomRightPanel>
  );
}

function CreateTaskPanel({ form, onChange, onSubmit, onClose }) {
  return (
    <BottomRightPanel type="task" title="Create Task" onClose={onClose} footer={<><button className="brp-cancel-btn" onClick={onClose}>Cancel</button><button className="brp-submit-btn" onClick={onSubmit}><TaskIcon /> Create Task</button></>}>
      <div className="form-group"><label>Task Title</label><input className="form-input" placeholder="e.g. Follow up with applicant" value={form.title || ""} onChange={(e) => onChange("title", e.target.value)} /></div>
      <div className="form-group"><label>Task Type</label><select className="form-select" value={form.taskType || ""} onChange={(e) => onChange("taskType", e.target.value)}><option value="">Select type…</option><option>Follow Up Call</option><option>Document Collection</option><option>Site Visit</option><option>Verification</option><option>Meeting</option><option>Other</option></select></div>
      <div className="form-row"><div className="form-group"><label>Due Date</label><input className="form-input" type="date" value={form.dueDate || ""} onChange={(e) => onChange("dueDate", e.target.value)} /></div><div className="form-group"><label>Priority</label><select className="form-select" value={form.priority || "Medium"} onChange={(e) => onChange("priority", e.target.value)}><option value="High">🔴 High</option><option value="Medium">🟡 Medium</option><option value="Low">🔵 Low</option></select></div></div>
      <div className="form-group"><label>Assigned To</label><input className="form-input" placeholder="e.g. Sales User" value={form.assignedTo || ""} onChange={(e) => onChange("assignedTo", e.target.value)} /></div>
      <div className="form-group"><label>Reminder</label><select className="form-select" value={form.reminder || ""} onChange={(e) => onChange("reminder", e.target.value)}><option value="">No reminder</option><option>15 minutes before</option><option>30 minutes before</option><option>1 hour before</option><option>1 day before</option></select></div>
      <div className="form-group"><label>Description</label><textarea className="form-textarea" placeholder="Task description…" value={form.description || ""} onChange={(e) => onChange("description", e.target.value)} /></div>
    </BottomRightPanel>
  );
}

function SendEmailPanel({ form, onChange, onSubmit, onClose, leadEmail, leadData }) {
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const defaultTo = form.to !== undefined ? form.to : (leadEmail !== "Not captured" ? leadEmail : "");

  const loadTemplate = (templateKey) => {
    onChange("template", templateKey);
    if (!templateKey) return;
    const template = EMAIL_TEMPLATES[templateKey];
    if (!template) return;
    const customerName = `${leadData?.firstName || ""} ${leadData?.lastName || ""}`.trim() || "Customer";
    const verificationLink = buildEmailVerificationLink({ leadNumber: leadData?.leadNumber, email: leadData?.email });
    const rendered = renderTemplate(template, {
      customerName,
      leadNumber: leadData?.leadNumber || "",
      product: leadData?.product || "",
      loanType: leadData?.loanType || "",
      requestedLoanAmount: leadData?.requestedLoanAmount || "",
      branchName: leadData?.branchName || "",
      verificationLink
    });
    onChange("subject", rendered.subject);
    onChange("bodyHtml", rendered.bodyHtml);
  };

  return (
    <BottomRightPanel type="email" title="Compose Email" onClose={onClose} footer={<><button className="brp-cancel-btn" onClick={onClose}>Discard</button><button className="brp-submit-btn" onClick={onSubmit}><MailIcon /> Send Email</button></>}>
      <div className="email-recipients-block">
        <div className="email-field-row"><span className="email-field-lbl">To</span><input className="form-input email-addr-input" type="email" placeholder="recipient@example.com" value={defaultTo} onChange={(e) => onChange("to", e.target.value)} /><div className="email-cc-bcc-toggles">{!showCc && <button type="button" className="toggle-link" onClick={() => setShowCc(true)}>Cc</button>}{!showBcc && <button type="button" className="toggle-link" onClick={() => setShowBcc(true)}>Bcc</button>}</div></div>
        {showCc && <div className="email-field-row"><span className="email-field-lbl">Cc</span><input className="form-input email-addr-input" type="email" placeholder="cc@example.com" value={form.cc || ""} onChange={(e) => onChange("cc", e.target.value)} /><button type="button" className="toggle-remove" onClick={() => { setShowCc(false); onChange("cc", ""); }}>✕</button></div>}
        {showBcc && <div className="email-field-row"><span className="email-field-lbl">Bcc</span><input className="form-input email-addr-input" type="email" placeholder="bcc@example.com" value={form.bcc || ""} onChange={(e) => onChange("bcc", e.target.value)} /><button type="button" className="toggle-remove" onClick={() => { setShowBcc(false); onChange("bcc", ""); }}>✕</button></div>}
        <div className="email-field-row"><span className="email-field-lbl">From</span><select className="form-select email-from-select" value={form.from || "noreply@losportal.com"} onChange={(e) => onChange("from", e.target.value)}><option>sales@losportal.com</option><option>support@losportal.com</option><option>noreply@losportal.com</option></select></div>
      </div>
      <div className="form-group"><label>Subject</label><input className="form-input" placeholder="Email subject" value={form.subject || ""} onChange={(e) => onChange("subject", e.target.value)} /></div>
      <div className="form-group" style={{ flex: 1 }}><label>Message</label><RichTextEditor value={form.bodyHtml || ""} onChange={(html) => onChange("bodyHtml", html)} placeholder="Write your email message here…" /></div>
      <div className="form-group"><label>Template</label><select className="form-select" value={form.template || ""} onChange={(e) => loadTemplate(e.target.value)}><option value="">Load a template…</option><option value="EMAIL_VERIFICATION">Email Verification</option><option value="DOCUMENT_REQUEST">Document Request</option></select></div>
    </BottomRightPanel>
  );
}

function NotesPanel({ form, onChange, onSubmit, onClose }) {
  return (
    <BottomRightPanel type="notes" title="Add Note" onClose={onClose} footer={<><button className="brp-cancel-btn" onClick={onClose}>Cancel</button><button className="brp-submit-btn" onClick={onSubmit}><NoteIcon /> Save Note</button></>}>
      <div className="form-group"><label>Note Title</label><input className="form-input" placeholder="Brief summary of this note" value={form.noteTitle || ""} onChange={(e) => onChange("noteTitle", e.target.value)} /></div>
      <div className="form-group"><label>Note Category</label><select className="form-select" value={form.category || ""} onChange={(e) => onChange("category", e.target.value)}><option value="">Select category…</option><option>General</option><option>Customer Interaction</option><option>Internal</option><option>Follow Up</option><option>Escalation</option><option>Document Note</option></select></div>
      <div className="form-group"><label>Note</label><textarea className="form-textarea" style={{ minHeight: 130 }} placeholder="Type your note here…" value={form.noteBody || ""} onChange={(e) => onChange("noteBody", e.target.value)} /></div>
      <div className="form-group"><label>Visibility</label><select className="form-select" value={form.visibility || "Private"} onChange={(e) => onChange("visibility", e.target.value)}><option value="Private">🔒 Private (Only Me)</option><option value="Team">👥 Team</option><option value="All">🌐 All Users</option></select></div>
    </BottomRightPanel>
  );
}

function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <div className="modal-header"><h2>{title}</h2><button className="modal-close" onClick={onClose}><XIcon /></button></div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

function DisqualifyModal({ form, onChange, onSubmit, onClose }) {
  return (
    <Modal title="Disqualify Lead" onClose={onClose} footer={<><button className="modal-btn-cancel" onClick={onClose}>Cancel</button><button className="modal-btn-danger" onClick={onSubmit}><BanIcon /> Disqualify</button></>}>
      <div className="modal-alert warning"><span>⚠️</span><div><strong>Confirm Disqualification</strong><p>This lead will be marked Disqualified. You can reset this status later.</p></div></div>
      <div className="form-group"><label>Reason</label><select className="form-select" value={form.reason || ""} onChange={(e) => onChange("reason", e.target.value)}><option value="">Select reason…</option><option>Not Eligible</option><option>Not Interested</option><option>Income Insufficient</option><option>Credit Score Low</option><option>Duplicate Lead</option><option>No Response — Multiple Attempts</option><option>Other</option></select></div>
      <div className="form-group"><label>Additional Notes</label><textarea className="form-textarea" placeholder="Any context…" value={form.notes || ""} onChange={(e) => onChange("notes", e.target.value)} /></div>
    </Modal>
  );
}

function ConvertModal({ onSubmit, onClose }) {
  return (
    <Modal title="Convert Lead" onClose={onClose} footer={<><button className="modal-btn-cancel" onClick={onClose}>Cancel</button><button className="modal-btn-success" onClick={onSubmit}><CheckIcon /> Convert Lead</button></>}>
      <div className="modal-alert success"><span>✅</span><div><strong>Convert to Loan Application</strong><p>A new Loan Application will be created. The lead status will be set to <strong>Converted</strong>.</p></div></div>
    </Modal>
  );
}

function ActivityItem({ item, isLast }) {
  const cfgs = {
    call: { emoji: "📞", cls: "call", lbl: "Call" },
    task: { emoji: "✅", cls: "task", lbl: "Task" },
    email: { emoji: "✉️", cls: "email", lbl: "Email" },
    status: { emoji: "🔄", cls: "status", lbl: "Update" },
    note: { emoji: "📝", cls: "note", lbl: "Note" },
    ava: { emoji: "🤖", cls: "ava", lbl: "Ava" }
  };
  const c = cfgs[item.type] || cfgs.status;

  return (
    <div className="tl-item">
      <div className="tl-left"><div className={`tl-dot tl-dot-${c.cls}`}>{c.emoji}</div>{!isLast && <div className="tl-line" />}</div>
      <div className="tl-body">
        <div className="tl-row-top"><span className={`tl-tag tl-tag-${c.cls}`}>{c.lbl}</span><time className="tl-time">{item.time}</time></div>
        <strong className="tl-title">{item.title}</strong>
        {item.desc && <p className="tl-desc">{item.desc}</p>}
        {item.details && Object.keys(item.details).length > 0 && (
          <div className={`tl-card tl-card-${c.cls}`}>
            {Object.entries(item.details).map(([key, val]) => val ? <div className="tl-kv" key={key}><span>{key}</span><strong>{String(val)}</strong></div> : null)}
          </div>
        )}
      </div>
    </div>
  );
}

function DocumentRow({ doc, onDelete }) {
  const ext = doc.name.split(".").pop().toUpperCase();
  const colors = { PDF: "#e74c3c", DOCX: "#2e7d32", DOC: "#2e7d32", XLSX: "#217346", XLS: "#217346", JPG: "#e67e22", JPEG: "#e67e22", PNG: "#3498db" };
  const col = colors[ext] || "#6c757d";
  return (
    <div className="doc-row">
      <div className="doc-ext" style={{ background: col + "18", color: col }}>{ext}</div>
      <div className="doc-info"><strong>{doc.name}</strong><span>{formatFileSize(doc.size)} · {doc.uploadedAt}</span></div>
      <button className="doc-del-btn" onClick={() => onDelete(doc.id)} title="Remove"><TrashIcon /></button>
    </div>
  );
}

/* ══ AVA ACTIVITY LOG ══ */
const AVA_ACTIVITY_API = "https://c30sce5j48.execute-api.ap-south-1.amazonaws.com/prod/activity";
const WHATSAPP_CONSENT_API = "https://j0e80xdyw4.execute-api.ap-south-1.amazonaws.com/InitiatePropertyTypeWhatsAppChat";
const CONVERTED_LOG_TEXT = "Lead has been converted into an application successfully";

const CATEGORY_CONFIG = {
  INFO:     { bg: "#e8f0fb", border: "rgba(30,95,165,.22)",  color: "#1e5fa5", dot: "#1e5fa5",  label: "Info" },
  WAITING:  { bg: "#fef3e0", border: "rgba(160,92,10,.22)",  color: "#a05c0a", dot: "#e0a82e",  label: "Waiting" },
  SUCCESS:  { bg: "#e8f5e9", border: "rgba(46,125,50,.22)",  color: "#2e7d32", dot: "#2e7d32",  label: "Success" },
  ERROR:    { bg: "#fdecea", border: "rgba(192,57,43,.22)",   color: "#c0392b", dot: "#c0392b",  label: "Error" },
  WARNING:  { bg: "#fef3e0", border: "rgba(160,92,10,.22)",  color: "#a05c0a", dot: "#e0a82e",  label: "Warning" },
  ACTION:   { bg: "#f3e8ff", border: "rgba(123,60,180,.22)", color: "#7b3cb4", dot: "#7b3cb4",  label: "Action" },
  ACTION_REQUIRED: { bg: "#f3e8ff", border: "rgba(123,60,180,.22)", color: "#7b3cb4", dot: "#7b3cb4", label: "Action Required" },
};

const DEFAULT_CATEGORY = CATEGORY_CONFIG.INFO;

const normalizeActivityCategory = (category = "") => {
  const value = String(category || "").trim().toUpperCase();
  if (value === "ACTION_REQUIRED") return "ACTION_REQUIRED";
  if (value === "ACTION") return "ACTION";
  return value || "INFO";
};

const getActivityConfig = (category) => {
  const normalized = normalizeActivityCategory(category);
  return CATEGORY_CONFIG[normalized] || DEFAULT_CATEGORY;
};

const getChannelIcon = (channel = "") => {
  const value = String(channel || "").trim().toUpperCase();
  if (value === "WHATSAPP") return "💬";
  if (value === "EMAIL") return "✉️";
  if (value === "SMS") return "📱";
  if (value === "TEAMS") return "👥";
  if (value === "PORTAL") return "🖥️";
  return "⚙️";
};

const formatActivityTime = (isoString) => {
  if (!isoString) return "";
  try {
    const dt = new Date(isoString);
    return dt.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
  } catch {
    return isoString;
  }
};

const DEFAULT_ACTIVITY_ENTRY = {
  id: "default-ava-pickup",
  action: "LEAD_PICKED_UP",
  display_text: "I picked up this lead and started working on the next steps.",
  category: "INFO",
  actor_name: "Ava",
  actor_type: "AGENT",
  channel: "SYSTEM",
  created_at: new Date().toISOString(),
};

const formatActionLabel = (action = "") => {
  const raw = String(action || "AVA_ACTION").replace(/_/g, " ").trim().toLowerCase();
  return raw.replace(/\b\w/g, (char) => char.toUpperCase());
};

/* ══ AVA COMPONENTS ══ */
const getAvaPlan = ({ leadStatus, mobileVerified, emailVerified, uploadedDocs }) => {
  if (leadStatus === "Disqualified") {
    return { status: "Human Review", statusTone: "red", readiness: 35, nextAction: "Review", risk: "High", why: "This lead is disqualified or paused. Ava will not continue automation until the lead is reset.", recommendedStep: "review" };
  }
  if (leadStatus === "Converted") {
    return { status: uploadedDocs.length > 0 ? "Documents Active" : "Application Created", statusTone: "green", readiness: uploadedDocs.length > 0 ? 82 : 76, nextAction: uploadedDocs.length > 0 ? "Track Docs" : "Send Doc Link", risk: "Low", why: "The lead has been converted. Ava can now help with secure document collection and application follow-up.", recommendedStep: "docs" };
  }
  if (!mobileVerified || !emailVerified) {
    return { status: "Action Pending", statusTone: "amber", readiness: 42, nextAction: "Verify", risk: "Low", why: "Basic lead details are available, but mobile and email verification are still pending. Ava recommends verification before conversion.", recommendedStep: "verify" };
  }
  return { status: "Ready to Convert", statusTone: "green", readiness: 68, nextAction: "Convert", risk: "Low", why: "Customer contact verification is complete. Ava recommends converting this lead into a loan application.", recommendedStep: "convert" };
};

const sendWhatsAppConsentMessage = async (mobileNumber) => {
  const cleaned = String(mobileNumber || "").replace(/\D/g, "");
  if (!cleaned) return;
  try {
    await fetch(WHATSAPP_CONSENT_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetPhoneNumber: cleaned,
        messageBody:
          "Dear Customer,\n\n" +
          "Thank you for sharing the required details. Your Home Loan application is ready to move ahead. ✅\n\n" +
          "To continue, please review and provide your consent using the link below:\n\n" +
          "🔗 https://main.d2s4uifsvainim.amplifyapp.com/consent/LD-1005/918552051111\n\n" +
          "Once consent is submitted, we’ll proceed with the next step of your application.\n\n" +
          "Thank you."
      }),
    });
  } catch (err) {
    console.error("WhatsApp consent API error:", err);
  }
};

const ACTIVITY_LOG_API = "https://j0e80xdyw4.execute-api.ap-south-1.amazonaws.com/activity-log-handler";

const postActivityLog = async (payload) => {
  try {
    await fetch(ACTIVITY_LOG_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("Activity log API error:", err);
  }
};

const sendWhatsAppKycLink = async (mobileNumber, leadId) => {
  const cleaned = String(mobileNumber || "").replace(/\D/g, "");
  if (!cleaned) return;
  const kycUrl = `https://main.d2s4uifsvainim.amplifyapp.com/kyc/${leadId}`;
  try {
    await fetch(WHATSAPP_CONSENT_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetPhoneNumber: cleaned,
        messageBody:
            `Dear Customer,\n\n` +
            `Your Home Loan application is ready for KYC verification. 🛡️\n\n` +
            `Please complete your KYC using the secure link below:\n\n` +
            `🔐 ${kycUrl}\n\n` +
            `For your safety, please do not share this link with anyone.\n\n` +
            `Thank you.`,
      }),
    });
  } catch (err) {
    console.error("WhatsApp KYC link API error:", err);
  }
};

function AvaWorkspace({ leadId, leadMobile, leadStatus, mobileVerified, emailVerified, uploadedDocs, avaMessages, avaInput, onAvaInputChange, onAskAva, onTriggerVerification, onLetAvaWork, onConvert, onSendDocLink }) {
  const plan = getAvaPlan({ leadStatus, mobileVerified, emailVerified, uploadedDocs });
  const [activityLogs, setActivityLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const whatsappSentRef = useRef(false);

  useEffect(() => {
    if (!leadId) return;
    const fetchLogs = async () => {
      setLogsLoading(true);
      try {
        const res = await fetch(`${AVA_ACTIVITY_API}/${leadId}`);
        const data = await res.json();
        const arr = Array.isArray(data) ? data : [];
        const sorted = [...arr].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const finalLogs = sorted.length > 0 ? sorted : [DEFAULT_ACTIVITY_ENTRY];
        setActivityLogs(finalLogs);

        /* ── WhatsApp consent trigger on page load ── */
        if (!whatsappSentRef.current && finalLogs.length > 0) {
          const latestDisplayText = String(finalLogs[0].display_text || "").trim();
          if (latestDisplayText.includes(CONVERTED_LOG_TEXT)) {
            whatsappSentRef.current = true;
            await sendWhatsAppConsentMessage('+918552051111');
            setTimeout(async () => {
              sendWhatsAppKycLink('+918552051111', leadId);
              /* ── Activity logs: 4 entries, 1 sec apart ── */
              await postActivityLog({
                lead_id: leadId,
                action: "CONSENT_LINK_SENT",
                display_text: "I sent the consent link to the customer to proceed with the home loan application.",
                category: "INFO",
                channel: "WHATSAPP",
                actor_type: "AGENT",
                actor_name: "Ava",
                payload_json: {
                  leadNumber: leadId,
                  consentLinkSent: true,
                  consentUrl: `https://main.d2s4uifsvainim.amplifyapp.com/consent/${leadId}/918552051111`,
                },
              });

              await new Promise((res) => setTimeout(res, 1000));
              await postActivityLog({
                lead_id: leadId,
                action: "CUSTOMER_PROVIDED_CONSENT",
                display_text: "Customer provided consent to continue with the home loan application.",
                category: "SUCCESS",
                channel: "WHATSAPP",
                actor_type: "CUSTOMER",
                actor_name: "Customer",
                payload_json: {
                  leadNumber: leadId,
                  consentProvided: true,
                  consentStatus: "COMPLETED",
                },
              });

              await postActivityLog({
                lead_id: leadId,
                action: "KYC_LINK_SENT",
                display_text: "I sent the secure KYC link to the customer for document verification.",
                category: "INFO",
                channel: "WHATSAPP",
                actor_type: "AGENT",
                actor_name: "Ava",
                payload_json: {
                  leadNumber: leadId,
                  kycLinkSent: true,
                  kycUrl: `https://main.d2s4uifsvainim.amplifyapp.com/kyc/${leadId}`,
                },
              });

              await new Promise((res) => setTimeout(res, 1000));
              await postActivityLog({
                lead_id: leadId,
                action: "CUSTOMER_UPLOADED_KYC_DOCUMENTS",
                display_text: "Customer uploaded the required documents for KYC verification.",
                category: "SUCCESS",
                channel: "PORTAL",
                actor_type: "CUSTOMER",
                actor_name: "Customer"
              });
            }, 5000);
          }
        }
      } catch {
        setActivityLogs([DEFAULT_ACTIVITY_ENTRY]);
      } finally {
        setLogsLoading(false);
      }
    };
    fetchLogs();
  }, [leadId]);

  const realLogCount = activityLogs.filter((log) => log.id !== DEFAULT_ACTIVITY_ENTRY.id).length;
  const eventCount = realLogCount || activityLogs.length;
  const latestLog = activityLogs.length > 0 ? activityLogs[activityLogs.length - 1] : DEFAULT_ACTIVITY_ENTRY;
  const latestChannel = latestLog?.channel || "SYSTEM";

  return (
    <section className="side-card ava-workspace-card">
      <div className="ava-command-head">
        <div>
          <h3>Ava Activity Console</h3>
          <p>Detailed trail of every action Ava performed on this lead.</p>
        </div>
        <span className="ava-online-pill"><span className="ava-live-dot" />Live</span>
      </div>

      <div className="ava-command-metrics">
        <div className="ava-command-metric"><span>Events</span><strong>{eventCount}</strong></div>
        <div className="ava-command-metric"><span>Readiness</span><strong>{plan.readiness}%</strong></div>
        <div className="ava-command-metric"><span>Latest Channel</span><strong>{getChannelIcon(latestChannel)} {latestChannel}</strong></div>
      </div>
      <div className="ava-progress-track"><div className="ava-progress-fill" style={{ width: `${plan.readiness}%` }} /></div>

      <div className="ava-worklog-head">
        <div>
          <p>Each entry shows what Ava did, through which channel, and when.</p>
        </div>
        <span>{plan.status}</span>
      </div>

      {logsLoading ? (
        <div className="ava-log-loading">
          <span className="ava-log-spinner" />
          <span>Loading Ava activity…</span>
        </div>
      ) : (
        <div className="ava-log-feed">
          {activityLogs.map((entry, index) => {
            const cfg = getActivityConfig(entry.category);
            const normalizedCategory = normalizeActivityCategory(entry.category);
            const channelIcon = getChannelIcon(entry.channel);
            const actionLabel = formatActionLabel(entry.action);
            const isLast = index === activityLogs.length - 1;

            return (
              <div className="ava-log-timeline-item" key={`${entry.id || entry.created_at || entry.action}-${index}`}>
                <div className="ava-log-rail">
                  <span className="ava-log-rail-dot" style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
                    {channelIcon}
                  </span>
                  {!isLast && <span className="ava-log-rail-line" />}
                </div>

                <div className={`ava-log-card ava-log-${normalizedCategory.toLowerCase().replace(/_/g, "-")}`} style={{ borderTopColor: cfg.dot }}>
                  <div className="ava-log-card-header">
                    <div className="ava-log-card-title-group">
                      <span className="ava-log-action-name">{actionLabel}</span>
                      <span className="ava-log-card-time">{formatActivityTime(entry.created_at)}</span>
                    </div>
                    <span className="ava-log-card-badge" style={{ background: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                  </div>

                  <p className="ava-log-card-text">{entry.display_text}</p>

                  <div className="ava-log-card-footer">
                    <span>{channelIcon} {entry.channel || "SYSTEM"}</span>
                    {entry.actor_name && <span>By {entry.actor_name}</span>}
                  </div>
                </div>
              </div>
            );
          })}

          {avaMessages.map((msg) => (
            <div className="ava-chat-line" key={msg.id}>
              <div className="ava-chat-avatar">{msg.icon}</div>
              <div className="ava-chat-bubble">
                <strong>{msg.role}:</strong> {msg.text}
                <span>{msg.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="ava-ask-row"><input value={avaInput} placeholder="Ask Ava about this lead..." onChange={(e) => onAvaInputChange(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") onAskAva(); }} /><button className="ava-send-btn" onClick={onAskAva}>➤</button></div>
      <div className="ava-side-actions"><button onClick={onTriggerVerification} disabled={leadStatus === "Disqualified"}>✈ Verify</button><button onClick={onLetAvaWork} disabled={leadStatus === "Disqualified"}>✦ Let Ava Work</button><button onClick={onConvert} disabled={leadStatus === "Disqualified" || leadStatus === "Converted"}>▣ Convert</button><button onClick={onSendDocLink} disabled={leadStatus !== "Converted"}>🔗 Doc Link</button></div>
    </section>
  );
}

function AvaActionPlan({ leadStatus, mobileVerified, emailVerified, uploadedDocs }) {
  const plan = getAvaPlan({ leadStatus, mobileVerified, emailVerified, uploadedDocs });
  const isVerifyDone = mobileVerified && emailVerified;
  const isConverted = leadStatus === "Converted";
  const docsStarted = uploadedDocs.length > 0;
  return (
    <section className="side-card ava-plan-card">
      <div className="ava-plan-header"><h3>Ava Action Plan</h3><span className={`ava-plan-status ${plan.statusTone}`}>{plan.status}</span></div>
      <div className="ava-plan-why"><span>✦</span><p>{plan.why}</p></div>
      <div className="ava-plan-list">
        <div className="ava-plan-item completed"><div className="ava-plan-icon">✓</div><div><strong>Check completeness</strong><span>Basic lead details reviewed</span></div><em>Done</em></div>
        <div className={`ava-plan-item ${plan.recommendedStep === "verify" ? "recommended" : ""} ${isVerifyDone ? "completed" : ""}`}><div className="ava-plan-icon">✉</div><div><strong>Trigger verification</strong><span>Verify mobile and email</span></div><em>{isVerifyDone ? "Done" : plan.recommendedStep === "verify" ? "Next" : "Pending"}</em></div>
        <div className={`ava-plan-item ${plan.recommendedStep === "convert" ? "recommended" : ""} ${isConverted ? "completed" : ""}`}><div className="ava-plan-icon">▣</div><div><strong>Convert lead</strong><span>Create loan application after verification</span></div><em>{isConverted ? "Done" : plan.recommendedStep === "convert" ? "Next" : "Pending"}</em></div>
        <div className={`ava-plan-item ${plan.recommendedStep === "docs" ? "recommended" : ""} ${docsStarted ? "completed" : ""}`}><div className="ava-plan-icon">🔗</div><div><strong>Send secure document link</strong><span>Documents and consent stay inside LOS</span></div><em>{docsStarted ? "Started" : plan.recommendedStep === "docs" ? "Next" : "Pending"}</em></div>
      </div>
    </section>
  );
}

/* ══ MAIN COMPONENT ══ */
function LeadDetailPage({ onLogout, onConvertLead }) {
  const navigate = useNavigate();
  const { leadId } = useParams();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);

  const initialData = buildLeadDetails(lead || {});

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [leadStatus, setLeadStatus] = useState(initialData.leadStage);
  const [leadData, setLeadData] = useState(initialData);
  const [activities, setActivities] = useState([{ id: 1, type: "status", title: "Lead Created", desc: `Created via ${initialData.generationMode} · Source: ${initialData.leadOrigin}`, time: "Today, 9:30 AM" }]);
  const [editingField, setEditingField] = useState(null);
  const [sectionEditMode, setSectionEditMode] = useState(null);
  const [sectionDraft, setSectionDraft] = useState({});
  const [showModal, setShowModal] = useState(null);
  const [showPanel, setShowPanel] = useState(null);
  const [panelForm, setPanelForm] = useState({});
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [avaMessages, setAvaMessages] = useState([]);
  const [avaInput, setAvaInput] = useState("");
  const fileInputRef = useRef(null);
  const client = generateClient();

  const { verificationSent, isLoading, errorMessage, successMessage, handleVerify, handleResend } = useVerificationState(leadData);

  useEffect(() => {
    const subscription = client.graphql({
      query: `subscription OnLeadUpdated($leadnumber: ID!) { onLeadUpdated(leadnumber: $leadnumber) { leadnumber emailverified mobileverified } }`,
      variables: { leadnumber: leadId },
    }).subscribe({
      next: ({ data }) => {
        const updatedLead = data?.onLeadUpdated;
        if (!updatedLead) return;
        setLead((prev) => {
          if (!prev) return prev;
          return { ...prev, emailVerified: normalizeYesNo(updatedLead.emailverified), mobileVerified: normalizeYesNo(updatedLead.mobileverified) };
        });
      },
      error: (err) => console.error("Subscription error:", err),
    });
    return () => subscription.unsubscribe();
  }, [leadId]);

  useEffect(() => {
    if (lead) {
      const updatedData = buildLeadDetails(lead);
      setLeadData(updatedData);
      setLeadStatus(updatedData.leadStage);
      setActivities([{ id: 1, type: "status", title: "Lead Created", desc: `Created via ${updatedData.generationMode} · Source: ${updatedData.leadOrigin}`, time: "Today, 9:30 AM" }]);
      setAvaMessages([]);
    }
  }, [leadId, lead]);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const res = await fetch(`https://xx8ep3p2ue.execute-api.ap-south-1.amazonaws.com/prod/leads/${leadId}`);
        const data = await res.json();
        console.log("Lead API Response:", data);
        if (data.success) {
          const dbLead = data.data;
          setLead({
            id: dbLead.leadnumber,
            leadNumber: dbLead.leadnumber,
            firstName: dbLead.first_name,
            lastName: dbLead.last_name,
            mobile: dbLead.mobile,
            email: dbLead.email,
            product: dbLead.product,
            source: dbLead.source,
            leadOrigin: dbLead.source,
            leadStage: dbLead.stage,
            mobileVerified: dbLead.mobileverified,
            emailVerified: dbLead.emailverified,
          });
        }
      } catch (err) {
        console.error("Fetch Lead Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLead();
  }, [leadId]);

  const handleFieldEdit = (key, val) => { setSectionEditMode(null); setEditingField({ key, value: val }); };
  const handleFieldChange = (val) => setEditingField(p => ({ ...p, value: val }));
  const handleFieldSave = () => { if (editingField) { setLeadData(p => ({ ...p, [editingField.key]: editingField.value })); setEditingField(null); } };
  const handleFieldCancel = () => setEditingField(null);
  const startSectionEdit = (id) => { setEditingField(null); setSectionEditMode(id); setSectionDraft({ ...leadData }); };
  const saveSectionEdit = () => { setLeadData({ ...leadData, ...sectionDraft }); setSectionEditMode(null); setSectionDraft({}); };
  const cancelSectionEdit = () => { setSectionEditMode(null); setSectionDraft({}); };
  const handlePanelChange = (f, v) => setPanelForm(p => ({ ...p, [f]: v }));
  const closePanel = () => { setShowPanel(null); setPanelForm({}); };
  const addActivity = (item) => setActivities(p => [{ id: Date.now(), ...item, time: formatTime() }, ...p]);

  const mobileVerified = leadData.mobileVerified === "Yes";
  const emailVerified = leadData.emailVerified === "Yes";

  const addAvaMessage = (role, text, icon) => {
    setAvaMessages((prev) => [...prev, { id: Date.now() + Math.random(), role, icon: icon || (role === "Ava" ? "🤖" : "👤"), text, time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) }]);
  };

  const handleAskAva = () => {
    const question = avaInput.trim();
    if (!question) return;
    addAvaMessage("You", question, "👤");
    setAvaInput("");
    const lower = question.toLowerCase();
    let answer = "I can help verify the customer, prepare conversion, send a secure LOS document link, or pause the journey for review.";
    if (lower.includes("pending")) answer = mobileVerified && emailVerified ? "Verification is complete. The next pending action is conversion." : "Mobile and email verification are pending. I recommend triggering verification before conversion.";
    if (lower.includes("why")) answer = "Verification is recommended because the lead profile is available, but customer contact verification is not complete yet.";
    if (lower.includes("document") || lower.includes("docs")) answer = leadStatus === "Converted" ? "I can prepare a secure LOS document upload email. Documents and consent should not be collected over Teams or chat." : "Document collection should start after application creation. First complete verification and conversion.";
    if (lower.includes("convert")) answer = mobileVerified && emailVerified ? "This lead is ready for conversion. You can proceed with Convert Lead." : "Conversion should wait until mobile and email verification are complete.";
    addAvaMessage("Ava", answer, "🤖");
  };

  const handleAvaTriggerVerification = async () => {
    if (leadStatus === "Disqualified") { addAvaMessage("Ava", "This lead is disqualified, so I will not trigger automation unless it is reset.", "🤖"); return; }
    addAvaMessage("Ava", "I am triggering mobile and email verification for this lead.", "🤖");
    if (!mobileVerified) await handleVerify("mobile");
    if (!emailVerified) await handleVerify("email");
    addActivity({ type: "ava", title: "Ava triggered verification", desc: "Mobile and email verification communication initiated." });
  };

  const handleLetAvaWork = async () => {
    addAvaMessage("You", "Let Ava work on this lead.", "👤");
    if (leadStatus === "Disqualified") { addAvaMessage("Ava", "This lead is paused because it is disqualified. Please reset it before I continue.", "🤖"); return; }
    if (!mobileVerified || !emailVerified) { await handleAvaTriggerVerification(); addAvaMessage("Ava", "I will monitor the verification response before recommending conversion.", "🤖"); return; }
    if (leadStatus !== "Converted") { addAvaMessage("Ava", "Verification is complete. I recommend converting this lead now.", "🤖"); setShowModal("convert"); return; }
    addAvaMessage("Ava", "The lead is already converted. I can help send a secure document link next.", "🤖");
  };

  const handleAvaSendDocLink = () => {
    if (leadStatus !== "Converted") { addAvaMessage("Ava", "I can send the secure document link only after the lead is converted.", "🤖"); return; }
    const customerName = `${leadData.firstName || ""} ${leadData.lastName || ""}`.trim() || "Customer";
    setActiveTab("activity");
    setShowPanel("email");
    setPanelForm({
      to: leadData.email !== "Not captured" ? leadData.email : "",
      from: "noreply@losportal.com",
      subject: `Secure document upload link for ${leadData.product || "loan"} application`,
      bodyHtml: `<p>Dear ${customerName},</p><p>Please upload your required documents and complete consent using the secure LOS portal link.</p><p>For your safety, please do not share documents over chat, email replies, or Teams.</p><p>Regards,<br/>Ava</p>`
    });
    addAvaMessage("Ava", "I prepared a secure LOS document upload email for the customer.", "🤖");
  };

  const handleLogCall = () => { addActivity({ type: "call", title: `${panelForm.callType || "Outbound"} Call Logged`, desc: `Outcome: ${panelForm.outcome || "N/A"} · ${panelForm.duration || "N/A"} min`, details: { ...panelForm } }); closePanel(); };
  const handleCreateTask = () => { addActivity({ type: "task", title: panelForm.title || "New Task", desc: `${panelForm.priority || "Medium"} priority · Due: ${panelForm.dueDate || "Not set"}`, details: { ...panelForm } }); closePanel(); };

  const handleSendEmail = async () => {
    const to = panelForm.to || leadData.email || "";
    const subject = panelForm.subject || "";
    const bodyHtml = panelForm.bodyHtml || "";
    if (!validateEmailAddress(to)) { alert("Please enter a valid recipient email address."); return; }
    if (!subject.trim()) { alert("Please enter an email subject."); return; }
    if (!bodyHtml.trim()) { alert("Please enter an email message."); return; }
    try {
      await sendEmail({ toEmail: to, subject, bodyHtml, cc: panelForm.cc || undefined, bcc: panelForm.bcc || undefined });
      addActivity({ type: "email", title: `Email: ${subject || "(No subject)"}`, desc: `To: ${to || "N/A"}`, details: { to, subject } });
      closePanel();
    } catch (error) {
      console.error("Error while sending email:", error);
      alert(error.message || "Unable to send email. Please check API Gateway, Lambda, SES and CORS configuration.");
    }
  };

  const handleSaveNote = () => { addActivity({ type: "note", title: panelForm.noteTitle || "Note Added", desc: panelForm.noteBody || "", details: { ...panelForm } }); closePanel(); };
  const handleDisqualify = () => { setLeadStatus("Disqualified"); setLeadData(p => ({ ...p, leadStage: "Disqualified" })); addActivity({ type: "status", title: "Lead Disqualified", desc: `Reason: ${panelForm.reason || "Not specified"}` }); setShowModal(null); setPanelForm({}); };

  const handleConvert = async () => {
    try {
      await fetch(`https://xx8ep3p2ue.execute-api.ap-south-1.amazonaws.com/prod/leads/${leadId}/convert`, { method: "PUT" });
      const c = { ...lead, ...leadData, id: leadData.leadNumber, status: "Converted", leadStage: "Converted", loanFileStatus: "Application In Progress" };
      setLeadStatus("Converted");
      setLeadData(p => ({ ...p, leadStage: "Converted", loanFileStatus: "Application In Progress" }));
      addActivity({ type: "status", title: "Lead Converted to Loan Application", desc: "New loan file initiated." });
      addAvaMessage("Ava", "Lead converted successfully. I created the application flow and can help with secure document collection next.", "🤖");
      setShowModal(null);
      if (onConvertLead) onConvertLead(c);
      navigate(`/applications/${leadId}/onboarding`);
    } catch (error) {
      console.error("Convert Lead Error:", error);
    }
  };

  const handleStatusStep = (step) => {
    if (step === leadStatus) return;
    if (step === "Disqualified") { setShowModal("disqualify"); return; }
    if (step === "Converted") { setShowModal("convert"); return; }
    const prev = leadStatus;
    setLeadStatus(step);
    setLeadData(d => ({ ...d, leadStage: step }));
    addActivity({ type: "status", title: `Status → ${step}`, desc: `Changed from "${prev}" to "${step}"` });
  };

  const handleDocUpload = (e) => {
    const files = Array.from(e.target.files || []);
    setUploadedDocs(p => [...p, ...files.map(f => ({ id: Date.now() + Math.random(), name: f.name, size: f.size, uploadedAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) + ", " + new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) }))]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDocDelete = (id) => setUploadedDocs(p => p.filter(d => d.id !== id));

  const fp = (key, sectionId) => ({ fieldKey: key, value: leadData[key] ?? "—", sectionId, sectionEditMode, sectionDraft, onSectionDraftChange: (k, v) => setSectionDraft(p => ({ ...p, [k]: v })), editingField, onEdit: handleFieldEdit, onChange: handleFieldChange, onSave: handleFieldSave, onCancel: handleFieldCancel });
  const sp = (id) => ({ id, sectionEditMode, onSectionEdit: startSectionEdit, onSectionSave: saveSectionEdit, onSectionCancel: cancelSectionEdit });

  const openActionPanel = (type) => {
    setActiveTab("activity");
    setShowPanel(type);
    if (type === "email") setPanelForm({ to: leadData.email !== "Not captured" ? leadData.email : "", from: "noreply@losportal.com" });
  };

  if (loading) return <div className="lead-loading">Loading...</div>;
  if (!lead) {
    return (
      <div className="lead-not-found">
        <h2>Lead Not Found</h2>
        <p>No lead found with ID <strong>{leadId}</strong>.</p>
        <button onClick={() => navigate("/dashboard")}>← Back to Dashboard</button>
      </div>
    );
  }

  const statusClass = leadStatus.toLowerCase().replace(/\s+/g, "-");
  const journeyIdx = leadStatus === "Converted" ? 3 : leadStatus === "In Progress" ? 2 : 1;

  return (
    <div className="lead-detail-layout">
      {showPanel && <div className="panel-backdrop" />}

      <aside className={`app-sidebar${isSidebarCollapsed ? " collapsed" : ""}`}>
        <div className="sidebar-brand"><div className="sidebar-logo">LOS</div><div className="sidebar-brand-text"><h2>LOS Portal</h2><p>Loan Origination Workspace</p></div></div>
        <button className="sidebar-collapse-btn" onClick={() => setIsSidebarCollapsed(c => !c)}><span className="sidebar-collapse-icon">{isSidebarCollapsed ? <ExpandIcon /> : <CollapseIcon />}</span><span className="nav-label">Collapse</span></button>
        <nav className="sidebar-nav">{navItems.map(item => (<button key={item.label} className={`nav-item${item.active ? " active" : ""}`} onClick={item.isBack ? () => navigate("/dashboard") : undefined} title={item.label} data-label={item.label}><span className="nav-icon">{item.icon}</span><span className="nav-label">{item.label}</span></button>))}</nav>
        <div className="sidebar-insight-card"><span>Lead Context</span><strong>{leadData.leadNumber} — {leadData.firstName} {leadData.lastName}</strong><p>{leadData.product} · {leadData.branchName}</p></div>
        <div className="sidebar-insight-card ava-sidebar-card"><span>Ava Status</span><strong>🤖 Ava is active</strong><p>Monitoring verification and next best action.</p></div>
        <div className="sidebar-footer"><div className="sidebar-footer-avatar">SU</div><div className="sidebar-footer-info"><p>Logged in as</p><strong>Sales User</strong></div></div>
      </aside>

      <main className="lead-detail-main">
        <header className="record-topbar">
          <div className="record-topbar-left">
            <button className="back-btn" onClick={() => navigate("/dashboard")}><BackIcon /> Back to Dashboard</button>
            <div className="record-title-row">
              <div className="record-avatar">{leadData.firstName?.charAt(0)}{leadData.lastName?.charAt(0)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span className="page-eyebrow">{leadData.leadNumber}</span>
                <div className="record-title-line">
                  <h1>{leadData.firstName} {leadData.lastName}</h1>
                  <span className={`status-pill ${statusClass}`}>{leadStatus}</span>
                  {mobileVerified && <span className="verified-badge mobile-badge">📱 Mobile Verified</span>}
                  {emailVerified && <span className="verified-badge email-badge">✉️ Email Verified</span>}
                  <span className="ava-live-badge"><span className="ava-live-dot" />Ava working</span>
                </div>
                <p className="record-meta">{leadData.leadNumber} · {leadData.product} · {leadData.branchName}</p>
                <StatusPath currentStatus={leadStatus} onStepClick={handleStatusStep} />
              </div>
            </div>
            <div className="highlights-panel">
              <div className="highlight-chip primary"><span className="hc-label">Lead #</span><strong className="hc-val">{leadData.leadNumber}</strong></div>
              <div className="highlight-chip"><span className="hc-label">Product</span><strong className="hc-val">{leadData.loanType}</strong></div>
              <div className="highlight-chip"><span className="hc-label">Loan Amt</span><strong className="hc-val">{leadData.requestedLoanAmount}</strong></div>
              <div className="highlight-chip"><span className="hc-label">Tenure</span><strong className="hc-val">{leadData.loanTenureYears} yrs</strong></div>
              <div className="highlight-chip"><span className="hc-label">Salary</span><strong className="hc-val">{leadData.monthlyGrossSalary}</strong></div>
              <div className="highlight-chip"><span className="hc-label">Lead Age</span><strong className="hc-val">{leadData.leadAge}</strong></div>
              <div className="highlight-chip"><span className="hc-label">Assigned To</span><strong className="hc-val">{leadData.assignedToName}</strong></div>
              {!mobileVerified && <div className="highlight-chip amber"><span className="hc-label">Mobile</span><strong className="hc-val">⚠ Unverified</strong></div>}
              {!emailVerified && <div className="highlight-chip amber"><span className="hc-label">Email</span><strong className="hc-val">⚠ Unverified</strong></div>}
            </div>
          </div>
          <div className="record-actions">
            <button className="record-action-logout" onClick={async () => { if (onLogout) await onLogout(); navigate("/login", { replace: true }); }}><LogoutIcon /> Sign Out</button>
            {leadStatus !== "Disqualified" && leadStatus !== "Converted" && <button className="record-action-danger" onClick={() => setShowModal("disqualify")}><BanIcon /> Disqualify</button>}
            {leadStatus !== "Converted" && leadStatus !== "Disqualified" && <button className="record-action-success" onClick={() => setShowModal("convert")}><CheckIcon /> Convert Lead</button>}
            {leadStatus === "Converted" && <button className="record-action-success" onClick={() => navigate(`/applications/${leadId}/onboarding`)}><CheckIcon /> Open Application</button>}
            {leadStatus === "Disqualified" && <button className="record-action-outline" onClick={() => handleStatusStep("New")}>↩ Reset to New</button>}
          </div>
        </header>

        <div className="record-tabs">
          {[{ id: "overview", label: "Overview" }, { id: "activity", label: "Activity", badge: activities.length }, { id: "documents", label: "Documents", badge: uploadedDocs.length || null }].map(tab => (
            <button key={tab.id} className={`record-tab${activeTab === tab.id ? " active" : ""}`} onClick={() => setActiveTab(tab.id)}>{tab.label}{tab.badge != null && <span className="tab-badge">{tab.badge}</span>}</button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="record-page-grid">
            <aside className="record-left-col">
              <AvaActionPlan leadStatus={leadStatus} mobileVerified={mobileVerified} emailVerified={emailVerified} uploadedDocs={uploadedDocs} />
            </aside>

            <div className="record-main-col">
              <Section title="Primary Lead Information" subtitle="Core lead details and source tracking." sectionIcon="📋" accentColor="#1e5fa5" {...sp("primary")}>
                <EditableField label="Lead Number" {...fp("leadNumber", "primary")} />
                <EditableField label="Product" {...fp("product", "primary")} />
                <EditableField label="Lead Stage" {...fp("leadStage", "primary")} />
                <EditableField label="Lead Origin" {...fp("leadOrigin", "primary")} />
                <EditableField label="Generation Mode" {...fp("generationMode", "primary")} />
                <EditableField label="Consumer System" {...fp("consumerSystemName", "primary")} />
                <EditableField label="Lead Age" {...fp("leadAge", "primary")} />
                <EditableField label="Days Since Activity" {...fp("daysSinceLastActivity", "primary")} />
                <EditableField label="Lead Sub Source" {...fp("leadSubSource", "primary")} />
                <EditableField label="Lead Sub Sub Source" {...fp("leadSubSubSource", "primary")} />
                <EditableField label="Lead Sub Disposition" {...fp("leadSubDisposition", "primary")} />
              </Section>

              <Section title="Customer & Contact Information" subtitle="Applicant identity and contact details." sectionIcon="👤" accentColor="#2e7d32" {...sp("customer")}>
                <EditableField label="First Name" {...fp("firstName", "customer")} />
                <EditableField label="Last Name" {...fp("lastName", "customer")} />
                <EditableField label="Country Code" {...fp("countryCode", "customer")} />
                <EditableField label="Mobile" {...fp("mobile", "customer")} />
                <EditableField label="Alternate Mobile" {...fp("alternateMobile", "customer")} />
                <EditableField label="Email" {...fp("email", "customer")} />
                <EditableField label="Residential Status" {...fp("residentialStatus", "customer")} />
                <EditableField label="Mobile Verified" {...fp("mobileVerified", "customer")} />
                <EditableField label="Email Verified" {...fp("emailVerified", "customer")} />
              </Section>

              <Section title="Applicant Details" subtitle="Applicant profile and employment category." sectionIcon="💼" accentColor="#7b3cb4" {...sp("applicant")}>
                <EditableField label="Applicant Type" {...fp("applicantType", "applicant")} />
                <EditableField label="Applicant Category" {...fp("applicantCategory", "applicant")} />
                <EditableField label="Constitution Type" {...fp("constitutionType", "applicant")} />
                <EditableField label="Monthly Gross Salary" {...fp("monthlyGrossSalary", "applicant")} />
              </Section>

              <Section title="Loan Details" subtitle="Loan requirement, purpose, tenure, and property." sectionIcon="🏠" accentColor="#a05c0a" {...sp("loan")}>
                <EditableField label="Loan Type" {...fp("loanType", "loan")} />
                <EditableField label="Loan Purpose" {...fp("loanPurpose", "loan")} />
                <EditableField label="Requested Loan Amount" {...fp("requestedLoanAmount", "loan")} />
                <EditableField label="Loan Tenure (Years)" {...fp("loanTenureYears", "loan")} />
                <EditableField label="Property Identified" {...fp("propertyIdentified", "loan")} />
                <EditableField label="Project / Property Name" {...fp("projectPropertyName", "loan")} />
                <EditableField label="Type of Property" {...fp("typeOfProperty", "loan")} />
              </Section>

              <Section title="Balance Transfer Details" subtitle="BT bank information, if applicable." sectionIcon="🔄" accentColor="#0e7490" {...sp("bt")}>
                <EditableField label="Balance Transfer Bank" {...fp("balanceTransferBank", "bt")} />
                <EditableField label="BT Bank Name" {...fp("balanceTransferBankName", "bt")} />
                <EditableField label="BT Bank (Funnel)" {...fp("btBankFunnel", "bt")} />
              </Section>

              <Section title="Ownership & Assignment" subtitle="Team, owner, branch, and verification." sectionIcon="🏢" accentColor="#1a3d6e" {...sp("ownership")}>
                <EditableField label="Owner Name" {...fp("ownerName", "ownership")} />
                <EditableField label="LOS Owner Team" {...fp("losOwnerTeam", "ownership")} />
                <EditableField label="Assigned To (ID)" {...fp("assignedTo", "ownership")} />
                <EditableField label="Assigned To (Name)" {...fp("assignedToName", "ownership")} />
                <EditableField label="Branch Name" {...fp("branchName", "ownership")} />
                <EditableField label="LOS Verification User" {...fp("losVerificationUser", "ownership")} />
              </Section>

              <Section title="Application & APS" subtitle="Application linkage and APS details." sectionIcon="🔢" accentColor="#555" {...sp("aps")}>
                <EditableField label="APS Number" {...fp("apsNumber", "aps")} />
                <EditableField label="Loan File Status" {...fp("loanFileStatus", "aps")} />
              </Section>
            </div>

            <aside className="record-side-col">
              <AvaWorkspace leadId={leadId} leadMobile={leadData.mobile} leadStatus={leadStatus} mobileVerified={mobileVerified} emailVerified={emailVerified} uploadedDocs={uploadedDocs} avaMessages={avaMessages} avaInput={avaInput} onAvaInputChange={setAvaInput} onAskAva={handleAskAva} onTriggerVerification={handleAvaTriggerVerification} onLetAvaWork={handleLetAvaWork} onConvert={() => { if (leadStatus === "Converted") { navigate(`/applications/${leadId}/onboarding`); return; } setShowModal("convert"); }} onSendDocLink={handleAvaSendDocLink} />

              <section className="side-card">
                <h3>Contact Verification</h3>
                {[{ key: "mobile", label: "Mobile", value: leadData.mobile, verified: mobileVerified }, { key: "email", label: "Email", value: leadData.email, verified: emailVerified }].map(item => (
                  <div className={`verify-row ${item.verified ? "verified" : "unverified"}`} key={item.key}>
                    <div className="verify-row-info"><span>{item.label}</span><strong>{item.value}</strong></div>
                    <div className="verify-row-actions">
                      {item.verified && <div className="verify-status-badge verified">✓ Verified</div>}
                      {!item.verified && verificationSent[item.key] && <div className="verify-sent-state"><span className="verify-link-sent">✓ {item.key === "mobile" ? "OTP sent successfully" : "Email sent successfully"}</span><button className="verify-resend-btn" onClick={() => handleResend(item.key)} disabled={isLoading[item.key]}>{isLoading[item.key] ? "Sending..." : "Resend"}</button></div>}
                      {!item.verified && !verificationSent[item.key] && <div className="verify-pending-actions"><div className="verify-status-badge pending">⚠ Pending</div><button className="verify-btn" onClick={() => handleVerify(item.key)} disabled={isLoading[item.key]}>{isLoading[item.key] ? "Sending..." : "Verify"}</button></div>}
                    </div>
                    {errorMessage[item.key] && <div className="verify-error-msg">{errorMessage[item.key]}</div>}
                    {successMessage[item.key] && !errorMessage[item.key] && <div className="verify-success-msg">{successMessage[item.key]}</div>}
                  </div>
                ))}
              </section>

              <section className="side-card">
                <h3>Lead Journey</h3>
                <div className="journey-list">
                  {[{ num: 1, title: "Lead Created", desc: "Basic lead details captured.", threshold: 1 }, { num: 2, title: "Verification", desc: "Mobile, email, and applicant checks.", threshold: 2 }, { num: 3, title: "Application", desc: "Convert lead to loan application.", threshold: 3 }].map(step => (
                    <div key={step.num} className={`journey-step${journeyIdx === step.threshold ? " active" : ""}${journeyIdx > step.threshold ? " completed" : ""}`}><div className="journey-num">{journeyIdx > step.threshold ? "✓" : step.num}</div><div><strong>{step.title}</strong><p>{step.desc}</p></div></div>
                  ))}
                </div>
              </section>

              <section className="side-card">
                <h3>Quick Actions</h3>
                <div className="quick-actions">
                  <button className="quick-btn qa-call" onClick={() => openActionPanel("call")}>📞 Log a Call</button>
                  <button className="quick-btn qa-task" onClick={() => openActionPanel("task")}>✅ Create Task</button>
                  <button className="quick-btn qa-email" onClick={() => openActionPanel("email")}>✉️ Send Email</button>
                  <button className="quick-btn qa-note" onClick={() => openActionPanel("notes")}>📝 Add Note</button>
                  <button className="quick-btn qa-convert" onClick={() => { if (leadStatus === "Converted") { navigate(`/applications/${leadId}/onboarding`); return; } setShowModal("convert"); }} disabled={leadStatus === "Disqualified"}>{leadStatus === "Converted" ? "Open Application" : "Convert Lead"}</button>
                </div>
              </section>
            </aside>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="activity-layout">
            <div className="activity-action-bar"><button className="aab-btn aab-call" onClick={() => setShowPanel("call")}><PhoneIcon /> Log Call</button><button className="aab-btn aab-task" onClick={() => setShowPanel("task")}><TaskIcon /> Create Task</button><button className="aab-btn aab-email" onClick={() => openActionPanel("email")}><MailIcon /> Send Email</button><button className="aab-btn aab-note" onClick={() => setShowPanel("notes")}><NoteIcon /> Add Note</button></div>
            <section className="activity-section"><div className="activity-section-header"><h3>Activity Timeline</h3><span className="activity-count">{activities.length} {activities.length === 1 ? "event" : "events"}</span></div><div className="timeline-container">{activities.length === 0 ? <div className="activity-empty"><span className="empty-icon">📋</span><strong>No activity yet</strong><p>Log a call, create a task, or add a note to get started.</p></div> : activities.map((item, i) => <ActivityItem key={item.id} item={item} isLast={i === activities.length - 1} />)}</div></section>
          </div>
        )}

        {activeTab === "documents" && (
          <section className="record-section" style={{ overflow: "visible" }}>
            <div className="record-section-header"><div className="section-title-group"><div className="section-icon-badge" style={{ background: "#1e5fa518", color: "#1e5fa5" }}>📂</div><div><h3>Documents</h3><p className="section-subtitle">Upload and manage supporting documents.</p></div></div><button className="doc-upload-btn" onClick={() => fileInputRef.current?.click()}><UploadIcon /> Upload Document</button><input ref={fileInputRef} type="file" multiple style={{ display: "none" }} onChange={handleDocUpload} /></div>
            {uploadedDocs.length === 0 ? <div className="doc-empty"><div className="doc-empty-icon">📄</div><strong>No documents uploaded yet</strong><p>Upload identity proof, income documents, property papers, and other supporting files.</p><button className="doc-empty-btn" onClick={() => fileInputRef.current?.click()}><UploadIcon /> Upload Your First Document</button></div> : <div className="doc-list">{uploadedDocs.map(doc => <DocumentRow key={doc.id} doc={doc} onDelete={handleDocDelete} />)}</div>}
          </section>
        )}
      </main>

      {showPanel === "call" && <LogCallPanel form={panelForm} onChange={handlePanelChange} onSubmit={handleLogCall} onClose={closePanel} />}
      {showPanel === "task" && <CreateTaskPanel form={panelForm} onChange={handlePanelChange} onSubmit={handleCreateTask} onClose={closePanel} />}
      {showPanel === "email" && <SendEmailPanel form={panelForm} onChange={handlePanelChange} onSubmit={handleSendEmail} onClose={closePanel} leadEmail={leadData.email} leadData={leadData} />}
      {showPanel === "notes" && <NotesPanel form={panelForm} onChange={handlePanelChange} onSubmit={handleSaveNote} onClose={closePanel} />}
      {showModal === "disqualify" && <DisqualifyModal form={panelForm} onChange={handlePanelChange} onSubmit={handleDisqualify} onClose={() => { setShowModal(null); setPanelForm({}); }} />}
      {showModal === "convert" && <ConvertModal onSubmit={handleConvert} onClose={() => setShowModal(null)} />}
    </div>
  );
}

export default LeadDetailPage;