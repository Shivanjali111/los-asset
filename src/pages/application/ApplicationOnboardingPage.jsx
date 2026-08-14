import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ApplicationOnboardingPage.css";
import CustomerIdentityPage from "./CustomerIdentityPage";
import ApplicantProfilePage from "./ApplicantProfilePage";
import IncomeEmploymentPage from "./IncomeEmploymentPage";
import CoApplicantsPage from "./CoApplicantsPage";
import DocumentsPage from "./DocumentsPage";
import CollateralPage from "./CollateralPage";
import LoanRequirementPage from "./LoanRequirementPage";
import EligibilityOfferPage from "./EligibilityOfferPage";
import ApplicationPackagePage from "./ApplicationPackagePage";
import FeesSubmissionPage from "./FeesSubmissionPage";

// ─── Icons ────────────────────────────────────────────────────────────────────
const BackIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
  </svg>
);
const LogoutIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const SaveIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.1">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
    <path d="M17 21v-8H7v8" /><path d="M7 3v5h8" />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.8">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const AlertIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9v4" /><path d="M12 17h.01" />
  </svg>
);
const UserIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const FileIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
    <path d="M14 2v6h6" /><path d="M8 13h8" /><path d="M8 17h5" />
  </svg>
);
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10" /><path d="M9 20v-6h6v6" />
  </svg>
);
const RupeeIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 3h12" /><path d="M6 8h12" /><path d="M6 13h7a5 5 0 0 0 0-10" /><path d="m6 13 8 8" />
  </svg>
);
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
  </svg>
);
const BriefcaseIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1" />
    <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    <path d="M3 13h18" />
  </svg>
);
const ChevronRightIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="m9 18 6-6-6-6" />
  </svg>
);
const ChevronLeftIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

// ─── AVA Activity Panel helpers ──────────────────────────────────────────────
const AVA_ACTIVITY_API    = "https://c30sce5j48.execute-api.ap-south-1.amazonaws.com/prod/activity";
const WHATSAPP_CONSENT_API = "https://j0e80xdyw4.execute-api.ap-south-1.amazonaws.com/InitiatePropertyTypeWhatsAppChat";
const ACTIVITY_LOG_API     = "https://j0e80xdyw4.execute-api.ap-south-1.amazonaws.com/activity-log-handler";

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

const sendWhatsAppCoApplicantMessage = async (mobileNumber) => {
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
          "Based on the loan amount and income details shared, we recommend adding a co-applicant to strengthen your Home Loan application. 👥\n\n" +
          "Adding a co-applicant may help improve eligibility and make the approval process smoother.\n\n" +
          "You can add your spouse, parent, or another eligible family member as a co-applicant.\n\n" +
          "Please share the co-applicant's name and mobile number to proceed.\n\n" +
          "Thank you.",
      }),
    });
  } catch (err) {
    console.error("WhatsApp co-applicant API error:", err);
  }
};

const sendWhatsAppDetailsLink = async (mobileNumber, leadId) => {
  const cleaned = String(mobileNumber || "").replace(/\D/g, "");
  if (!cleaned) return;
  try {
    const response = await fetch(WHATSAPP_CONSENT_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetPhoneNumber: cleaned,
        messageBody:
          "Dear Customer,\n\n" +
          "To move your Home Loan application ahead, we need a few additional details about your employment and the property/builder. 🏠\n\n" +
          "This will help us assess your application faster and proceed with the next step.\n\n" +
          "Thank you.",
      }),
    });
    alert('response ' + JSON.stringify(response))
  } catch (err) {
    alert('error' + err)
    console.error("WhatsApp details link API error:", err);
  }
};

const OB_CATEGORY_CONFIG = {
  INFO:            { bg: "#e8f0fb", border: "rgba(30,95,165,.22)",  color: "#1e5fa5", dot: "#1e5fa5",  label: "Info" },
  WAITING:         { bg: "#fef3e0", border: "rgba(160,92,10,.22)",  color: "#a05c0a", dot: "#e0a82e",  label: "Waiting" },
  SUCCESS:         { bg: "#e8f5e9", border: "rgba(46,125,50,.22)",  color: "#2e7d32", dot: "#2e7d32",  label: "Success" },
  ERROR:           { bg: "#fdecea", border: "rgba(192,57,43,.22)",  color: "#c0392b", dot: "#c0392b",  label: "Error" },
  WARNING:         { bg: "#fef3e0", border: "rgba(160,92,10,.22)",  color: "#a05c0a", dot: "#e0a82e",  label: "Warning" },
  ACTION:          { bg: "#f3e8ff", border: "rgba(123,60,180,.22)", color: "#7b3cb4", dot: "#7b3cb4",  label: "Action" },
  ACTION_REQUIRED: { bg: "#f3e8ff", border: "rgba(123,60,180,.22)", color: "#7b3cb4", dot: "#7b3cb4",  label: "Action Required" },
};

const OB_DEFAULT_ACTIVITY_ENTRY = {
  id: "default-ava-onboarding",
  action: "APPLICATION_ONBOARDING_STARTED",
  display_text: "Application onboarding has been initiated. Ava is monitoring progress across all steps.",
  category: "INFO",
  actor_name: "Ava",
  actor_type: "AGENT",
  channel: "SYSTEM",
  created_at: new Date().toISOString(),
};

const obNormalizeCategory = (category = "") => {
  const v = String(category || "").trim().toUpperCase();
  if (v === "ACTION_REQUIRED") return "ACTION_REQUIRED";
  if (v === "ACTION") return "ACTION";
  return v || "INFO";
};

const obGetCfg = (category) => OB_CATEGORY_CONFIG[obNormalizeCategory(category)] || OB_CATEGORY_CONFIG.INFO;

const obGetChannelIcon = (channel = "") => {
  const v = String(channel || "").trim().toUpperCase();
  if (v === "WHATSAPP") return "💬";
  if (v === "EMAIL") return "✉️";
  if (v === "SMS") return "📱";
  if (v === "TEAMS") return "👥";
  if (v === "PORTAL") return "🖥️";
  return "⚙️";
};

const obFormatTime = (isoString) => {
  if (!isoString) return "";
  try {
    return new Date(isoString).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
  } catch { return isoString; }
};

const obFormatAction = (action = "") =>
  String(action || "AVA_ACTION").replace(/_/g, " ").trim().toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

// ─── AVA Activity Panel component ────────────────────────────────────────────
function AvaActivityPanel({ leadId, leadMobile, completedCount, totalSteps }) {
  const [logs, setLogs]                         = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [showCoAppCard, setShowCoAppCard]       = useState(false);
  const [coAppProceeding, setCoAppProceeding]   = useState(false);
  const [coAppDone, setCoAppDone]               = useState(false);
  const whatsappSentRef                         = useRef(false);
  const coAppSentRef                            = useRef(false);

  useEffect(() => {
    if (!leadId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res  = await fetch(`${AVA_ACTIVITY_API}/${leadId}`);
        const data = await res.json();
        const arr  = Array.isArray(data) ? data : [];
        const sorted = [...arr].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const finalLogs = sorted.length > 0 ? sorted : [OB_DEFAULT_ACTIVITY_ENTRY];
        if (!cancelled) setLogs(finalLogs);

        /* ── Details link trigger on page load ── */
        if (!whatsappSentRef.current && finalLogs.length > 0) {
          const latestAction = String(finalLogs[0].action || "").trim();
          if (latestAction === "CUSTOMER_UPLOADED_KYC_DOCUMENTS") {
            whatsappSentRef.current = true;
            await sendWhatsAppDetailsLink('+918552051111', leadId);

            await postActivityLog({
				lead_id: leadId,
				action: "DETAILS_LINK_SENT",
				display_text: "I sent the employment and property details link to the customer to move the application ahead.",
				category: "INFO",
				channel: "WHATSAPP",
				actor_type: "AGENT",
				actor_name: "Ava",
				payload_json: {
					leadNumber: leadId,
					detailsLinkSent: true,
					detailsUrl: `https://main.d2s4uifsvainim.amplifyapp.com/details/${leadId}`,
				},
            });

            await new Promise((resolve) => setTimeout(resolve, 1000));

            await postActivityLog({
              lead_id: leadId,
              action: "CUSTOMER_PROVIDED_DETAILS",
              display_text: "Customer provided the required employment and property details for the application.",
              category: "SUCCESS",
              channel: "PORTAL",
              actor_type: "CUSTOMER",
              actor_name: "Customer",
              payload_json: {
                leadNumber: leadId,
                detailsProvided: true,
                detailsStatus: "COMPLETED",
              },
            });
        }

          /* ── Co-applicant insight card trigger ── */
          if (latestAction === "CUSTOMER_PROVIDED_DETAILS") {
            if (!cancelled) setShowCoAppCard(true);
          }
        }
      } catch {
        if (!cancelled) setLogs([OB_DEFAULT_ACTIVITY_ENTRY]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [leadId]);

  const handleCoAppProceed = async () => {
    if (coAppSentRef.current) return;
    coAppSentRef.current = true;
    setCoAppProceeding(true);

    await sendWhatsAppCoApplicantMessage('+918552051111');

    await postActivityLog({
      lead_id: leadId,
      action: "CO_APPLICANT_DETAILS_REQUESTED",
      display_text: "Ava requested co-applicant details from the customer to strengthen the home loan application.",
      category: "INFO",
      channel: "WHATSAPP",
      actor_type: "AGENT",
      actor_name: "Ava",
      payload_json: {
        leadNumber: leadId,
        coApplicantRequested: true,
        reason: "Eligibility strengthening",
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 3000));

    await postActivityLog({
      lead_id: leadId,
      action: "CUSTOMER_PROVIDED_CO_APPLICANT_DETAILS",
      display_text: "Customer shared co-applicant details. The co-applicant has been added to the application.",
      category: "SUCCESS",
      channel: "WHATSAPP",
      actor_type: "CUSTOMER",
      actor_name: "Customer",
      payload_json: {
        leadNumber: leadId,
        coApplicantDetailsReceived: true,
        status: "COMPLETED",
      },
    });

    setCoAppProceeding(false);
    setCoAppDone(true);
  };

  const eventCount   = logs.filter((l) => l.id !== OB_DEFAULT_ACTIVITY_ENTRY.id).length || logs.length;
  const latestLog    = logs[0] ?? OB_DEFAULT_ACTIVITY_ENTRY;
  const latestCh     = latestLog?.channel || "SYSTEM";
  const progressPct  = Math.round((completedCount / totalSteps) * 100);

  return (
    <aside className="ob-ava-panel">
      {/* Header */}
      <div className="ob-ava-head">
        <div>
          <h3>Ava Activity Console</h3>
          <p>Live trail of every action Ava performed on this application.</p>
        </div>
        <span className="ob-ava-live-pill"><span className="ob-ava-live-dot" />Live</span>
      </div>

      {/* Co-applicant insight card */}
      {showCoAppCard && (
        <div className="ob-ava-insight-card">
          <div className="ob-ava-insight-header">
            <span className="ob-ava-insight-icon">🤖</span>
            <div>
              <span className="ob-ava-insight-label">Ava Recommendation</span>
              <span className="ob-ava-insight-badge">⚠️ Eligibility Alert</span>
            </div>
          </div>

          <p className="ob-ava-insight-body">
            Ava has reviewed the customer's requested loan amount, tenure, and income details.
          </p>

          <div className="ob-ava-insight-finding">
            <span className="ob-ava-insight-finding-icon">📊</span>
            <p>
              Based on the current income profile, the customer's eligibility may be <strong>tight</strong> for
              the requested <strong>₹50 lakh</strong> loan over <strong>15 years</strong>. Ava recommends
              adding a co-applicant to strengthen the application and improve approval chances.
            </p>
          </div>

          <div className="ob-ava-insight-next">
            <span className="ob-ava-insight-next-icon">👥</span>
            <p><strong>Suggested next step:</strong> Ask the customer to share co-applicant details</p>
          </div>

          {coAppDone ? (
            <div className="ob-ava-insight-done">
              <span>✅</span>
              <span>Co-applicant details requested. Activity logs updated.</span>
            </div>
          ) : (
            <button
              className="ob-ava-insight-proceed-btn"
              onClick={handleCoAppProceed}
              disabled={coAppProceeding}
            >
              {coAppProceeding ? (
                <><span className="ob-ava-btn-spinner" /> Sending…</>
              ) : (
                <>👥 Proceed — Request Co-applicant Details</>
              )}
            </button>
          )}
        </div>
      )}

      {/* Log feed */}
      {loading ? (
        <div className="ob-ava-log-loading">
          <span className="ob-ava-log-spinner" />
          <span>Loading Ava activity…</span>
        </div>
      ) : (
        <div className="ob-ava-log-feed">
          {logs.map((entry, idx) => {
            const cfg            = obGetCfg(entry.category);
            const normCat        = obNormalizeCategory(entry.category);
            const channelIcon    = obGetChannelIcon(entry.channel);
            const actionLabel    = obFormatAction(entry.action);
            const isLast         = idx === logs.length - 1;

            return (
              <div
                key={`${entry.id || entry.created_at || entry.action}-${idx}`}
              >
                <div
                  className={`ob-ava-log-card ob-ava-log-${normCat.toLowerCase().replace(/_/g, "-")}`}
                  style={{ borderTopColor: cfg.dot }}
                >
                  <div className="ob-ava-log-card-header">
                    <div className="ob-ava-log-title-group">
                      <span className="ob-ava-log-action">{actionLabel}</span>
                      <span className="ob-ava-log-time">{obFormatTime(entry.created_at)}</span>
                    </div>
                    <span className="ob-ava-log-badge" style={{ background: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="ob-ava-log-text">{entry.display_text}</p>
                  <div className="ob-ava-log-footer">
                    <span>{channelIcon} {entry.channel || "SYSTEM"}</span>
                    {entry.actor_name && <span>By {entry.actor_name}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}

// ─── Step config ──────────────────────────────────────────────────────────────
const STEPS = [
  { id: "customer-identity",  number: "01", title: "Customer Identity",   description: "PAN, mobile, email and KYC verification",          icon: ShieldIcon,    component: CustomerIdentityPage,   dataKey: "customerIdentity"  },
  { id: "applicant-profile",  number: "02", title: "Applicant Profile",   description: "Personal, residential and demographic details",    icon: UserIcon,      component: ApplicantProfilePage,   dataKey: "applicantProfile"  },
  { id: "income-employment",  number: "03", title: "Income & Employment", description: "Salary, business income and obligation details",   icon: BriefcaseIcon, component: IncomeEmploymentPage,   dataKey: "incomeEmployment"  },
  { id: "co-applicants",      number: "04", title: "Co-Applicants",       description: "Add co-applicants, guarantors and relationships",  icon: UserIcon,      component: CoApplicantsPage,       dataKey: "coApplicants"      },
  { id: "documents",          number: "05", title: "Documents",           description: "Document checklist, upload and OCR status",        icon: FileIcon,      component: DocumentsPage,          dataKey: "documents"         },
  { id: "collateral",         number: "06", title: "Collateral",          description: "Property, project and security information",       icon: HomeIcon,      component: CollateralPage,         dataKey: "collateral"        },
  { id: "loan-requirement",   number: "07", title: "Loan Requirement",    description: "Product, loan type, purpose, amount and tenure",   icon: RupeeIcon,     component: LoanRequirementPage,    dataKey: "loanRequirement"   },
  { id: "eligibility-offer",  number: "08", title: "Eligibility & Offer", description: "Eligibility, FOIR, LTV and recommended offer",    icon: CheckIcon,     component: EligibilityOfferPage,   dataKey: "eligibilityOffer"  },
  { id: "application-package",number: "09", title: "Application Package", description: "Generate, review and sign application form",       icon: FileIcon,      component: ApplicationPackagePage, dataKey: "applicationPackage"},
  { id: "fees-submission",    number: "10", title: "Fees & Submission",   description: "Payment, final review and submit to credit",       icon: RupeeIcon,     component: FeesSubmissionPage,     dataKey: "feesSubmission"    },
];

const buildInitialStatuses = (leadDetails = null) => {
  return STEPS.reduce((acc, step, i) => {
    if (i === 0 || i === 1)                  acc[step.id] = "Completed";
    else if (step.id === "income-employment") acc[step.id] = leadDetails?.incomeDetails   ? "Completed" : "In Progress";
    else if (step.id === "collateral")        acc[step.id] = leadDetails?.collateralDetails ? "Completed" : "Not Started";
    else if (step.id === "loan-requirement")  acc[step.id] = "Completed";
    else                                      acc[step.id] = "Not Started";
    return acc;
  }, {});
};

const INITIAL_STATUSES = buildInitialStatuses();

const INITIAL_APPLICATION_DATA = {
  customerIdentity:   { panNumber: "", mobileNumber: "", email: "", dateOfBirth: "", mobileVerified: false, emailVerified: false, panVerified: false },
  applicantProfile:   { firstName: "", lastName: "", applicantType: "", applicantCategory: "", residentialStatus: "", addressLine1: "", city: "", state: "", pincode: "" },
  incomeEmployment:   { employmentType: "", employerName: "", monthlyGrossSalary: "", monthlyObligations: "", businessName: "", annualIncome: "" },
  coApplicants:       [],
  documents:          [],
  collateral:         { propertyIdentified: "", propertyType: "", projectName: "", propertyValue: "", collateralAddress: "" },
  loanRequirement:    { product: "", loanType: "", loanPurpose: "", requestedLoanAmount: "", loanTenureYears: "", balanceTransferBank: "" },
  eligibilityOffer:   { eligibilityStatus: "", eligibleAmount: "", foir: "", ltv: "", recommendedOffer: "" },
  applicationPackage: { applicationFormGenerated: false, signedFormUploaded: false, eSignStatus: "" },
  feesSubmission:     { processingFeeAmount: "", paymentStatus: "", submissionStatus: "" },
};

const STATUS_CLASS = {
  Completed: "completed",
  "In Progress": "in-progress",
  "Pending Validation": "pending",
  "Not Started": "not-started",
  "Needs Rework": "needs-rework",
  Blocked: "blocked",
};

// ─── Component ───────────────────────────────────────────────────────────────
function ApplicationOnboardingPage({ leads = [], onLogout }) {
  const navigate  = useNavigate();
  const { leadId } = useParams();

  const [activeStepId, setActiveStepId] = useState(STEPS[0].id);
  const [stepStatuses, setStepStatuses] = useState(INITIAL_STATUSES);
  const [applicationData, setApplicationData] = useState(INITIAL_APPLICATION_DATA);

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchLead();
  }, [leadId]);

  const fetchLead = async () => {
    try {
      const response = await fetch(
        `https://xx8ep3p2ue.execute-api.ap-south-1.amazonaws.com/prod/leads/${leadId}`
      );

      const data = await response.json();

      if (data.success) {
        const leadDetails = data.data.lead_details || null;
        setLead({
          id: data.data.leadnumber,
          firstName: data.data.first_name,
          lastName: data.data.last_name,
          mobile: data.data.mobile,
          email: data.data.email,
          product: data.data.product,
          source: data.data.source || "Direct",
          owner: data.data.owner || "Sales User",
          status: data.data.stage || "New",
          leadDetails,
        });
        // Re-derive step statuses now that we have the actual lead_details
        setStepStatuses(buildInitialStatuses(leadDetails));
      }
    } catch (error) {
      console.error("Fetch Lead Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const activeStepIndex    = STEPS.findIndex((s) => s.id === activeStepId);
  const activeStep         = STEPS[activeStepIndex] ?? STEPS[0];
  const ActiveStepComponent = activeStep.component;
  const activeStatus       = stepStatuses[activeStep.id];
  const completedCount     = Object.values(stepStatuses).filter((s) => s === "Completed").length;
  const progressPercent    = Math.round((completedCount / STEPS.length) * 100);
  const isLastStep         = activeStepIndex === STEPS.length - 1;

  const application = lead
  ? {
      id: `APP-${lead.id.replace("LD-", "")}`,
      leadId: lead.id,
      applicantName: `${lead.firstName || ""} ${lead.lastName || ""}`,
      product: lead.product || "Home Loan",
      source: lead.source || "Direct",
      owner: lead.owner || "Sales User",
      requestedAmount:
        applicationData.loanRequirement.requestedLoanAmount || "₹42,00,000",
      createdDate: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    }
  : null;

  const updateApplicationData = (section, values) => {
    setApplicationData((prev) => {
      const existing = prev[section];
      if (Array.isArray(existing)) return { ...prev, [section]: values };
      return { ...prev, [section]: { ...existing, ...values } };
    });
  };

  const replaceApplicationDataSection = (section, values) => {
    setApplicationData((prev) => ({ ...prev, [section]: values }));
  };

  const updateStepStatus = (stepId, status) => {
    setStepStatuses((prev) => ({ ...prev, [stepId]: status }));
  };

  const getCurrentStepData = () => applicationData[activeStep.dataKey];

  const stepStats = useMemo(
    () => [
      { label: "Application No.", value: application?.id           || "APP-2026-000184"           },
      { label: "Lead No.",        value: application?.leadId       || "LD-2026-00491"              },
      { label: "Applicant",       value: application?.applicantName || "Aarav Mehta"              },
      { label: "Product",         value: applicationData.loanRequirement.product || application?.product || "Home Loan" },
      { label: "Loan Amount",     value: applicationData.loanRequirement.requestedLoanAmount || application?.requestedAmount || "₹42,00,000" },
      { label: "Stage",           value: completedCount === STEPS.length ? "Submitted" : "In Progress" },
    ],
    [application, applicationData.loanRequirement.product, applicationData.loanRequirement.requestedLoanAmount, completedCount]
  );

  const handleSaveDraft = () => {
    console.log("Draft saved:", { lead, application, applicationData, stepStatuses });
  };

  const saveAndContinue = () => {
    setStepStatuses((prev) => {
      const next = { ...prev, [activeStep.id]: "Completed" };
      if (!isLastStep) {
        const nextId = STEPS[activeStepIndex + 1].id;
        if (next[nextId] === "Not Started") next[nextId] = "In Progress";
      }
      return next;
    });
    if (!isLastStep) setActiveStepId(STEPS[activeStepIndex + 1].id);
  };

  const previousStep = () => {
    if (activeStepIndex > 0) setActiveStepId(STEPS[activeStepIndex - 1].id);
  };

  const goToStep    = (stepId) => setActiveStepId(stepId);
  const handleBack  = () => navigate(`/leads/${leadId}`);
  const handleLogout = async () => {
    if (onLogout) await onLogout();
    navigate("/login", { replace: true });
  };

  if (loading) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "18px",
      }}
    >
      Loading application...
    </div>
  );
  }
  // ── Not-found fallback ─────────────────────────────────────────────────────
  if (!lead) {
    return (
      <div className="app-onboarding-page">
        <div className="app-header-zone">
          <header className="app-onboarding-topbar">
            <div className="app-topbar-left">
              <button className="back-button" type="button" onClick={handleBack}><BackIcon /></button>
              <h1 className="topbar-title">Application Onboarding</h1>
            </div>
          </header>
        </div>
        <main className="app-onboarding-shell">
          <p style={{ padding: "2rem", color: "var(--los-muted)" }}>
            Lead not found. The lead with ID &quot;{leadId}&quot; does not exist.
          </p>
        </main>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="app-onboarding-page">

      {/* ── Unified sticky header zone ── */}
      <div className="app-header-zone">

        {/* Primary bar — blue gradient */}
        <header className="app-onboarding-topbar">
          <div className="app-topbar-left">
            <button className="back-button" type="button" onClick={handleBack}>
              <BackIcon />
            </button>
            <h1 className="topbar-title">Application Onboarding</h1>
          </div>
          <div className="app-topbar-right">
            <button className="record-action-logout" type="button" onClick={handleLogout}>
              <LogoutIcon /> Sign Out
            </button>
          </div>
        </header>

        {/* Info strip — white, directly below */}
        <div className="application-summary-strip">
          {stepStats.map((item) => (
            <div className="summary-item" key={item.label}>
              <span className="summary-label">{item.label}</span>
              <strong className="summary-value">{item.value}</strong>
            </div>
          ))}
          <div className="summary-item summary-progress-item">
            <div className="summary-progress-header">
              <span className="summary-label">Completion</span>
              <strong className="summary-value">{progressPercent}% &nbsp;·&nbsp; {completedCount}/{STEPS.length}</strong>
            </div>
            <div className="progress-track-thin">
              <div className="progress-fill-thin" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

      </div>

      {/* ── Main content ── */}
      <main className="app-onboarding-shell">
        <section className="app-workspace">

          {/* Left: stepper panel */}
          <aside className="app-stepper-panel">
            <div className="stepper-panel-header">
              <h2 className="stepper-panel-title">Application Steps</h2>
              <span className="stepper-panel-count">{completedCount}/{STEPS.length} done</span>
            </div>
            <div className="stepper-timeline">
              {STEPS.map((step, index) => {
                const status      = stepStatuses[step.id];
                const isActive    = step.id === activeStepId;
                const isCompleted = status === "Completed";
                const isLast      = index === STEPS.length - 1;
                const statusClass = STATUS_CLASS[status] ?? "not-started";
                const connClass   = !isLast && isCompleted ? "filled" : "";
                return (
                  <div key={step.id} className={`stepper-row ${isActive ? "active" : ""}`}>
                    <div className="stepper-track-col">
                      <button
                        type="button"
                        className={`step-node ${statusClass} ${isActive ? "active" : ""}`}
                        onClick={() => goToStep(step.id)}
                        aria-label={`Go to ${step.title}`}
                      >
                        {isActive && !isCompleted && <span className="step-node-pulse" />}
                        {isCompleted
                          ? <span className="step-node-check"><CheckIcon /></span>
                          : <span className="step-node-number">{step.number}</span>
                        }
                      </button>
                      {!isLast && <div className={`step-connector ${connClass}`} />}
                    </div>
                    <button
                      type="button"
                      className={`stepper-info-btn ${isActive ? "active" : ""} ${statusClass}`}
                      onClick={() => goToStep(step.id)}
                    >
                      <div className="stepper-info-top">
                        <strong className="stepper-step-title">{step.title}</strong>
                        {isActive && <span className="stepper-active-arrow"><ChevronRightIcon /></span>}
                      </div>
                      <span className="stepper-step-desc">{step.description}</span>
                      {["In Progress", "Pending Validation", "Blocked", "Needs Rework"].includes(status) && (
                        <span className={`status-pill ${statusClass}`}>{status}</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Center: step content */}
          <section className="app-step-content">
            <div className="step-body-card">
              <div className="step-card-header">
                <div className="step-card-header-left">
                  <span className="step-card-breadcrumb">
                    Step {activeStep.number}
                    <span className="step-card-breadcrumb-sep">/</span>
                    {STEPS.length}
                  </span>
                  <h2 className="step-card-title">{activeStep.title}</h2>
                  <p className="step-card-desc">{activeStep.description}</p>
                </div>
                <span className={`status-pill ${STATUS_CLASS[activeStatus] ?? "not-started"}`}>
                  {activeStatus}
                </span>
              </div>
              <div className="step-card-divider" />
              <div className="step-card-body">
                <ActiveStepComponent
                  lead={lead}
                  application={application}
                  applicationData={applicationData}
                  stepData={getCurrentStepData()}
                  sectionKey={activeStep.dataKey}
                  updateApplicationData={updateApplicationData}
                  replaceApplicationDataSection={replaceApplicationDataSection}
                  stepStatuses={stepStatuses}
                  updateStepStatus={updateStepStatus}
                />
              </div>
            </div>
          </section>

          {/* Right: AVA activity log */}
          <AvaActivityPanel
            leadId={leadId}
            leadMobile={lead?.mobile}
            completedCount={completedCount}
            totalSteps={STEPS.length}
          />

        </section>
      </main>

      {/* ── Footer action bar ── */}
      <footer className="application-action-bar">
        <div className="footer-step-info">
          <span className="footer-step-pos">Step {activeStepIndex + 1} of {STEPS.length}</span>
          <span className="footer-step-name">{activeStep.title}</span>
        </div>
        <div className="footer-actions">
          <button className="btn-prev" type="button" onClick={previousStep} disabled={activeStepIndex === 0}>
            <ChevronLeftIcon /> Previous
          </button>
          <button className="secondary-button" type="button" onClick={handleSaveDraft}>
            <SaveIcon /> Save Draft
          </button>
          <span className="footer-action-sep" />
          <button
            className="primary-button"
            type="button"
            onClick={saveAndContinue}
            disabled={isLastStep && activeStatus === "Completed"}
          >
            {isLastStep ? "Mark Complete" : "Save & Continue"} {!isLastStep && <ChevronRightIcon />}
          </button>
        </div>
      </footer>

    </div>
  );
}

export default ApplicationOnboardingPage;