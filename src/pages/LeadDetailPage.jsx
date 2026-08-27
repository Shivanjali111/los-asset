import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { generateClient } from "aws-amplify/api";
import "./LeadDetailPage.css";

import { EMAIL_TEMPLATES } from "../templates/emailTemplates";
import { renderTemplate } from "../templates/templateRenderer";
import { sendEmail } from "../services/emailService";

/* ══ SVG ICONS ══ */
const LogoutIcon = () => (
  <svg
    width="14"
    height="14"
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
const BackIcon = () => (
  <svg
    width="13"
    height="13"
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
const CollapseIcon = () => (
  <svg
    width="13"
    height="13"
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
    width="13"
    height="13"
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
const PencilIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);
const PhoneIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.63 4.35 2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const TaskIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 11 12 14 22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);
const MailIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);
const NoteIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);
const XIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const CheckIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const BanIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
);
const TrashIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const UploadIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);
const SaveIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

/* ══ FIELD OPTIONS ══ */
const FIELD_OPTIONS = {
  product: ["Gold Loan"],
  facilityInterest: ["Retail Gold Loan", "Agri Gold Loan", "To be confirmed"],
  leadStage: ["New", "In Progress", "Converted", "Disqualified"],
  leadOrigin: [
    "Direct",
    "Branch Walk-in",
    "Referral",
    "Online",
    "DSA",
    "Channel Partner",
    "Social Media",
  ],
  leadSubSource: [
    "Google Ads",
    "Meta Ads",
    "Walk-In",
    "Call Center",
    "Agent",
    "Website",
    "Email Campaign",
  ],
  generationMode: ["Manual", "Automatic", "API", "Import", "Web Form"],
  consumerSystemName: [
    "Gold Loan Portal",
    "Mobile App",
    "API",
    "Import",
    "Third Party",
  ],
  loanPurpose: [
    "Marriage",
    "Medical",
    "Personal Needs",
    "Others",
    "Land Development",
    "Cultivation Requirement",
    "To be confirmed",
  ],
  repaymentPreference: ["Term Loan", "Overdraft", "To be confirmed"],
  preferredBranchType: ["Home Branch", "Other Branch", "To be confirmed"],
  jewelleryAvailable: ["Yes", "No", "To be confirmed"],
  ownershipProofStatus: [
    "Available",
    "Customer Declaration",
    "To be provided",
    "Not available",
  ],
  residentialStatus: [
    "Resident Indian",
    "Non-Resident Indian (NRI)",
    "Person of Indian Origin (PIO)",
  ],
  loanFileStatus: [
    "Lead Qualification",
    "Application In Progress",
    "Appraisal Pending",
    "Checker Review",
    "Documentation",
    "Disbursed",
    "Rejected",
    "On Hold",
  ],
  losOwnerTeam: [
    "Gold Loan Sales",
    "Branch Maker",
    "Jewellery Appraisal",
    "Branch Checker",
    "Operations",
  ],
  countryCode: ["+91", "+1", "+44", "+61", "+971", "+65", "+60"],
};

/* ══ FIELD DEFINITIONS ══ */
const fieldDefs = {
  leadNumber: { type: "text", readonly: true },
  product: { type: "text", readonly: true },
  leadStage: { type: "select", options: FIELD_OPTIONS.leadStage },
  leadOrigin: { type: "select", options: FIELD_OPTIONS.leadOrigin },
  leadSubSource: { type: "select", options: FIELD_OPTIONS.leadSubSource },
  leadSubSubSource: { type: "text" },
  leadSubDisposition: { type: "text" },
  generationMode: { type: "select", options: FIELD_OPTIONS.generationMode },
  consumerSystemName: {
    type: "select",
    options: FIELD_OPTIONS.consumerSystemName,
  },
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
  residentialStatus: {
    type: "select",
    options: FIELD_OPTIONS.residentialStatus,
  },
  facilityInterest: { type: "select", options: FIELD_OPTIONS.facilityInterest },
  loanPurpose: { type: "select", options: FIELD_OPTIONS.loanPurpose },
  requestedLoanAmount: { type: "currency" },
  repaymentPreference: {
    type: "select",
    options: FIELD_OPTIONS.repaymentPreference,
  },
  preferredBranchType: {
    type: "select",
    options: FIELD_OPTIONS.preferredBranchType,
  },
  appointmentDate: { type: "date" },
  jewelleryAvailable: {
    type: "select",
    options: FIELD_OPTIONS.jewelleryAvailable,
  },
  ornamentSummary: { type: "text" },
  ownershipProofStatus: {
    type: "select",
    options: FIELD_OPTIONS.ownershipProofStatus,
  },
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
const buildLeadDetails = (lead = {}) => ({
  firstName: lead.firstName || "",
  lastName: lead.lastName || "",
  mobile: lead.mobile || "Not captured",
  email: lead.email || "Not captured",
  alternateMobile: lead.alternateMobile || "—",
  apsNumber: lead.apsNumber || "—",
  assignedTo: lead.assignedTo || "USR-1024",
  assignedToName: lead.assignedToName || lead.owner || "Sales User",
  branchName: lead.branchName || "Main Branch",
  consumerSystemName: lead.consumerSystemName || "Gold Loan Portal",
  countryCode: lead.countryCode || "+91",
  daysSinceLastActivity: lead.daysSinceLastActivity || "0",
  emailVerified: lead.emailVerified || "No",
  generationMode: lead.generationMode || "Manual",
  leadAge: lead.leadAge || "0 Days",
  leadNumber: lead.id || "",
  leadOrigin: lead.leadOrigin || lead.source || "Direct",
  leadStage: lead.leadStage || lead.status || "New",
  leadSubDisposition: lead.leadSubDisposition || "—",
  leadSubSource: lead.leadSubSource || "—",
  leadSubSubSource: lead.leadSubSubSource || "—",
  loanFileStatus: lead.loanFileStatus || "Lead Qualification",
  facilityInterest: lead.facilityInterest || "To be confirmed",
  loanPurpose: lead.loanPurpose || "To be confirmed",
  repaymentPreference: lead.repaymentPreference || "To be confirmed",
  preferredBranchType: lead.preferredBranchType || "To be confirmed",
  appointmentDate: lead.appointmentDate || "",
  jewelleryAvailable: lead.jewelleryAvailable || "To be confirmed",
  ornamentSummary: lead.ornamentSummary || "To be confirmed",
  ownershipProofStatus: lead.ownershipProofStatus || "To be provided",
  losOwnerTeam: lead.losOwnerTeam || "Gold Loan Sales",
  losVerificationUser: lead.losVerificationUser || "—",
  mobileVerified: lead.mobileVerified || "No",
  ownerName: lead.ownerName || lead.owner || "Sales User",
  product: "Gold Loan",
  requestedLoanAmount: lead.requestedLoanAmount || "To be confirmed",
  residentialStatus: lead.residentialStatus || "Resident Indian",
});

const STATUS_STEPS = ["New", "In Progress", "Converted"];

/* ══ VERIFICATION STATE TRACKER ══ */
const SEND_MOBILE_VERIFICATION_API_URL =
  "https://j0e80xdyw4.execute-api.ap-south-1.amazonaws.com/los-send-mobile-verification";

const validateIndianMobileNumber = (mobile = "") => {
  const cleaned = String(mobile).replace(/\D/g, "");
  return /^[6-9]\d{9}$/.test(cleaned);
};

const normalizeMobileNumber = (mobile = "") =>
  String(mobile).replace(/\D/g, "").slice(-10);

const ETB_DEMO_MOBILE = "8552051111";

const getRelationshipResult = (mobile) => {
  const normalizedMobile = normalizeMobileNumber(mobile);

  if (!validateIndianMobileNumber(normalizedMobile)) {
    return {
      status: "unavailable",
      type: null,
      title: "Customer relationship check unavailable",
      description: "Enter a valid 10-digit Indian mobile number to search CBS.",
    };
  }

  if (normalizedMobile === ETB_DEMO_MOBILE) {
    return {
      status: "matched",
      type: "ETB",
      title: "Existing customer match found",
      description:
        "A unique active CBS relationship was found using the registered mobile number.",
      customerId: "CIF-10028491",
      registeredEmail: "an••••••@gmail.com",
      kycStatus: "Valid",
      savingsAccount: "•••• 4421",
      homeBranch: "Main Branch",
      nomineeStatus: "Available in CBS",
    };
  }

  return {
    status: "not-found",
    type: "NTB",
    title: "No existing CBS relationship found",
    description:
      "Treat this lead as New to Bank. Full customer onboarding and KYC will be completed during application creation.",
    customerId: "Not available",
    registeredEmail: "Not available",
    kycStatus: "Full KYC required",
    savingsAccount: "Account setup required",
    homeBranch: "To be selected",
    nomineeStatus: "To be captured",
  };
};

const validateEmailAddress = (email = "") => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
};

const buildEmailVerificationLink = ({ leadNumber, email }) => {
  const emailParam = encodeURIComponent(email || "");
  return `https://main.d3prbk14vc3ef9.amplifyapp.com/email/${emailParam}`;
};

const useVerificationState = (leadData) => {
  const [verificationSent, setVerificationSent] = useState({
    mobile: false,
    email: false,
  });
  const [isLoading, setIsLoading] = useState({ mobile: false, email: false });
  const [errorMessage, setErrorMessage] = useState({ mobile: "", email: "" });
  const [successMessage, setSuccessMessage] = useState({
    mobile: "",
    email: "",
  });

  const handleVerify = async (type) => {
    setErrorMessage((prev) => ({ ...prev, [type]: "" }));
    setSuccessMessage((prev) => ({ ...prev, [type]: "" }));

    if (type === "mobile") {
      const mobileNumber = leadData?.mobile;

      if (!mobileNumber || mobileNumber === "Not captured") {
        setErrorMessage((prev) => ({
          ...prev,
          mobile: "Mobile number is not available.",
        }));
        return;
      }

      if (!validateIndianMobileNumber(mobileNumber)) {
        setErrorMessage((prev) => ({
          ...prev,
          mobile: "Please enter a valid Indian mobile number.",
        }));
        return;
      }

      try {
        setIsLoading((prev) => ({ ...prev, mobile: true }));

        const response = await fetch(SEND_MOBILE_VERIFICATION_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mobileNumber,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          setErrorMessage((prev) => ({
            ...prev,
            mobile: data.message || "Failed to send SMS. Please try again.",
          }));
          return;
        }

        setSuccessMessage((prev) => ({
          ...prev,
          mobile: "Verification link has been sent successfully.",
        }));

        setVerificationSent((prev) => ({ ...prev, mobile: true }));
      } catch (error) {
        console.error("Error while calling SMS API:", error);
        setErrorMessage((prev) => ({
          ...prev,
          mobile:
            "Unable to connect to SMS service. Please check API Gateway URL and CORS configuration.",
        }));
      } finally {
        setIsLoading((prev) => ({ ...prev, mobile: false }));
      }

      return;
    }

    if (type === "email") {
      const emailAddress = leadData?.email;

      if (!emailAddress || emailAddress === "Not captured") {
        setErrorMessage((prev) => ({
          ...prev,
          email: "Email address is not available.",
        }));
        return;
      }

      if (!validateEmailAddress(emailAddress)) {
        setErrorMessage((prev) => ({
          ...prev,
          email: "Please enter a valid email address.",
        }));
        return;
      }

      try {
        setIsLoading((prev) => ({ ...prev, email: true }));

        const customerName =
          `${leadData?.firstName || ""} ${leadData?.lastName || ""}`.trim() ||
          "Customer";
        const verificationLink = buildEmailVerificationLink({
          leadNumber: leadData?.leadNumber,
          email: emailAddress,
        });

        const renderedEmail = renderTemplate(
          EMAIL_TEMPLATES.EMAIL_VERIFICATION,
          {
            customerName,
            leadNumber: leadData?.leadNumber || "",
            product: leadData?.product || "",
            loanType: leadData?.facilityInterest || "Gold Loan",
            requestedLoanAmount: leadData?.requestedLoanAmount || "",
            branchName: leadData?.branchName || "",
            verificationLink,
          },
        );

        await sendEmail({
          toEmail: emailAddress,
          subject: renderedEmail.subject,
          bodyHtml: renderedEmail.bodyHtml,
        });

        setSuccessMessage((prev) => ({
          ...prev,
          email: "Verification email has been sent successfully.",
        }));

        setVerificationSent((prev) => ({ ...prev, email: true }));
      } catch (error) {
        console.error("Error while sending verification email:", error);
        setErrorMessage((prev) => ({
          ...prev,
          email:
            error.message ||
            "Unable to send verification email. Please check API Gateway, Lambda, SES and CORS configuration.",
        }));
      } finally {
        setIsLoading((prev) => ({ ...prev, email: false }));
      }
    }
  };

  const handleResend = async (type) => {
    setVerificationSent((prev) => ({ ...prev, [type]: false }));
    await handleVerify(type);
  };

  return {
    verificationSent,
    isLoading,
    errorMessage,
    successMessage,
    handleVerify,
    handleResend,
  };
};

const formatTime = () =>
  new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatFileSize = (b) =>
  b < 1024
    ? b + " B"
    : b < 1048576
      ? (b / 1024).toFixed(1) + " KB"
      : (b / 1048576).toFixed(1) + " MB";

const navItems = [
  { icon: "▦", label: "Dashboard", active: false, isBack: true },
  { icon: "◎", label: "Leads", active: true, isBack: false },
  { icon: "▣", label: "Applications", active: false, isBack: false },
  { icon: "◇", label: "Appraisals", active: false, isBack: false },
  { icon: "□", label: "Documents", active: false, isBack: false },
  { icon: "✓", label: "Checker Queue", active: false, isBack: false },
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
        <button
          type="button"
          className="rte-btn"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("bold");
          }}
          title="Bold"
        >
          <b>B</b>
        </button>
        <button
          type="button"
          className="rte-btn"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("italic");
          }}
          title="Italic"
        >
          <i>I</i>
        </button>
        <button
          type="button"
          className="rte-btn"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("underline");
          }}
          title="Underline"
        >
          <u>U</u>
        </button>
        <span className="rte-sep" />
        <button
          type="button"
          className="rte-btn"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("insertUnorderedList");
          }}
          title="Bullet list"
        >
          • List
        </button>
        <button
          type="button"
          className="rte-btn"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("insertOrderedList");
          }}
          title="Numbered list"
        >
          1. List
        </button>
        <span className="rte-sep" />
        <select
          className="rte-select"
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => {
            exec("fontSize", e.target.value);
            e.target.value = "";
          }}
        >
          <option value="">Size</option>
          <option value="1">Small</option>
          <option value="3">Normal</option>
          <option value="5">Large</option>
        </select>
        <span className="rte-sep" />
        <button
          type="button"
          className="rte-btn rte-clear"
          onMouseDown={(e) => {
            e.preventDefault();
            exec("removeFormat");
          }}
          title="Clear formatting"
        >
          ✕ Clear
        </button>
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
function EditableField({
  label,
  fieldKey,
  value,
  type = "text",
  options = null,
  sectionId,
  sectionEditMode,
  sectionDraft,
  onSectionDraftChange,
  editingField,
  onEdit,
  onChange,
  onSave,
  onCancel,
}) {
  const def = fieldDefs[fieldKey] || {};
  const fieldType = def.type || type;
  const fieldOptions = def.options || options;
  const isReadonly = def.readonly;
  const isInSectionEdit = sectionEditMode === sectionId;
  const isIndividualEdit = !isInSectionEdit && editingField?.key === fieldKey;

  const renderInput = (currentVal, onChg) => {
    if (isReadonly)
      return (
        <strong className="field-value field-readonly">
          {currentVal || "—"}
        </strong>
      );

    if (fieldType === "select" && fieldOptions) {
      return (
        <select
          className="field-inline-select"
          value={currentVal || ""}
          onChange={(e) => onChg(e.target.value)}
          autoFocus={!isInSectionEdit}
        >
          <option value="">— Select —</option>
          {fieldOptions.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
    }

    if (fieldType === "currency")
      return (
        <input
          className="field-inline-input currency-input"
          type="text"
          value={currentVal || ""}
          onChange={(e) => onChg(e.target.value)}
          autoFocus={!isInSectionEdit}
          placeholder="e.g. ₹50,00,000"
        />
      );
    if (fieldType === "tel")
      return (
        <input
          className="field-inline-input"
          type="tel"
          value={currentVal || ""}
          onChange={(e) => onChg(e.target.value)}
          autoFocus={!isInSectionEdit}
        />
      );
    if (fieldType === "email")
      return (
        <input
          className="field-inline-input"
          type="email"
          value={currentVal || ""}
          onChange={(e) => onChg(e.target.value)}
          autoFocus={!isInSectionEdit}
        />
      );
    if (fieldType === "date")
      return (
        <input
          className="field-inline-input"
          type="date"
          value={currentVal || ""}
          onChange={(e) => onChg(e.target.value)}
          autoFocus={!isInSectionEdit}
        />
      );
    if (fieldType === "number")
      return (
        <input
          className="field-inline-input"
          type="number"
          value={currentVal || ""}
          onChange={(e) => onChg(e.target.value)}
          autoFocus={!isInSectionEdit}
        />
      );

    return (
      <input
        className="field-inline-input"
        type="text"
        value={currentVal || ""}
        onChange={(e) => onChg(e.target.value)}
        autoFocus={!isInSectionEdit}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSave();
          if (e.key === "Escape") onCancel();
        }}
      />
    );
  };

  if (isInSectionEdit) {
    const draftVal =
      sectionDraft[fieldKey] !== undefined
        ? sectionDraft[fieldKey]
        : value || "";
    return (
      <div className="record-field section-edit-active">
        <div className="record-field-content">
          <span className="field-label">
            {label}
            {isReadonly && <span className="field-ro-tag">auto</span>}
          </span>
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
              <button className="field-save-btn" onClick={onSave}>
                <CheckIcon /> Save
              </button>
              <button className="field-cancel-btn" onClick={onCancel}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <strong className="field-value">{value || "—"}</strong>
        )}
      </div>
      {!isIndividualEdit && !isReadonly && (
        <button
          className="field-edit-btn"
          title={`Edit ${label}`}
          onClick={() => onEdit(fieldKey, value)}
        >
          <PencilIcon />
        </button>
      )}
    </div>
  );
}

/* ══ SECTION WRAPPER ══ */
function Section({
  id,
  title,
  subtitle,
  sectionIcon,
  accentColor,
  sectionEditMode,
  onSectionEdit,
  onSectionSave,
  onSectionCancel,
  children,
}) {
  const isEditing = sectionEditMode === id;

  return (
    <section className={`record-section${isEditing ? " section-in-edit" : ""}`}>
      <div className="record-section-header">
        <div className="section-title-group">
          <div
            className="section-icon-badge"
            style={{ background: accentColor + "18", color: accentColor }}
          >
            {sectionIcon}
          </div>
          <div>
            <h3>{title}</h3>
            {subtitle && <p className="section-subtitle">{subtitle}</p>}
          </div>
        </div>
        <div className="section-header-actions">
          {isEditing ? (
            <>
              <button className="section-save-btn" onClick={onSectionSave}>
                <SaveIcon /> Save All
              </button>
              <button className="section-cancel-btn" onClick={onSectionCancel}>
                Cancel
              </button>
            </>
          ) : (
            <button
              className="section-edit-btn"
              onClick={() => onSectionEdit(id)}
            >
              <PencilIcon /> Edit
            </button>
          )}
        </div>
      </div>
      <div className="record-field-grid">{children}</div>
    </section>
  );
}

/* ══ STAGE PATH ══ */
function StatusPath({ currentStatus, onStepClick }) {
  const activeIdx = STATUS_STEPS.indexOf(currentStatus);
  const isDisq = currentStatus === "Disqualified";

  return (
    <div className="sf-path-wrap">
      <div className="sf-stages">
        {STATUS_STEPS.map((step, idx) => {
          const isActive = currentStatus === step;
          const isCompleted = !isDisq && activeIdx > idx;
          const cls = [
            "sf-stage",
            isActive ? "sf-active" : "",
            isCompleted ? "sf-completed" : "",
            idx === 0 ? "sf-first" : "",
            idx === STATUS_STEPS.length - 1 ? "sf-last" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={step}
              className={cls}
              onClick={() => onStepClick(step)}
              title={`Move to ${step}`}
            >
              {isCompleted && (
                <span className="sf-check">
                  <CheckIcon />
                </span>
              )}
              <span className="sf-label">{step}</span>
            </button>
          );
        })}
      </div>
      <button
        className={`sf-disq-btn${isDisq ? " sf-disq-active" : ""}`}
        onClick={() => onStepClick("Disqualified")}
      >
        <BanIcon /> {isDisq ? "Disqualified" : "Disqualify"}
      </button>
    </div>
  );
}

function CustomerRelationshipPanel({
  relationship,
  isChecking,
  mobile,
  onRecheck,
}) {
  const panelClass = isChecking ? "checking" : relationship.status;
  const badgeLabel = isChecking
    ? "Checking CBS"
    : relationship.type === "ETB"
      ? "ETB customer"
      : relationship.type === "NTB"
        ? "Potential NTB"
        : "Action required";

  return (
    <section className={`relationship-panel ${panelClass}`} aria-live="polite">
      <div className="relationship-panel-main">
        <div className="relationship-symbol" aria-hidden="true">
          {isChecking ? (
            <span className="relationship-spinner" />
          ) : relationship.type === "ETB" ? (
            "✓"
          ) : relationship.type === "NTB" ? (
            "+"
          ) : (
            "!"
          )}
        </div>
        <div className="relationship-copy">
          <div className="relationship-heading-row">
            <span className={`relationship-badge ${panelClass}`}>
              {badgeLabel}
            </span>
            <span className="relationship-lookup">
              CBS lookup · {mobile || "Mobile not captured"}
            </span>
          </div>
          <h2>
            {isChecking
              ? "Checking customer relationship…"
              : relationship.title}
          </h2>
          <p>
            {isChecking
              ? "Searching CBS using the lead’s registered mobile number."
              : relationship.description}
          </p>
        </div>
        <button
          className="relationship-recheck"
          type="button"
          onClick={onRecheck}
          disabled={isChecking}
        >
          {isChecking ? "Checking…" : "Recheck CBS"}
        </button>
      </div>

      {!isChecking && relationship.type && (
        <div className="relationship-detail-grid">
          <div>
            <span>Customer ID</span>
            <strong>{relationship.customerId}</strong>
          </div>
          <div>
            <span>Registered email</span>
            <strong>{relationship.registeredEmail}</strong>
          </div>
          <div>
            <span>KYC status</span>
            <strong>{relationship.kycStatus}</strong>
          </div>
          <div>
            <span>
              {relationship.type === "ETB" ? "Active CASA" : "Account"}
            </span>
            <strong>{relationship.savingsAccount}</strong>
          </div>
          <div>
            <span>Home branch</span>
            <strong>{relationship.homeBranch}</strong>
          </div>
          <div>
            <span>Nominee</span>
            <strong>{relationship.nomineeStatus}</strong>
          </div>
        </div>
      )}

      {!isChecking && relationship.type && (
        <div className="relationship-next-step">
          <strong>At conversion:</strong>{" "}
          {relationship.type === "ETB"
            ? "The Branch Maker will verify Customer ID/account details and OTP before linking this lead to the CBS customer."
            : "The Branch Maker will complete customer onboarding, full KYC and account setup before continuing with the Gold Loan application."}
        </div>
      )}
    </section>
  );
}

/* ══ BOTTOM-RIGHT PANEL WRAPPER ══ */
function BottomRightPanel({ type, title, onClose, children, footer }) {
  return (
    <div className={`brp brp-${type}`} role="dialog">
      <div className="brp-header">
        <div className="brp-title-row">
          <span className="brp-icon">
            {type === "call" && <PhoneIcon />}
            {type === "task" && <TaskIcon />}
            {type === "email" && <MailIcon />}
            {type === "notes" && <NoteIcon />}
          </span>
          <span className="brp-title">{title}</span>
        </div>
        <button className="brp-close" onClick={onClose}>
          <XIcon />
        </button>
      </div>
      <div className="brp-body">{children}</div>
      {footer && <div className="brp-footer">{footer}</div>}
    </div>
  );
}

/* ══ LOG CALL PANEL ══ */
function LogCallPanel({ form, onChange, onSubmit, onClose }) {
  return (
    <BottomRightPanel
      type="call"
      title="Log a Call"
      onClose={onClose}
      footer={
        <>
          <button className="brp-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="brp-submit-btn" onClick={onSubmit}>
            <PhoneIcon /> Log Call
          </button>
        </>
      }
    >
      <div className="form-row">
        <div className="form-group">
          <label>Call Type</label>
          <select
            className="form-select"
            value={form.callType || ""}
            onChange={(e) => onChange("callType", e.target.value)}
          >
            <option value="">Select…</option>
            <option>Outbound</option>
            <option>Inbound</option>
          </select>
        </div>
        <div className="form-group">
          <label>Duration (mins)</label>
          <input
            className="form-input"
            type="number"
            min="0"
            placeholder="e.g. 5"
            value={form.duration || ""}
            onChange={(e) => onChange("duration", e.target.value)}
          />
        </div>
      </div>
      <div className="form-group">
        <label>Outcome</label>
        <select
          className="form-select"
          value={form.outcome || ""}
          onChange={(e) => onChange("outcome", e.target.value)}
        >
          <option value="">Select outcome…</option>
          <option>Interested</option>
          <option>Not Interested</option>
          <option>Callback Requested</option>
          <option>No Answer</option>
          <option>Busy / Call Later</option>
          <option>Wrong Number</option>
        </select>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Call Date</label>
          <input
            className="form-input"
            type="date"
            value={form.callDate || ""}
            onChange={(e) => onChange("callDate", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Call Time</label>
          <input
            className="form-input"
            type="time"
            value={form.callTime || ""}
            onChange={(e) => onChange("callTime", e.target.value)}
          />
        </div>
      </div>
      <div className="form-group">
        <label>Notes</label>
        <textarea
          className="form-textarea"
          placeholder="Add call notes…"
          value={form.notes || ""}
          onChange={(e) => onChange("notes", e.target.value)}
        />
      </div>
    </BottomRightPanel>
  );
}

/* ══ CREATE TASK PANEL ══ */
function CreateTaskPanel({ form, onChange, onSubmit, onClose }) {
  return (
    <BottomRightPanel
      type="task"
      title="Create Task"
      onClose={onClose}
      footer={
        <>
          <button className="brp-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="brp-submit-btn" onClick={onSubmit}>
            <TaskIcon /> Create Task
          </button>
        </>
      }
    >
      <div className="form-group">
        <label>Task Title</label>
        <input
          className="form-input"
          placeholder="e.g. Confirm branch appointment"
          value={form.title || ""}
          onChange={(e) => onChange("title", e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Task Type</label>
        <select
          className="form-select"
          value={form.taskType || ""}
          onChange={(e) => onChange("taskType", e.target.value)}
        >
          <option value="">Select type…</option>
          <option>Follow Up Call</option>
          <option>Document Collection</option>
          <option>Branch Appointment</option>
          <option>Jewellery Visit</option>
          <option>KYC Follow Up</option>
          <option>Other</option>
        </select>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Due Date</label>
          <input
            className="form-input"
            type="date"
            value={form.dueDate || ""}
            onChange={(e) => onChange("dueDate", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Priority</label>
          <select
            className="form-select"
            value={form.priority || "Medium"}
            onChange={(e) => onChange("priority", e.target.value)}
          >
            <option value="High">🔴 High</option>
            <option value="Medium">🟡 Medium</option>
            <option value="Low">🔵 Low</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Assigned To</label>
        <input
          className="form-input"
          placeholder="e.g. Sales User"
          value={form.assignedTo || ""}
          onChange={(e) => onChange("assignedTo", e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Reminder</label>
        <select
          className="form-select"
          value={form.reminder || ""}
          onChange={(e) => onChange("reminder", e.target.value)}
        >
          <option value="">No reminder</option>
          <option>15 minutes before</option>
          <option>30 minutes before</option>
          <option>1 hour before</option>
          <option>1 day before</option>
        </select>
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea
          className="form-textarea"
          placeholder="Task description…"
          value={form.description || ""}
          onChange={(e) => onChange("description", e.target.value)}
        />
      </div>
    </BottomRightPanel>
  );
}

/* ══ SEND EMAIL PANEL ══ */
function SendEmailPanel({
  form,
  onChange,
  onSubmit,
  onClose,
  leadEmail,
  leadData,
}) {
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const defaultTo =
    form.to !== undefined
      ? form.to
      : leadEmail !== "Not captured"
        ? leadEmail
        : "";

  const loadTemplate = (templateKey) => {
    onChange("template", templateKey);

    if (!templateKey) return;

    const template = EMAIL_TEMPLATES[templateKey];
    if (!template) return;

    const customerName =
      `${leadData?.firstName || ""} ${leadData?.lastName || ""}`.trim() ||
      "Customer";
    const verificationLink = buildEmailVerificationLink({
      leadNumber: leadData?.leadNumber,
      email: leadData?.email,
    });

    const rendered = renderTemplate(template, {
      customerName,
      leadNumber: leadData?.leadNumber || "",
      product: leadData?.product || "",
      loanType: leadData?.facilityInterest || "Gold Loan",
      requestedLoanAmount: leadData?.requestedLoanAmount || "",
      branchName: leadData?.branchName || "",
      verificationLink,
    });

    onChange("subject", rendered.subject);
    onChange("bodyHtml", rendered.bodyHtml);
  };

  return (
    <BottomRightPanel
      type="email"
      title="Compose Email"
      onClose={onClose}
      footer={
        <>
          <button className="brp-cancel-btn" onClick={onClose}>
            Discard
          </button>
          <button className="brp-submit-btn" onClick={onSubmit}>
            <MailIcon /> Send Email
          </button>
        </>
      }
    >
      <div className="email-recipients-block">
        <div className="email-field-row">
          <span className="email-field-lbl">To</span>
          <input
            className="form-input email-addr-input"
            type="email"
            placeholder="recipient@example.com"
            value={defaultTo}
            onChange={(e) => onChange("to", e.target.value)}
          />
          <div className="email-cc-bcc-toggles">
            {!showCc && (
              <button
                type="button"
                className="toggle-link"
                onClick={() => setShowCc(true)}
              >
                Cc
              </button>
            )}
            {!showBcc && (
              <button
                type="button"
                className="toggle-link"
                onClick={() => setShowBcc(true)}
              >
                Bcc
              </button>
            )}
          </div>
        </div>
        {showCc && (
          <div className="email-field-row">
            <span className="email-field-lbl">Cc</span>
            <input
              className="form-input email-addr-input"
              type="email"
              placeholder="cc@example.com"
              value={form.cc || ""}
              onChange={(e) => onChange("cc", e.target.value)}
            />
            <button
              type="button"
              className="toggle-remove"
              onClick={() => {
                setShowCc(false);
                onChange("cc", "");
              }}
            >
              ✕
            </button>
          </div>
        )}
        {showBcc && (
          <div className="email-field-row">
            <span className="email-field-lbl">Bcc</span>
            <input
              className="form-input email-addr-input"
              type="email"
              placeholder="bcc@example.com"
              value={form.bcc || ""}
              onChange={(e) => onChange("bcc", e.target.value)}
            />
            <button
              type="button"
              className="toggle-remove"
              onClick={() => {
                setShowBcc(false);
                onChange("bcc", "");
              }}
            >
              ✕
            </button>
          </div>
        )}
        <div className="email-field-row">
          <span className="email-field-lbl">From</span>
          <select
            className="form-select email-from-select"
            value={form.from || "goldloan@apexbank.com"}
            onChange={(e) => onChange("from", e.target.value)}
          >
            <option>goldloan@apexbank.com</option>
            <option>branch.support@apexbank.com</option>
            <option>noreply@apexbank.com</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Subject</label>
        <input
          className="form-input"
          placeholder="Email subject"
          value={form.subject || ""}
          onChange={(e) => onChange("subject", e.target.value)}
        />
      </div>
      <div className="form-group" style={{ flex: 1 }}>
        <label>Message</label>
        <RichTextEditor
          value={form.bodyHtml || ""}
          onChange={(html) => onChange("bodyHtml", html)}
          placeholder="Write your email message here…"
        />
      </div>
      <div className="form-group">
        <label>Template</label>
        <select
          className="form-select"
          value={form.template || ""}
          onChange={(e) => loadTemplate(e.target.value)}
        >
          <option value="">Load a template…</option>
          <option value="EMAIL_VERIFICATION">Email Verification</option>
          <option value="DOCUMENT_REQUEST">Document Request</option>
        </select>
      </div>
    </BottomRightPanel>
  );
}

/* ══ NOTES PANEL ══ */
function NotesPanel({ form, onChange, onSubmit, onClose }) {
  return (
    <BottomRightPanel
      type="notes"
      title="Add Note"
      onClose={onClose}
      footer={
        <>
          <button className="brp-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="brp-submit-btn" onClick={onSubmit}>
            <NoteIcon /> Save Note
          </button>
        </>
      }
    >
      <div className="form-group">
        <label>Note Title</label>
        <input
          className="form-input"
          placeholder="Brief summary of this note"
          value={form.noteTitle || ""}
          onChange={(e) => onChange("noteTitle", e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Note Category</label>
        <select
          className="form-select"
          value={form.category || ""}
          onChange={(e) => onChange("category", e.target.value)}
        >
          <option value="">Select category…</option>
          <option>General</option>
          <option>Customer Interaction</option>
          <option>Internal</option>
          <option>Follow Up</option>
          <option>Escalation</option>
          <option>Document Note</option>
        </select>
      </div>
      <div className="form-group">
        <label>Note</label>
        <textarea
          className="form-textarea"
          style={{ minHeight: 130 }}
          placeholder="Type your note here…"
          value={form.noteBody || ""}
          onChange={(e) => onChange("noteBody", e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Visibility</label>
        <select
          className="form-select"
          value={form.visibility || "Private"}
          onChange={(e) => onChange("visibility", e.target.value)}
        >
          <option value="Private">🔒 Private (Only Me)</option>
          <option value="Team">👥 Team</option>
          <option value="All">🌐 All Users</option>
        </select>
      </div>
    </BottomRightPanel>
  );
}

/* ══ CENTER MODALS ══ */
function Modal({ title, onClose, children, footer }) {
  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-box">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>
            <XIcon />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

function DisqualifyModal({ form, onChange, onSubmit, onClose }) {
  return (
    <Modal
      title="Disqualify Lead"
      onClose={onClose}
      footer={
        <>
          <button className="modal-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="modal-btn-danger" onClick={onSubmit}>
            <BanIcon /> Disqualify
          </button>
        </>
      }
    >
      <div className="modal-alert warning">
        <span>⚠️</span>
        <div>
          <strong>Confirm Disqualification</strong>
          <p>
            This lead will be marked Disqualified. You can reset this status
            later.
          </p>
        </div>
      </div>
      <div className="form-group">
        <label>Reason</label>
        <select
          className="form-select"
          value={form.reason || ""}
          onChange={(e) => onChange("reason", e.target.value)}
        >
          <option value="">Select reason…</option>
          <option>Not Interested</option>
          <option>No Eligible Jewellery</option>
          <option>Ownership Proof Unavailable</option>
          <option>Policy Exception</option>
          <option>Duplicate Lead</option>
          <option>No Response — Multiple Attempts</option>
          <option>Other</option>
        </select>
      </div>
      <div className="form-group">
        <label>Additional Notes</label>
        <textarea
          className="form-textarea"
          placeholder="Any context…"
          value={form.notes || ""}
          onChange={(e) => onChange("notes", e.target.value)}
        />
      </div>
    </Modal>
  );
}

function ConvertModal({ onSubmit, onClose, relationship }) {
  return (
    <Modal
      title="Convert Lead"
      onClose={onClose}
      footer={
        <>
          <button className="modal-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="modal-btn-success" onClick={onSubmit}>
            <CheckIcon /> Convert Lead
          </button>
        </>
      }
    >
      <div className="modal-alert success">
        <span>✅</span>
        <div>
          <strong>Convert to Gold Loan Application</strong>
          <p>
            The lead will be marked <strong>Converted</strong> and the four-step
            application journey will begin.
          </p>
        </div>
      </div>
      <div
        className={`convert-relationship-summary ${relationship?.type?.toLowerCase() || "unknown"}`}
      >
        <span>{relationship?.type === "ETB" ? "ETB" : "NTB"}</span>
        <div>
          <strong>
            {relationship?.type === "ETB"
              ? "Existing customer candidate"
              : "New-to-bank onboarding required"}
          </strong>
          <p>
            {relationship?.type === "ETB"
              ? "Customer identity will be confirmed using Customer ID/account details and OTP."
              : "Full customer onboarding and KYC will be completed in the application flow."}
          </p>
        </div>
      </div>
    </Modal>
  );
}

/* ══ ACTIVITY ITEM ══ */
function ActivityItem({ item, isLast }) {
  const cfgs = {
    call: { emoji: "📞", cls: "call", lbl: "Call" },
    task: { emoji: "✅", cls: "task", lbl: "Task" },
    email: { emoji: "✉️", cls: "email", lbl: "Email" },
    relationship: { emoji: "🏦", cls: "relationship", lbl: "CBS Check" },
    status: { emoji: "🔄", cls: "status", lbl: "Update" },
    note: { emoji: "📝", cls: "note", lbl: "Note" },
  };
  const c = cfgs[item.type] || cfgs.status;

  return (
    <div className="tl-item">
      <div className="tl-left">
        <div className={`tl-dot tl-dot-${c.cls}`}>{c.emoji}</div>
        {!isLast && <div className="tl-line" />}
      </div>
      <div className="tl-body">
        <div className="tl-row-top">
          <span className={`tl-tag tl-tag-${c.cls}`}>{c.lbl}</span>
          <time className="tl-time">{item.time}</time>
        </div>
        <strong className="tl-title">{item.title}</strong>
        {item.desc && <p className="tl-desc">{item.desc}</p>}
        {item.details && Object.keys(item.details).length > 0 && (
          <div className={`tl-card tl-card-${c.cls}`}>
            {item.type === "call" && (
              <>
                {item.details.callType && (
                  <div className="tl-kv">
                    <span>Type</span>
                    <strong>{item.details.callType}</strong>
                  </div>
                )}
                {item.details.duration && (
                  <div className="tl-kv">
                    <span>Duration</span>
                    <strong>{item.details.duration} min</strong>
                  </div>
                )}
                {item.details.outcome && (
                  <div className="tl-kv">
                    <span>Outcome</span>
                    <strong>{item.details.outcome}</strong>
                  </div>
                )}
                {item.details.notes && (
                  <div className="tl-kv">
                    <span>Notes</span>
                    <strong>{item.details.notes}</strong>
                  </div>
                )}
              </>
            )}
            {item.type === "task" && (
              <>
                {item.details.priority && (
                  <div className="tl-kv">
                    <span>Priority</span>
                    <strong>
                      <span
                        className={`task-chip ${item.details.priority.toLowerCase()}`}
                      >
                        {item.details.priority}
                      </span>
                    </strong>
                  </div>
                )}
                {item.details.dueDate && (
                  <div className="tl-kv">
                    <span>Due</span>
                    <strong>{item.details.dueDate}</strong>
                  </div>
                )}
                {item.details.assignedTo && (
                  <div className="tl-kv">
                    <span>Assigned</span>
                    <strong>{item.details.assignedTo}</strong>
                  </div>
                )}
                {item.details.description && (
                  <div className="tl-kv">
                    <span>Desc</span>
                    <strong>{item.details.description}</strong>
                  </div>
                )}
              </>
            )}
            {item.type === "email" && (
              <>
                {item.details.to && (
                  <div className="tl-kv">
                    <span>To</span>
                    <strong>{item.details.to}</strong>
                  </div>
                )}
                {item.details.subject && (
                  <div className="tl-kv">
                    <span>Subject</span>
                    <strong>{item.details.subject}</strong>
                  </div>
                )}
              </>
            )}
            {item.type === "note" && (
              <>
                {item.details.noteTitle && (
                  <div className="tl-kv">
                    <span>Title</span>
                    <strong>{item.details.noteTitle}</strong>
                  </div>
                )}
                {item.details.noteBody && (
                  <div className="tl-kv">
                    <span>Note</span>
                    <strong>{item.details.noteBody}</strong>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══ DOCUMENT ROW ══ */
function DocumentRow({ doc, onDelete }) {
  const ext = doc.name.split(".").pop().toUpperCase();
  const colors = {
    PDF: "#e74c3c",
    DOCX: "#2e7d32",
    DOC: "#2e7d32",
    XLSX: "#217346",
    XLS: "#217346",
    JPG: "#e67e22",
    JPEG: "#e67e22",
    PNG: "#3498db",
  };
  const col = colors[ext] || "#6c757d";

  return (
    <div className="doc-row">
      <div className="doc-ext" style={{ background: col + "18", color: col }}>
        {ext}
      </div>
      <div className="doc-info">
        <strong>{doc.name}</strong>
        <span>
          {formatFileSize(doc.size)} · {doc.uploadedAt}
        </span>
      </div>
      <button
        className="doc-del-btn"
        onClick={() => onDelete(doc.id)}
        title="Remove"
      >
        <TrashIcon />
      </button>
    </div>
  );
}

/* ══ MAIN COMPONENT ══ */
function LeadDetailPage({ onLogout, onConvertLead }) {
  const navigate = useNavigate();
  const { leadId } = useParams();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);

  const initialData = buildLeadDetails(lead || {});

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [leadStatus, setLeadStatus] = useState(initialData.leadStage);
  const [leadData, setLeadData] = useState(initialData);
  const [activities, setActivities] = useState([
    {
      id: 1,
      type: "status",
      title: "Lead Created",
      desc: `Created via ${initialData.generationMode} · Source: ${initialData.leadOrigin}`,
      time: "Today, 9:30 AM",
    },
  ]);
  const [editingField, setEditingField] = useState(null);
  const [sectionEditMode, setSectionEditMode] = useState(null);
  const [sectionDraft, setSectionDraft] = useState({});
  const [showModal, setShowModal] = useState(null);
  const [showPanel, setShowPanel] = useState(null);
  const [panelForm, setPanelForm] = useState({});
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [relationship, setRelationship] = useState(
    getRelationshipResult(initialData.mobile),
  );
  const [isRelationshipChecking, setIsRelationshipChecking] = useState(false);
  const [relationshipCheckVersion, setRelationshipCheckVersion] = useState(0);
  const relationshipActivityRef = useRef("");
  const fileInputRef = useRef(null);
  const client = generateClient();

  const {
    verificationSent,
    isLoading,
    errorMessage,
    successMessage,
    handleVerify,
    handleResend,
  } = useVerificationState(leadData);

  const isEtbCustomer = relationship.type === "ETB";
  const mobileVerified =
    isEtbCustomer || leadData.mobileVerified === "Yes";
  const emailVerified = isEtbCustomer || leadData.emailVerified === "Yes";
  const effectiveSectionDraft = isEtbCustomer
    ? { ...sectionDraft, mobileVerified: "Yes", emailVerified: "Yes" }
    : sectionDraft;

  useEffect(() => {
    const subscription = client
      .graphql({
        query: `
        subscription OnLeadUpdated($leadnumber: ID!) {
          onLeadUpdated(leadnumber: $leadnumber) {
            leadnumber
            emailverified
            mobileverified
          }
        }
      `,
        variables: {
          leadnumber: leadId,
        },
      })
      .subscribe({
        next: ({ data }) => {
          console.log("EVENT:", data);
          const updatedLead = data?.onLeadUpdated;

          if (!updatedLead) return;

          console.log("Realtime update for THIS lead:", updatedLead);

          setLead((prev) => {
            if (!prev) return prev;

            return {
              ...prev,
              emailVerified:
                String(updatedLead.emailverified).toLowerCase() === "true"
                  ? "Yes"
                  : "No",
              mobileVerified:
                String(updatedLead.mobileverified).toLowerCase() === "true"
                  ? "Yes"
                  : "No",
            };
          });
        },
        error: (err) => {
          console.error("Subscription error:", err);
        },
      });

    return () => subscription.unsubscribe();
  }, [leadId]);

  useEffect(() => {
    if (lead) {
      const updatedData = buildLeadDetails(lead);
      setLeadData(updatedData);
      setLeadStatus(updatedData.leadStage);
      setActivities([
        {
          id: 1,
          type: "status",
          title: "Lead Created",
          desc: `Created via ${updatedData.generationMode} · Source: ${updatedData.leadOrigin}`,
          time: "Today, 9:30 AM",
        },
      ]);
    }
  }, [leadId, lead]);

  useEffect(() => {
    const normalizedMobile = normalizeMobileNumber(leadData.mobile);

    if (!validateIndianMobileNumber(normalizedMobile)) {
      setIsRelationshipChecking(false);
      setRelationship(getRelationshipResult(normalizedMobile));
      return undefined;
    }

    setIsRelationshipChecking(true);

    const timer = window.setTimeout(() => {
      const result = getRelationshipResult(normalizedMobile);
      setRelationship(result);
      setIsRelationshipChecking(false);

      const activityKey = `${leadId}:${normalizedMobile}:${result.type}`;
      if (relationshipActivityRef.current !== activityKey) {
        relationshipActivityRef.current = activityKey;
        setActivities((current) => [
          {
            id: Date.now(),
            type: "relationship",
            title:
              result.type === "ETB"
                ? "ETB customer candidate identified"
                : "No CBS relationship found",
            desc:
              result.type === "ETB"
                ? `Unique CBS match found · Customer ID ${result.customerId}`
                : "Lead classified as Potential NTB · Full onboarding required",
            time: formatTime(),
          },
          ...current,
        ]);
      }
    }, 650);

    return () => window.clearTimeout(timer);
  }, [leadData.mobile, leadId, relationshipCheckVersion]);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const res = await fetch(
          `https://xx8ep3p2ue.execute-api.ap-south-1.amazonaws.com/prod/leads/${leadId}`,
        );

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

            leadStage: dbLead.stage,
            mobileVerified:
              String(dbLead.mobileverified).toLowerCase() === "true"
                ? "Yes"
                : "No",
            emailVerified:
              String(dbLead.emailverified).toLowerCase() === "true"
                ? "Yes"
                : "No",
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

  const handleFieldEdit = (key, val) => {
    setSectionEditMode(null);
    setEditingField({ key, value: val });
  };

  const handleFieldChange = (val) =>
    setEditingField((p) => ({ ...p, value: val }));

  const handleFieldSave = () => {
    if (editingField) {
      setLeadData((p) => ({ ...p, [editingField.key]: editingField.value }));
      setEditingField(null);
    }
  };

  const handleFieldCancel = () => setEditingField(null);

  const startSectionEdit = (id) => {
    setEditingField(null);
    setSectionEditMode(id);
    setSectionDraft({ ...leadData });
  };

  const saveSectionEdit = () => {
    setLeadData({ ...leadData, ...sectionDraft });
    setSectionEditMode(null);
    setSectionDraft({});
  };

  const cancelSectionEdit = () => {
    setSectionEditMode(null);
    setSectionDraft({});
  };

  const handlePanelChange = (f, v) => setPanelForm((p) => ({ ...p, [f]: v }));
  const closePanel = () => {
    setShowPanel(null);
    setPanelForm({});
  };
  const addActivity = (item) =>
    setActivities((p) => [
      { id: Date.now(), ...item, time: formatTime() },
      ...p,
    ]);

  const handleLogCall = () => {
    addActivity({
      type: "call",
      title: `${panelForm.callType || "Outbound"} Call Logged`,
      desc: `Outcome: ${panelForm.outcome || "N/A"} · ${panelForm.duration || "N/A"} min`,
      details: { ...panelForm },
    });
    closePanel();
  };

  const handleCreateTask = () => {
    addActivity({
      type: "task",
      title: panelForm.title || "New Task",
      desc: `${panelForm.priority || "Medium"} priority · Due: ${panelForm.dueDate || "Not set"}`,
      details: { ...panelForm },
    });
    closePanel();
  };

  const handleSendEmail = async () => {
    const to = panelForm.to || leadData.email || "";
    const subject = panelForm.subject || "";
    const bodyHtml = panelForm.bodyHtml || "";

    if (!validateEmailAddress(to)) {
      alert("Please enter a valid recipient email address.");
      return;
    }

    if (!subject.trim()) {
      alert("Please enter an email subject.");
      return;
    }

    if (!bodyHtml.trim()) {
      alert("Please enter an email message.");
      return;
    }

    try {
      await sendEmail({
        toEmail: to,
        subject,
        bodyHtml,
        cc: panelForm.cc || undefined,
        bcc: panelForm.bcc || undefined,
      });

      addActivity({
        type: "email",
        title: `Email: ${subject || "(No subject)"}`,
        desc: `To: ${to || "N/A"}`,
        details: { to, subject },
      });

      closePanel();
    } catch (error) {
      console.error("Error while sending email:", error);
      alert(
        error.message ||
          "Unable to send email. Please check API Gateway, Lambda, SES and CORS configuration.",
      );
    }
  };

  const handleSaveNote = () => {
    addActivity({
      type: "note",
      title: panelForm.noteTitle || "Note Added",
      desc: panelForm.noteBody || "",
      details: { ...panelForm },
    });
    closePanel();
  };

  const handleDisqualify = () => {
    setLeadStatus("Disqualified");
    setLeadData((p) => ({ ...p, leadStage: "Disqualified" }));
    addActivity({
      type: "status",
      title: "Lead Disqualified",
      desc: `Reason: ${panelForm.reason || "Not specified"}`,
    });
    setShowModal(null);
    setPanelForm({});
  };

  const handleConvert = async () => {
    try {
      const conversionResponse = await fetch(
        `https://xx8ep3p2ue.execute-api.ap-south-1.amazonaws.com/prod/leads/${leadId}/convert`,
        {
          method: "PUT",
        },
      );

      let conversionData = {};

      try {
        conversionData = await conversionResponse.json();
      } catch {
        conversionData = {};
      }

      if (!conversionResponse.ok) {
        throw new Error(
          conversionData.message || "Unable to convert the Gold Loan lead.",
        );
      }

      const leadSuffix = String(leadData.leadNumber || leadId)
        .replace(/\D/g, "")
        .slice(-6)
        .padStart(6, "0");

      const applicationNumber =
        conversionData.applicationNumber ||
        conversionData.applicationnumber ||
        conversionData.data?.applicationNumber ||
        conversionData.data?.applicationnumber ||
        `GL-${new Date().getFullYear()}-${leadSuffix}`;

      const convertedLead = {
        ...lead,
        ...leadData,
        id: leadData.leadNumber,
        status: "Converted",
        leadStage: "Converted",
        loanFileStatus: "Application In Progress",
        relationshipType: relationship.type,
        cbsCustomerId:
          relationship.type === "ETB" ? relationship.customerId : null,
        applicationNumber,
      };

      setLeadStatus("Converted");

      setLeadData((current) => ({
        ...current,
        leadStage: "Converted",
        loanFileStatus: "Application In Progress",
        applicationNumber,
      }));

      addActivity({
        type: "status",
        title: "Gold Loan application created",
        desc: `Application ${applicationNumber} initiated successfully.`,
      });

      const recipientEmail = validateEmailAddress(leadData.email)
        ? leadData.email
        : relationship.type === "ETB"
          ? relationship.registeredEmailAddress
          : "";

      /*
      * Email failure should not reverse a successful lead conversion.
      */
      if (validateEmailAddress(recipientEmail)) {
        try {
          const applicationTemplate =
            EMAIL_TEMPLATES.GOLD_LOAN_APPLICATION_CREATED;

          if (!applicationTemplate) {
            throw new Error(
              "GOLD_LOAN_APPLICATION_CREATED is missing from emailTemplates.js.",
            );
          }

          const customerName =
            `${leadData.firstName || ""} ${leadData.lastName || ""}`.trim() ||
            "Customer";

          const renderedEmail = renderTemplate(applicationTemplate, {
            customerName,
            applicationNumber,
            requestedLoanAmount: leadData.requestedLoanAmount,
            facilityInterest: leadData.facilityInterest,
            branchName: leadData.branchName,
            appointmentDate: leadData.appointmentDate || "To be confirmed",
          });

          await sendEmail({
            toEmail: recipientEmail,
            subject: renderedEmail.subject,
            bodyHtml: renderedEmail.bodyHtml,
          });

          addActivity({
            type: "email",
            title: "Gold Loan application confirmation sent",
            desc: `Application ${applicationNumber} · To: ${recipientEmail}`,
            details: {
              to: recipientEmail,
              subject: renderedEmail.subject,
            },
          });
        } catch (emailError) {
          console.error(
            "Gold Loan application confirmation email failed:",
            emailError,
          );

          addActivity({
            type: "note",
            title: "Application email requires attention",
            desc:
              emailError.message ||
              "The customer confirmation email could not be sent.",
          });
        }
      } else {
        addActivity({
          type: "note",
          title: "Application email pending",
          desc: "Capture or confirm the customer’s email address before sending the application confirmation.",
        });
      }

      setShowModal(null);

      if (onConvertLead) {
        onConvertLead(convertedLead);
      }

      navigate(`/applications/${leadId}/onboarding`, {
        state: {
          relationshipType: relationship.type,
          cbsCustomerId:
            relationship.type === "ETB" ? relationship.customerId : null,
          applicationNumber,
        },
      });
    } catch (error) {
      console.error("Convert Lead Error:", error);
    }
  };

  const handleStatusStep = (step) => {
    if (step === leadStatus) return;
    if (step === "Disqualified") {
      setShowModal("disqualify");
      return;
    }
    if (step === "Converted") {
      setShowModal("convert");
      return;
    }

    const prev = leadStatus;
    setLeadStatus(step);
    setLeadData((d) => ({ ...d, leadStage: step }));
    addActivity({
      type: "status",
      title: `Status → ${step}`,
      desc: `Changed from "${prev}" to "${step}"`,
    });
  };

  const handleDocUpload = (e) => {
    const files = Array.from(e.target.files || []);
    setUploadedDocs((p) => [
      ...p,
      ...files.map((f) => ({
        id: Date.now() + Math.random(),
        name: f.name,
        size: f.size,
        uploadedAt:
          new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          }) +
          ", " +
          new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
          }),
      })),
    ]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDocDelete = (id) =>
    setUploadedDocs((p) => p.filter((d) => d.id !== id));

  const fp = (key, sectionId) => ({
    fieldKey: key,
    value:
      isEtbCustomer &&
      (key === "mobileVerified" || key === "emailVerified")
        ? "Yes"
        : leadData[key] ?? "—",
    sectionId,
    sectionEditMode,
    sectionDraft: effectiveSectionDraft,
    onSectionDraftChange: (k, v) => setSectionDraft((p) => ({ ...p, [k]: v })),
    editingField,
    onEdit: handleFieldEdit,
    onChange: handleFieldChange,
    onSave: handleFieldSave,
    onCancel: handleFieldCancel,
  });

  const sp = (id) => ({
    id,
    sectionEditMode,
    onSectionEdit: startSectionEdit,
    onSectionSave: saveSectionEdit,
    onSectionCancel: cancelSectionEdit,
  });

  const openActionPanel = (type) => {
    setActiveTab("activity");
    setShowPanel(type);

    if (type === "email") {
      setPanelForm({
        to: leadData.email !== "Not captured" ? leadData.email : "",
        from: "goldloan@apexbank.com",
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  if (!lead) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          gap: "16px",
          fontFamily: "inherit",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", color: "#1e3a5f" }}>Lead Not Found</h2>
        <p style={{ color: "#6b7280" }}>
          No lead found with ID <strong>{leadId}</strong>.
        </p>
        <button
          style={{
            padding: "10px 24px",
            background: "#1e5fa5",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "0.95rem",
          }}
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  const statusClass = leadStatus.toLowerCase().replace(/\s+/g, "-");
  const journeyIdx =
    leadStatus === "Converted" ? 3 : leadStatus === "In Progress" ? 2 : 1;
  const relationshipReady =
    !isRelationshipChecking && Boolean(relationship.type);
  const qualificationItems = [
    {
      label: "Mobile number captured",
      complete: validateIndianMobileNumber(leadData.mobile),
    },
    { label: "Customer relationship determined", complete: relationshipReady },
    {
      label: "Gold Loan requirement captured",
      complete: leadData.requestedLoanAmount !== "To be confirmed",
    },
    {
      label: "Facility interest captured",
      complete: leadData.facilityInterest !== "To be confirmed",
    },
    {
      label: "Jewellery availability confirmed",
      complete: leadData.jewelleryAvailable !== "To be confirmed",
    },
  ];
  const completedQualificationItems = qualificationItems.filter(
    (item) => item.complete,
  ).length;
  const canConvert = relationshipReady && leadStatus !== "Disqualified";

  return (
    <div className="lead-detail-layout">
      {showPanel && <div className="panel-backdrop" />}

      <aside className={`app-sidebar${isSidebarCollapsed ? " collapsed" : ""}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-text">
            <h2>Apex Bank Portal</h2>
            <p>Sales workspace</p>
          </div>
        </div>
        <button
          className="sidebar-collapse-btn"
          onClick={() => setIsSidebarCollapsed((c) => !c)}
        >
          <span className="sidebar-collapse-icon">
            {isSidebarCollapsed ? <ExpandIcon /> : <CollapseIcon />}
          </span>
          <span className="nav-label">
            {isSidebarCollapsed ? "Expand" : "Collapse"}
          </span>
        </button>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`nav-item${item.active ? " active" : ""}`}
              onClick={item.isBack ? () => navigate("/dashboard") : undefined}
              title={item.label}
              data-label={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-insight-card">
          <span>
            {relationship.type === "ETB"
              ? "ETB customer"
              : relationship.type === "NTB"
                ? "Potential NTB"
                : "CBS lookup"}
          </span>
          <strong>
            {leadData.leadNumber} — {leadData.firstName} {leadData.lastName}
          </strong>
          <p>
            {relationship.type === "ETB"
              ? `${relationship.customerId} · ${relationship.homeBranch}`
              : `${leadData.product} · ${leadData.branchName}`}
          </p>
        </div>
        <div className="sidebar-footer">
          <div className="sidebar-footer-avatar">SU</div>
          <div className="sidebar-footer-info">
            <p>Logged in as</p>
            <strong>Sales User</strong>
          </div>
        </div>
      </aside>

      <main className="lead-detail-main">
        <header className="record-topbar">
          <div className="record-topbar-left">
            <button className="back-btn" onClick={() => navigate("/dashboard")}>
              <BackIcon /> Back to Dashboard
            </button>
            <div className="record-title-row">
              <div className="record-avatar">
                {leadData.firstName?.charAt(0)}
                {leadData.lastName?.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span className="page-eyebrow">{leadData.leadNumber}</span>
                <div className="record-title-line">
                  <h1>
                    {leadData.firstName} {leadData.lastName}
                  </h1>
                  <span className={`status-pill ${statusClass}`}>
                    {leadStatus}
                  </span>
                  {mobileVerified && (
                    <span className="verified-badge mobile-badge">
                      📱 Mobile Verified
                    </span>
                  )}
                  {emailVerified && (
                    <span className="verified-badge email-badge">
                      ✉️ Email Verified
                    </span>
                  )}
                </div>
                <p className="record-meta">
                  Apex Bank · {leadData.product} · {leadData.branchName}
                </p>
                <StatusPath
                  currentStatus={leadStatus}
                  onStepClick={handleStatusStep}
                />
              </div>
            </div>
            <div className="highlights-panel">
              <div className="highlight-chip primary">
                <span className="hc-label">Lead #</span>
                <strong className="hc-val">{leadData.leadNumber}</strong>
              </div>
              <div className="highlight-chip gold">
                <span className="hc-label">Product</span>
                <strong className="hc-val">Gold Loan</strong>
              </div>
              <div className="highlight-chip">
                <span className="hc-label">Requirement</span>
                <strong className="hc-val">
                  {leadData.requestedLoanAmount}
                </strong>
              </div>
              <div className="highlight-chip">
                <span className="hc-label">Facility</span>
                <strong className="hc-val">{leadData.facilityInterest}</strong>
              </div>
              <div
                className={`highlight-chip relationship ${relationship.type?.toLowerCase() || "pending"}`}
              >
                <span className="hc-label">Relationship</span>
                <strong className="hc-val">
                  {isRelationshipChecking
                    ? "Checking…"
                    : relationship.type || "Pending"}
                </strong>
              </div>
              <div className="highlight-chip">
                <span className="hc-label">Lead Age</span>
                <strong className="hc-val">{leadData.leadAge}</strong>
              </div>
              <div className="highlight-chip">
                <span className="hc-label">Assigned To</span>
                <strong className="hc-val">{leadData.assignedToName}</strong>
              </div>
              {!mobileVerified && (
                <div className="highlight-chip amber">
                  <span className="hc-label">Mobile</span>
                  <strong className="hc-val">⚠ Unverified</strong>
                </div>
              )}
              {!emailVerified && (
                <div className="highlight-chip amber">
                  <span className="hc-label">Email</span>
                  <strong className="hc-val">⚠ Unverified</strong>
                </div>
              )}
            </div>
          </div>
          <div className="record-actions">
            <button
              className="record-action-logout"
              onClick={async () => {
                if (onLogout) await onLogout();
                navigate("/login", { replace: true });
              }}
            >
              <LogoutIcon /> Sign Out
            </button>
            {leadStatus !== "Disqualified" && leadStatus !== "Converted" && (
              <button
                className="record-action-danger"
                onClick={() => setShowModal("disqualify")}
              >
                <BanIcon /> Disqualify
              </button>
            )}
            {leadStatus !== "Converted" && leadStatus !== "Disqualified" && (
              <button
                className="record-action-success"
                onClick={() => setShowModal("convert")}
                disabled={!canConvert}
                title={
                  !canConvert
                    ? "Complete the CBS relationship check before conversion"
                    : "Convert to Gold Loan application"
                }
              >
                <CheckIcon /> Convert Lead
              </button>
            )}
            {leadStatus === "Converted" && (
              <button
                className="record-action-success"
                onClick={() => navigate(`/applications/${leadId}/onboarding`)}
              >
                <CheckIcon /> Open Application
              </button>
            )}
            {leadStatus === "Disqualified" && (
              <button
                className="record-action-outline"
                onClick={() => handleStatusStep("New")}
              >
                ↩ Reset to New
              </button>
            )}
          </div>
        </header>

        <CustomerRelationshipPanel
          relationship={relationship}
          isChecking={isRelationshipChecking}
          mobile={leadData.mobile}
          onRecheck={() =>
            setRelationshipCheckVersion((version) => version + 1)
          }
        />

        <div className="record-tabs">
          {[
            { id: "overview", label: "Overview" },
            { id: "activity", label: "Activity", badge: activities.length },
            {
              id: "documents",
              label: "Documents",
              badge: uploadedDocs.length || null,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`record-tab${activeTab === tab.id ? " active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {tab.badge != null && (
                <span className="tab-badge">{tab.badge}</span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="record-page-grid">
            <div className="record-main-col">
              <Section
                title="Gold Loan Enquiry"
                subtitle="Core enquiry details and acquisition source."
                sectionIcon="📋"
                accentColor="#00518f"
                {...sp("primary")}
              >
                <EditableField
                  label="Lead Number"
                  {...fp("leadNumber", "primary")}
                />
                <EditableField label="Product" {...fp("product", "primary")} />
                <EditableField
                  label="Lead Stage"
                  {...fp("leadStage", "primary")}
                />
                <EditableField
                  label="Lead Origin"
                  {...fp("leadOrigin", "primary")}
                />
                <EditableField
                  label="Generation Mode"
                  {...fp("generationMode", "primary")}
                />
                <EditableField
                  label="Consumer System"
                  {...fp("consumerSystemName", "primary")}
                />
                <EditableField label="Lead Age" {...fp("leadAge", "primary")} />
                <EditableField
                  label="Days Since Activity"
                  {...fp("daysSinceLastActivity", "primary")}
                />
                <EditableField
                  label="Lead Sub Source"
                  {...fp("leadSubSource", "primary")}
                />
                <EditableField
                  label="Lead Sub Sub Source"
                  {...fp("leadSubSubSource", "primary")}
                />
                <EditableField
                  label="Lead Sub Disposition"
                  {...fp("leadSubDisposition", "primary")}
                />
              </Section>

              <Section
                title="Customer & Contact Information"
                subtitle="Lead identity, contact details and verification status."
                sectionIcon="👤"
                accentColor="#1f8a4c"
                {...sp("customer")}
              >
                <EditableField
                  label="First Name"
                  {...fp("firstName", "customer")}
                />
                <EditableField
                  label="Last Name"
                  {...fp("lastName", "customer")}
                />
                <EditableField
                  label="Country Code"
                  {...fp("countryCode", "customer")}
                />
                <EditableField label="Mobile" {...fp("mobile", "customer")} />
                <EditableField
                  label="Alternate Mobile"
                  {...fp("alternateMobile", "customer")}
                />
                <EditableField label="Email" {...fp("email", "customer")} />
                <EditableField
                  label="Residential Status"
                  {...fp("residentialStatus", "customer")}
                />
                <EditableField
                  label="Mobile Verified"
                  {...fp("mobileVerified", "customer")}
                />
                <EditableField
                  label="Email Verified"
                  {...fp("emailVerified", "customer")}
                />
              </Section>

              <Section
                title="Gold Loan Requirement"
                subtitle="Initial requirement captured before detailed application and jewellery appraisal."
                sectionIcon="◈"
                accentColor="#d7a21e"
                {...sp("goldRequirement")}
              >
                <EditableField
                  label="Facility Interest"
                  {...fp("facilityInterest", "goldRequirement")}
                />
                <EditableField
                  label="Purpose of Loan"
                  {...fp("loanPurpose", "goldRequirement")}
                />
                <EditableField
                  label="Indicative Amount"
                  {...fp("requestedLoanAmount", "goldRequirement")}
                />
                <EditableField
                  label="Repayment Preference"
                  {...fp("repaymentPreference", "goldRequirement")}
                />
                <EditableField
                  label="Preferred Branch"
                  {...fp("preferredBranchType", "goldRequirement")}
                />
                <EditableField
                  label="Appointment Date"
                  {...fp("appointmentDate", "goldRequirement")}
                />
                <EditableField
                  label="Jewellery Available"
                  {...fp("jewelleryAvailable", "goldRequirement")}
                />
                <EditableField
                  label="Indicative Ornaments"
                  {...fp("ornamentSummary", "goldRequirement")}
                />
                <EditableField
                  label="Ownership Proof"
                  {...fp("ownershipProofStatus", "goldRequirement")}
                />
              </Section>

              <Section
                title="Ownership & Branch Assignment"
                subtitle="Sales owner, servicing branch and downstream team."
                sectionIcon="🏢"
                accentColor="#00518f"
                {...sp("ownership")}
              >
                <EditableField
                  label="Owner Name"
                  {...fp("ownerName", "ownership")}
                />
                <EditableField
                  label="Owner Team"
                  {...fp("losOwnerTeam", "ownership")}
                />
                <EditableField
                  label="Assigned To (ID)"
                  {...fp("assignedTo", "ownership")}
                />
                <EditableField
                  label="Assigned To (Name)"
                  {...fp("assignedToName", "ownership")}
                />
                <EditableField
                  label="Branch Name"
                  {...fp("branchName", "ownership")}
                />
                <EditableField
                  label="Verification User"
                  {...fp("losVerificationUser", "ownership")}
                />
              </Section>

              <Section
                title="Application Linkage"
                subtitle="Created only after lead qualification and conversion."
                sectionIcon="🔗"
                accentColor="#c4261d"
                {...sp("application")}
              >
                <EditableField
                  label="Application Number"
                  {...fp("apsNumber", "application")}
                />
                <EditableField
                  label="Journey Status"
                  {...fp("loanFileStatus", "application")}
                />
              </Section>
            </div>

            <aside className="record-side-col">
              <section className="side-card">
                <h3>Contact Verification</h3>
                {[
                  {
                    key: "mobile",
                    label: "Mobile",
                    value: leadData.mobile,
                    verified: mobileVerified,
                  },
                  {
                    key: "email",
                    label: "Email",
                    value: leadData.email,
                    verified: emailVerified,
                  },
                ].map((item) => (
                  <div
                    className={`verify-row ${item.verified ? "verified" : "unverified"}`}
                    key={item.key}
                  >
                    <div className="verify-row-info">
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                    <div className="verify-row-actions">
                      {item.verified && (
                        <div className="verify-status-badge verified">
                          ✓ Verified
                        </div>
                      )}
                      {!item.verified && verificationSent[item.key] && (
                        <div className="verify-sent-state">
                          <span className="verify-link-sent">
                            ✓{" "}
                            {item.key === "mobile"
                              ? "OTP sent successfully"
                              : "Email sent successfully"}
                          </span>
                          <button
                            className="verify-resend-btn"
                            onClick={() => handleResend(item.key)}
                            disabled={isLoading[item.key]}
                          >
                            {isLoading[item.key] ? "Sending..." : "Resend"}
                          </button>
                        </div>
                      )}
                      {!item.verified && !verificationSent[item.key] && (
                        <div className="verify-pending-actions">
                          <div className="verify-status-badge pending">
                            ⚠ Pending
                          </div>
                          <button
                            className="verify-btn"
                            onClick={() => handleVerify(item.key)}
                            disabled={isLoading[item.key]}
                          >
                            {isLoading[item.key] ? "Sending..." : "Verify"}
                          </button>
                        </div>
                      )}
                    </div>
                    {errorMessage[item.key] && (
                      <div className="verify-error-msg">
                        {errorMessage[item.key]}
                      </div>
                    )}
                    {successMessage[item.key] && !errorMessage[item.key] && (
                      <div className="verify-success-msg">
                        {successMessage[item.key]}
                      </div>
                    )}
                  </div>
                ))}
              </section>

              <section className="side-card">
                <div className="side-card-title-row">
                  <h3>Conversion Readiness</h3>
                  <span className="readiness-count">
                    {completedQualificationItems}/{qualificationItems.length}
                  </span>
                </div>
                <div className="readiness-list">
                  {qualificationItems.map((item) => (
                    <div
                      className={`readiness-item ${item.complete ? "complete" : "pending"}`}
                      key={item.label}
                    >
                      <span>{item.complete ? "✓" : "•"}</span>
                      <strong>{item.label}</strong>
                    </div>
                  ))}
                </div>
                <p className="readiness-note">
                  ETB/NTB is determined here; identity or full KYC is completed
                  by the Branch Maker after conversion.
                </p>
              </section>

              <section className="side-card">
                <h3>Lead Journey</h3>
                <div className="journey-list">
                  {[
                    {
                      num: 1,
                      title: "Enquiry Created",
                      desc: "Gold Loan lead registered and acknowledged.",
                      threshold: 1,
                    },
                    {
                      num: 2,
                      title: "Qualify & Identify",
                      desc: "Contact customer and determine ETB or NTB.",
                      threshold: 2,
                    },
                    {
                      num: 3,
                      title: "Create Application",
                      desc: "Begin verification, KYC and facility selection.",
                      threshold: 3,
                    },
                  ].map((step) => (
                    <div
                      key={step.num}
                      className={`journey-step${journeyIdx === step.threshold ? " active" : ""}${journeyIdx > step.threshold ? " completed" : ""}`}
                    >
                      <div className="journey-num">
                        {journeyIdx > step.threshold ? "✓" : step.num}
                      </div>
                      <div>
                        <strong>{step.title}</strong>
                        <p>{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="side-card">
                <h3>Quick Actions</h3>
                <div className="quick-actions">
                  <button
                    className="quick-btn qa-call"
                    onClick={() => openActionPanel("call")}
                  >
                    📞 Log a Call
                  </button>
                  <button
                    className="quick-btn qa-task"
                    onClick={() => openActionPanel("task")}
                  >
                    ✅ Create Task
                  </button>
                  <button
                    className="quick-btn qa-email"
                    onClick={() => openActionPanel("email")}
                  >
                    ✉️ Send Email
                  </button>
                  <button
                    className="quick-btn qa-note"
                    onClick={() => openActionPanel("notes")}
                  >
                    📝 Add Note
                  </button>
                  <button
                    className="quick-btn qa-convert"
                    onClick={() => {
                      if (leadStatus === "Converted") {
                        navigate(`/applications/${leadId}/onboarding`);
                        return;
                      }
                      setShowModal("convert");
                    }}
                    disabled={leadStatus !== "Converted" && !canConvert}
                    title={
                      !canConvert
                        ? "Complete the CBS relationship check first"
                        : undefined
                    }
                  >
                    {leadStatus === "Converted"
                      ? "Open Application"
                      : "Convert Lead"}
                  </button>
                </div>
              </section>
            </aside>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="activity-layout">
            <div className="activity-action-bar">
              <button
                className="aab-btn aab-call"
                onClick={() => setShowPanel("call")}
              >
                <PhoneIcon /> Log Call
              </button>
              <button
                className="aab-btn aab-task"
                onClick={() => setShowPanel("task")}
              >
                <TaskIcon /> Create Task
              </button>
              <button
                className="aab-btn aab-email"
                onClick={() => openActionPanel("email")}
              >
                <MailIcon /> Send Email
              </button>
              <button
                className="aab-btn aab-note"
                onClick={() => setShowPanel("notes")}
              >
                <NoteIcon /> Add Note
              </button>
            </div>
            <section className="activity-section">
              <div className="activity-section-header">
                <h3>Activity Timeline</h3>
                <span className="activity-count">
                  {activities.length}{" "}
                  {activities.length === 1 ? "event" : "events"}
                </span>
              </div>
              <div className="timeline-container">
                {activities.length === 0 ? (
                  <div className="activity-empty">
                    <span className="empty-icon">📋</span>
                    <strong>No activity yet</strong>
                    <p>
                      Log a call, create a task, or add a note to get started.
                    </p>
                  </div>
                ) : (
                  activities.map((item, i) => (
                    <ActivityItem
                      key={item.id}
                      item={item}
                      isLast={i === activities.length - 1}
                    />
                  ))
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === "documents" && (
          <section className="record-section" style={{ overflow: "visible" }}>
            <div className="record-section-header">
              <div className="section-title-group">
                <div
                  className="section-icon-badge"
                  style={{ background: "#00518f18", color: "#00518f" }}
                >
                  📂
                </div>
                <div>
                  <h3>Lead Documents</h3>
                  <p className="section-subtitle">
                    Capture only the initial documents needed before conversion.
                  </p>
                </div>
              </div>
              <button
                className="doc-upload-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadIcon /> Upload Document
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: "none" }}
                onChange={handleDocUpload}
              />
            </div>
            {uploadedDocs.length === 0 ? (
              <div className="doc-empty">
                <div className="doc-empty-icon">📄</div>
                <strong>No documents uploaded yet</strong>
                <p>
                  Upload available OVD, PAN, address proof, jewellery ownership
                  proof or initial Agri documents. Detailed appraisal files are
                  captured in the application.
                </p>
                <button
                  className="doc-empty-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadIcon /> Upload Your First Document
                </button>
              </div>
            ) : (
              <div className="doc-list">
                {uploadedDocs.map((doc) => (
                  <DocumentRow
                    key={doc.id}
                    doc={doc}
                    onDelete={handleDocDelete}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {showPanel === "call" && (
        <LogCallPanel
          form={panelForm}
          onChange={handlePanelChange}
          onSubmit={handleLogCall}
          onClose={closePanel}
        />
      )}
      {showPanel === "task" && (
        <CreateTaskPanel
          form={panelForm}
          onChange={handlePanelChange}
          onSubmit={handleCreateTask}
          onClose={closePanel}
        />
      )}
      {showPanel === "email" && (
        <SendEmailPanel
          form={panelForm}
          onChange={handlePanelChange}
          onSubmit={handleSendEmail}
          onClose={closePanel}
          leadEmail={leadData.email}
          leadData={leadData}
        />
      )}
      {showPanel === "notes" && (
        <NotesPanel
          form={panelForm}
          onChange={handlePanelChange}
          onSubmit={handleSaveNote}
          onClose={closePanel}
        />
      )}

      {showModal === "disqualify" && (
        <DisqualifyModal
          form={panelForm}
          onChange={handlePanelChange}
          onSubmit={handleDisqualify}
          onClose={() => {
            setShowModal(null);
            setPanelForm({});
          }}
        />
      )}
      {showModal === "convert" && (
        <ConvertModal
          onSubmit={handleConvert}
          onClose={() => setShowModal(null)}
          relationship={relationship}
        />
      )}
    </div>
  );
}

export default LeadDetailPage;
