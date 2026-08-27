import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import ApplicationSummaryTab from "./ApplicationSummaryTab";
import ApplicationDetailsTab from "./ApplicationDetailsTab";
import DocumentationDisbursementTab from "./DocumentationDisbursementTab";
import "./ApplicationDetailPage.css";

const LEAD_API =
  "https://xx8ep3p2ue.execute-api.ap-south-1.amazonaws.com/prod/leads";

const LEAD_DETAILS_API =
  "https://700pag34e9.execute-api.ap-south-1.amazonaws.com/prod/leads";

const PERSONA_BY_EMAIL = {
  "ychapa@deloitte.com": "Checker",
  "mohikumawat@deloitte.com": "Appraiser",
  "mohikumawat@delitte.com": "Appraiser",
  "mohikumawat@delitte,com": "Appraiser",
  "shivgaikwad@deloitte.com": "Maker",
};

const hasText = (val) =>
  val !== undefined &&
  val !== null &&
  val !== "" &&
  val !== "—" &&
  val !== "Scheme not selected";

const TABS = [
  { id: "summary", label: "Application Details" },
  { id: "details", label: "Appraiser and Sanction" },
  {
    id: "documentationDisbursement",
    label: "Documentation & Disbursement",
  },
];

const STAGES = [
  {
    id: "APPLICATION_CREATION",
    number: "01",
    label: "Application Creation",
  },
  {
    id: "APPRAISAL",
    number: "02",
    label: "Appraisal",
  },
  {
    id: "DOCUMENTATION_DISBURSEMENT",
    number: "03",
    label: "Documentation & Disbursement",
  },
];

const DEFAULT_CHECKLIST = [
  { id: "customerConsent", label: "Customer & consent" },
  { id: "jewelleryAppraisal", label: "Jewellery appraisal" },
  { id: "eligibility", label: "Eligibility calculation" },
  { id: "cibil", label: "CIBIL / CIC" },
  { id: "landDetails", label: "Land details" },
  { id: "makerRecommendation", label: "Maker recommendation" },
  { id: "checkerSanction", label: "Checker sanction" },
  { id: "documentExecution", label: "Document execution" },
  { id: "chargeDeduction", label: "Charge deduction" },
  { id: "disbursement", label: "Disbursement" },
];

const parseLeadDetails = (value) => {
  if (!value) return {};
  if (typeof value === "object") return value;

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    console.error("Unable to parse lead_details JSON:", error);
    return {};
  }
};

const clone = (value) => JSON.parse(JSON.stringify(value));

const formatCurrency = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getInitials = (name) =>
  String(name || "User")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const decodeJwtPayload = (token) => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );
    return JSON.parse(window.atob(padded));
  } catch (error) {
    console.warn("Unable to decode Cognito token:", error);
    return null;
  }
};

const getStoredCognitoUser = () => {
  if (typeof window === "undefined") {
    return { email: "", name: "" };
  }

  const directEmail =
    window.sessionStorage.getItem("loggedInUserEmail") ||
    window.localStorage.getItem("loggedInUserEmail") ||
    "";
  const directName =
    window.sessionStorage.getItem("loggedInUserName") ||
    window.localStorage.getItem("loggedInUserName") ||
    "";

  for (const storage of [window.localStorage, window.sessionStorage]) {
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (!key?.endsWith(".idToken")) continue;

      const payload = decodeJwtPayload(storage.getItem(key) || "");
      if (payload?.email) {
        return {
          email: payload.email,
          name:
            payload.name ||
            payload.given_name ||
            payload["cognito:username"] ||
            directName,
        };
      }
    }
  }

  return { email: directEmail, name: directName };
};

const normalizePersona = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized.includes("appraiser") || normalized.includes("jeweller")) {
    return "Appraiser";
  }
  if (normalized.includes("checker")) return "Checker";
  if (normalized.includes("maker")) return "Maker";
  return "Read only";
};

const derivePersona = (email, suppliedPersona) => {
  if (suppliedPersona) return normalizePersona(suppliedPersona);
  return PERSONA_BY_EMAIL[String(email || "").trim().toLowerCase()] || "Read only";
};

const createDefaultApplicationDetail = (applicationNumber, lead) => ({
  applicationNumber: applicationNumber || "",
  stage: "APPRAISAL",
  status: "Awaiting Appraisal",
  currentOwner: "Assigned Appraiser",
  assignedPersona: "Appraiser",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  facility: lead?.leadDetails?.facilityBranchLoanDetails?.facilityType || "Gold Loan",
  scheme: lead?.leadDetails?.facilityBranchLoanDetails?.scheme || "—",
  requestedAmount:
    lead?.leadDetails?.facilityBranchLoanDetails?.requestedLoanAmount || null,
  summary: {},
  details: {},
  documents: {},
  documentationDisbursement: {},
  checklist: {},
  activity: {
    events: [],
    lastUpdatedAt: null,
  },
});

const mergeApplicationDetail = (current, defaults) => ({
  ...defaults,
  ...(current || {}),
  summary: { ...defaults.summary, ...(current?.summary || {}) },
  details: { ...defaults.details, ...(current?.details || {}) },
  documents: { ...defaults.documents, ...(current?.documents || {}) },
  documentationDisbursement: {
    ...defaults.documentationDisbursement,
    ...(current?.documentationDisbursement || {}),
  },
  checklist: { ...defaults.checklist, ...(current?.checklist || {}) },
  activity: {
    ...defaults.activity,
    ...(current?.activity || {}),
    events: Array.isArray(current?.activity?.events)
      ? current.activity.events
      : [],
  },
});

const getStageIndex = (applicationDetail) => {
  const rawStage = String(applicationDetail?.stage || "").toUpperCase();

  if (rawStage.includes("DOCUMENT") || rawStage === "3") {
    return 2;
  }

  // Once the application-detail page is reached, Application Creation is
  // complete. Until documentation/disbursement begins, Appraisal stays current.
  return 1;
};

const getActionForUser = (persona, applicationDetail) => {
  const status = String(applicationDetail?.status || "").toLowerCase();
  const stageIndex = getStageIndex(applicationDetail);
  const pushbackSection = applicationDetail?.pushback?.section;
  const assignedPersona = normalizePersona(
    applicationDetail?.assignment?.persona ||
      applicationDetail?.assignedPersona ||
      "",
  );

  if (
    persona !== "Read only" &&
    assignedPersona !== "Read only" &&
    assignedPersona !== persona
  ) {
    return {
      eyebrow: "Application in progress",
      title: "No action is currently assigned to you",
      description: `The current action is assigned to the ${assignedPersona}. You can continue to review the application in read-only mode.`,
      buttonLabel: "View Summary",
      tab: "summary",
      section: "",
    };
  }

  if (persona === "Appraiser") {
    if (status.includes("rework") || status.includes("pushback")) {
      return {
        eyebrow: "Rework assigned",
        title: "Resolve appraisal observations",
        description:
          applicationDetail?.pushback?.reason ||
          "Review the Checker or Maker observations and update the affected jewellery items.",
        buttonLabel: "Open Jewellery Appraisal",
        tab: "details",
        section: pushbackSection || "jewelleryAppraisal",
      };
    }

    return {
      eyebrow: "Action required",
      title: "Complete Jewellery Appraisal",
      description:
        "Enter quality, weights, deductions, photographs and remarks for the assigned jewellery items.",
      buttonLabel: "Open Jewellery Appraisal",
      tab: "details",
      section: "jewelleryAppraisal",
    };
  }

  if (persona === "Maker") {
    if (stageIndex === 2) {
      return {
        eyebrow: "Action required",
        title: "Execute Loan Documents",
        description:
          "Generate the mandatory documents and complete e-sign or manual execution.",
        buttonLabel: "Open Documentation",
        tab: "documentationDisbursement",
        section: "documentGeneration",
      };
    }

    if (status.includes("rework") || status.includes("pushback")) {
      return {
        eyebrow: "Checker pushback",
        title: "Resolve Checker Observations",
        description:
          applicationDetail?.pushback?.reason ||
          "Review the Checker comments and update the affected application section.",
        buttonLabel: "Open Required Section",
        tab: "details",
        section: pushbackSection || "eligibilityRecommendation",
      };
    }

    return {
      eyebrow: "Action required",
      title: "Finalise Loan Recommendation",
      description:
        "Review eligibility, required amount, charges and nominee details before submitting to the Checker.",
      buttonLabel: "Review Eligibility",
      tab: "details",
      section: "eligibilityRecommendation",
    };
  }

  if (persona === "Checker") {
    if (stageIndex === 2) {
      return {
        eyebrow: "Action required",
        title: "Application Ready for Disbursement",
        description:
          "Verify the pre-disbursement checklist and initiate the CBS transaction.",
        buttonLabel: "Review Disbursement",
        tab: "documentationDisbursement",
        section: "finalDisbursement",
      };
    }

    return {
      eyebrow: "Decision required",
      title: "Review and Sanction Application",
      description:
        "Review the complete application and approve, reject or push it back for correction.",
      buttonLabel: "Review Application",
      tab: "details",
      section: "checkerDecision",
    };
  }

  return {
    eyebrow: "Read-only access",
    title: "No action assigned to you",
    description:
      "You can review the application, documents and activity, but workflow actions are disabled.",
    buttonLabel: "View Summary",
    tab: "summary",
    section: "",
  };
};

const BackIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m5 12 4 4L19 6" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h14m-5-5 5 5-5 5" />
  </svg>
);

function ApplicationDetailPage({
  loggedInUserEmail: suppliedEmail = "",
  loggedInUserName: suppliedName = "",
  persona: suppliedPersona = "",
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { applicationNumber: routeApplicationNumber } = useParams();

  const query = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );

  const storedLeadId = routeApplicationNumber
    ? window.sessionStorage.getItem(
        `gold-loan:${routeApplicationNumber}:leadId`,
      )
    : "";

  const leadId =
    location.state?.leadId || query.get("leadId") || storedLeadId || "";

  const storedUser = useMemo(() => getStoredCognitoUser(), []);
  const loggedInUserEmail =
    suppliedEmail || location.state?.loggedInUserEmail || storedUser.email || "";
  const loggedInUserName =
    suppliedName || location.state?.loggedInUserName || storedUser.name || "";
  const persona = derivePersona(loggedInUserEmail, suppliedPersona);

  const [lead, setLead] = useState(location.state?.lead || null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");
  const [requestedSection, setRequestedSection] = useState("");
  const [activityExpanded, setActivityExpanded] = useState(false);

  const leadRef = useRef(null);
  const detailsRef = useRef({});
  const saveTimerRef = useRef(null);
  const saveChainRef = useRef(Promise.resolve());
  const saveSequenceRef = useRef(0);
  const initialTabResolvedRef = useRef(false);
  const mountedRef = useRef(true);

  const patchLeadDetails = useCallback(
    async (recordLeadId, nextLeadDetails, sequence) => {
      if (mountedRef.current) {
        setSaving(true);
        setSaveError("");
      }

      const response = await fetch(
        `${LEAD_DETAILS_API}/${encodeURIComponent(recordLeadId)}/details`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leadId: recordLeadId,
            leadDetailsPatch: nextLeadDetails,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Unable to save lead details (${response.status})`);
      }

      if (
        mountedRef.current &&
        sequence === saveSequenceRef.current
      ) {
        setLastSavedAt(new Date());
        setSaving(false);
      }

      return response.json().catch(() => null);
    },
    [],
  );

  const enqueueSave = useCallback(
    (nextLeadDetails, immediate = false) => {
      if (!leadId) return;

      const snapshot = clone(nextLeadDetails);
      const sequence = saveSequenceRef.current + 1;
      saveSequenceRef.current = sequence;

      if (mountedRef.current) {
        setSaving(true);
        setSaveError("");
      }

      const runSave = () => {
        saveChainRef.current = saveChainRef.current
          .catch(() => undefined)
          .then(() => patchLeadDetails(leadId, snapshot, sequence))
          .catch((error) => {
            console.error("Unable to update lead details:", error);

            if (
              mountedRef.current &&
              sequence === saveSequenceRef.current
            ) {
              setSaveError(
                error.message || "Unable to save application details.",
              );
              setSaving(false);
            }
          });
      };

      window.clearTimeout(saveTimerRef.current);

      if (immediate) {
        runSave();
      } else {
        saveTimerRef.current = window.setTimeout(runSave, 700);
      }
    },
    [leadId, patchLeadDetails],
  );

  const updateLeadDetails = useCallback(
    (updater, immediate = false) => {
      const currentDetails = clone(detailsRef.current || {});
      const updatedDetails =
        typeof updater === "function"
          ? updater(currentDetails)
          : updater;

      const finalLeadDetails = {
        ...(updatedDetails || currentDetails),
        updatedAt: new Date().toISOString(),
      };

      detailsRef.current = finalLeadDetails;

      setLead((currentLead) => {
        const nextLead = {
          ...(currentLead || leadRef.current || {}),
          leadDetails: finalLeadDetails,
          lead_details: JSON.stringify(finalLeadDetails),
        };
        leadRef.current = nextLead;
        return nextLead;
      });

      enqueueSave(finalLeadDetails, immediate);
      return finalLeadDetails;
    },
    [enqueueSave],
  );

  const appendActivity = useCallback(
    (event, immediate = true) =>
      updateLeadDetails((currentDetails) => {
        const applicationDetail = currentDetails.applicationDetail || {};
        const currentActivity = applicationDetail.activity || {};
        const now = new Date().toISOString();
        const actorName =
          loggedInUserName || loggedInUserEmail.split("@")[0] || persona;

        const nextEvent = {
          id:
            event?.id ||
            `ACT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          type: event?.type || "application_update",
          title: event?.title || "Application updated",
          description: event?.description || "",
          stage: event?.stage || applicationDetail.stage || "",
          section: event?.section || "",
          fromStatus: event?.fromStatus || "",
          toStatus: event?.toStatus || applicationDetail.status || "",
          actor: {
            name: actorName,
            email: loggedInUserEmail,
            role: persona,
          },
          comments: event?.comments || "",
          createdAt: event?.createdAt || now,
          metadata: event?.metadata || {},
        };

        return {
          ...currentDetails,
          applicationDetail: {
            ...applicationDetail,
            activity: {
              ...currentActivity,
              events: [
                nextEvent,
                ...(Array.isArray(currentActivity.events)
                  ? currentActivity.events
                  : []),
              ],
              lastUpdatedAt: now,
            },
          },
        };
      }, immediate),
    [
      loggedInUserEmail,
      loggedInUserName,
      persona,
      updateLeadDetails,
    ],
  );

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;

    const fetchLead = async () => {
      if (!leadId) {
        setLoadError(
          "Lead ID is missing. Open the application from the lead page or include ?leadId= in the URL.",
        );
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadError("");

      try {
        const response = await fetch(
          `${LEAD_API}/${encodeURIComponent(leadId)}`,
        );


        if (!response.ok) {
          throw new Error(`Unable to fetch lead (${response.status})`);
        }

        const payload = await response.json();

        if (!payload.success) {
          throw new Error(payload.message || "Lead was not found.");
        }

        if (cancelled) return;

        const record = payload.data || {};
        // The lead APIs are not consistent in their casing. Preserve the JSON
        // returned by either shape before handing it to every tab.
        const rawLeadDetails =
          record.lead_details ?? record.leadDetails ?? record.leaddetails ?? {};
        const parsedDetails = parseLeadDetails(rawLeadDetails);
        const baseLead = {
          id: record.id || record.lead_id || record.leadId || record.leadnumber || leadId,
          firstName: record.first_name || "",
          middleName: record.middle_name || "",
          lastName: record.last_name || "",
          mobile: record.mobile || "",
          email: record.email || "",
          product: record.product || "Gold Loan",
          source: record.source || "Branch",
          owner: record.owner || "Branch Maker",
          status: record.stage || "",
          relationshipType:
            parsedDetails.relationshipType ||
            record.relationship_type ||
            record.relationshipType ||
            "",
          cbsCustomerId:
            parsedDetails.cbsCustomerId ||
            record.cbs_customer_id ||
            record.cbscustomerid ||
            "",
          customerId:
            parsedDetails.customerId || record.customer_id || "",
          homeBranch:
            parsedDetails.homeBranch || record.home_branch || null,
          kycStatus:
            parsedDetails.kycStatus || record.kyc_status || "",
          leadDetails: parsedDetails,
          lead_details: typeof rawLeadDetails === "string" ? rawLeadDetails : JSON.stringify(parsedDetails),
        };

        const defaults = createDefaultApplicationDetail(
          routeApplicationNumber,
          baseLead,
        );
        const applicationDetail = mergeApplicationDetail(
          parsedDetails.applicationDetail,
          defaults,
        );
        const normalizedDetails = {
          ...parsedDetails,
          applicationDetail,
        };
        const nextLead = {
          ...baseLead,
          leadDetails: normalizedDetails,
          lead_details: JSON.stringify(normalizedDetails),
        };

        leadRef.current = nextLead;
        detailsRef.current = normalizedDetails;
        setLead(nextLead);

        if (routeApplicationNumber) {
          window.sessionStorage.setItem(
            `gold-loan:${routeApplicationNumber}:leadId`,
            nextLead.id,
          );
        }

        if (!parsedDetails.applicationDetail) {
          enqueueSave(normalizedDetails, true);
        }
      } catch (error) {
        console.error("Unable to load lead:", error);

        if (!cancelled) {
          setLoadError(error.message || "Unable to load the lead.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchLead();

    return () => {
      cancelled = true;
      mountedRef.current = false;
      window.clearTimeout(saveTimerRef.current);
    };
  }, [enqueueSave, leadId, routeApplicationNumber]);

  const applicationDetail =
    lead?.leadDetails?.applicationDetail || {};
  const customerName = [
    lead?.firstName,
    lead?.middleName,
    lead?.lastName,
  ]
    .filter(Boolean)
    .join(" ") || "Customer name unavailable";
  const applicationNumber =
    applicationDetail.applicationNumber ||
    routeApplicationNumber ||
    lead?.leadDetails?.applicationNumber ||
    lead?.id ||
    "—";
  const currentStageIndex = getStageIndex(applicationDetail);
  const currentAction = useMemo(
    () => getActionForUser(persona, applicationDetail),
    [applicationDetail, persona],
  );

  useEffect(() => {
    if (!lead || initialTabResolvedRef.current) return;
    initialTabResolvedRef.current = true;
    if (persona === "Checker") {
      setActiveTab("summary");
      setRequestedSection("");
    } else {
      setActiveTab(currentAction.tab);
      setRequestedSection(currentAction.section || "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead]); // Only run once when lead first loads — persona and currentAction are stable at this point

  const activityEvents = Array.isArray(applicationDetail?.activity?.events)
    ? applicationDetail.activity.events
    : [];
  const visibleActivity = activityExpanded
    ? activityEvents
    : activityEvents.slice(0, 8);

  const documentationUnlocked = currentStageIndex === 2;

  const checklist = DEFAULT_CHECKLIST.map((item) => {
    const saved = applicationDetail?.checklist?.[item.id];
    const value =
      typeof saved === "string"
        ? saved
        : saved?.status || (saved === true ? "Completed" : "Pending");
    return { ...item, status: value };
  });

  const openAction = () => {
    setActiveTab(currentAction.tab);
    setRequestedSection(currentAction.section || "");
    window.requestAnimationFrame(() => {
      document
        .getElementById("application-workspace")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const retryLoad = () => window.location.reload();

  const tabProps = {
    leadId,
    lead,
    setLead,
    loggedInUserEmail,
    loggedInUserName,
    persona,
    leadApiBase: LEAD_DETAILS_API,
    updateLeadDetails,
    appendActivity,
    requestedSection,
    readOnly: persona === "Read only",
  };

  if (loading) {
    return (
      <main className="application-detail-page application-detail-state-page">
        <div className="application-loading-card" role="status">
          <div className="application-loader" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <p className="application-loading-eyebrow">YES BANK GOLD LOAN</p>
          <h1>Loading application</h1>
          <p>Fetching the latest customer and workflow information.</p>
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="application-detail-page application-detail-state-page">
        <div className="application-error-card" role="alert">
          <span className="application-error-mark">!</span>
          <p className="application-loading-eyebrow">APPLICATION UNAVAILABLE</p>
          <h1>We could not open this application</h1>
          <p>{loadError}</p>
          <div className="application-state-actions">
            <button type="button" onClick={() => navigate(-1)}>
              Go back
            </button>
            {leadId && (
              <button type="button" className="primary" onClick={retryLoad}>
                Try again
              </button>
            )}
          </div>
        </div>
      </main>
    );
  }

  // 1. Resolve Requested Amount across all possible payload paths
  const resolvedRequestedAmount =
    applicationDetail.requestedAmount ||
    lead?.leadDetails?.facilityBranchLoanDetails?.requestedLoanAmount ||
    lead?.leadDetails?.facilityBranchLoanDetails?.exposure?.requestedLoanAmount ||
    lead?.leadDetails?.facilityBranchLoanDetails?.productFacilityAndScheme?.requestedLoanAmount ||
    lead?.leadDetails?.applicationDetail?.details?.eligibilityRecommendation?.requiredAmount ||
    lead?.requestedAmount ||
    lead?.amount;

  // 2. Resolve Servicing Branch across all possible payload paths
  const resolvedServicingBranch =
    applicationDetail.branch?.name ||
    applicationDetail.branch?.branchName ||
    lead?.leadDetails?.facilityBranchLoanDetails?.selectedBranch?.branchName ||
    lead?.leadDetails?.facilityBranchLoanDetails?.selectedBranch?.name ||
    lead?.leadDetails?.facilityBranchLoanDetails?.branch?.branchName ||
    lead?.leadDetails?.facilityBranchLoanDetails?.branch?.name ||
    lead?.leadDetails?.facilityBranchLoanDetails?.branchSelection?.selectedBranch?.name ||
    lead?.leadDetails?.facilityBranchLoanDetails?.branchSelection?.selectedBranch?.branchName ||
    lead?.homeBranch?.branchName ||
    lead?.homeBranch?.name ||
    lead?.branch?.branchName ||
    lead?.branch?.name ||
    lead?.branchName ||
    lead?.branch;

  // 3. Resolve Relationship Type
  const resolvedRelationshipType =
    lead?.relationshipType ||
    lead?.leadDetails?.relationshipType ||
    lead?.leadDetails?.customerIdentity?.relationshipType ||
    lead?.leadDetails?.customerIdentity?.type ||
    "NTB";

  return (
    <div className="application-detail-page">
      <header className="application-topbar">
        <div className="application-topbar__left">
          <button
            type="button"
            className="application-back-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <BackIcon />
          </button>
          <img
            className="application-logo"
            src="/images/yes-bank-logo-dark-bg.png"
            alt="YES BANK"
          />
          <span className="application-topbar__divider" aria-hidden="true" />
          <div>
            <p className="application-topbar__title">Gold Loan Application</p>
            <p className="application-topbar__subtitle">
              Application detail workspace
            </p>
          </div>
        </div>

        <div className="application-user-block">
          <div className="application-save-state" aria-live="polite">
            {saveError ? (
              <span className="is-error">Save failed</span>
            ) : saving ? (
              <span className="is-saving">Saving…</span>
            ) : lastSavedAt ? (
              <span className="is-saved">
                <CheckIcon /> Saved {formatDateTime(lastSavedAt)}
              </span>
            ) : (
              <span>All changes synced</span>
            )}
          </div>
          <div className="application-user-avatar" aria-hidden="true">
            {getInitials(loggedInUserName || loggedInUserEmail || persona)}
          </div>
          <div className="application-user-copy">
            <strong>{persona}</strong>
            <span>{loggedInUserEmail || "User email unavailable"}</span>
          </div>
        </div>
      </header>

      <main className="application-page-content">
        {/* Top Context Banner */}
        <section className="application-context-header">
          <div className="application-context-header__main">
            <div className="application-context-eyebrow">
              <span>GOLD LOAN APPLICATION</span>
              <span className="application-number">#{applicationNumber}</span>
            </div>
            <div className="application-title-row">
              <div>
                <h1>{customerName}</h1>
                <p>
                  {[
                    applicationDetail.facility,
                    lead?.leadDetails?.facilityBranchLoanDetails?.facilityType,
                    lead?.leadDetails?.facilityBranchLoanDetails?.productFacilityAndScheme?.productLabel,
                    lead?.product,
                  ].find(hasText) || "Gold Loan"}
                  <span aria-hidden="true"> · </span>
                  {[
                    applicationDetail.scheme,
                    lead?.leadDetails?.facilityBranchLoanDetails?.scheme?.name,
                    lead?.leadDetails?.facilityBranchLoanDetails?.scheme,
                    lead?.leadDetails?.facilityBranchLoanDetails?.schemeName,
                    lead?.leadDetails?.facilityBranchLoanDetails?.productFacilityAndScheme?.schemeName,
                    lead?.leadDetails?.applicationDetail?.details?.eligibilityRecommendation?.scheme,
                  ].find(hasText) || "Standard Term Loan"}
                </p>
              </div>
              <div className="application-header-badges">
                <span className="application-badge relationship">
                  {resolvedRelationshipType}
                </span>
                <span className="application-badge status">
                  {applicationDetail.status || lead?.status || "In progress"}
                </span>
              </div>
            </div>
          </div>

          <dl className="application-context-metrics">
            <div>
              <dt>Requested amount</dt>
              <dd>{formatCurrency(resolvedRequestedAmount)}</dd>
            </div>
            <div>
              <dt>Servicing branch</dt>
              <dd>{resolvedServicingBranch || "—"}</dd>
            </div>
            <div>
              <dt>Current owner</dt>
              <dd>
                {applicationDetail.assignment?.currentOwner ||
                  applicationDetail.currentOwner ||
                  lead?.owner ||
                  "Branch Maker"}
              </dd>
            </div>
          </dl>
        </section>

        {persona === "Read only" && (
          <div className="application-inline-message warning" role="status">
            This email is not mapped to Maker, Appraiser or Checker. The
            application is available in read-only mode.
          </div>
        )}

        {saveError && (
          <div className="application-inline-message error" role="alert">
            <strong>Changes are not saved.</strong> {saveError}
          </div>
        )}

        <section className="application-stage-card" aria-label="Application stages">
          <div className="application-stage-card__heading">
            <div>
              <span>APPLICATION JOURNEY</span>
              <h2>Current processing stage</h2>
            </div>
            <span className="application-stage-count">
              Stage {String(currentStageIndex + 1).padStart(2, "0")} of 03
            </span>
          </div>

          <ol className="application-stage-tracker">
            {STAGES.map((stage, index) => {
              const state =
                index < currentStageIndex
                  ? "complete"
                  : index === currentStageIndex
                    ? "active"
                    : "upcoming";
              return (
                <li key={stage.id} className={`is-${state}`}>
                  <div className="application-stage-marker">
                    {state === "complete" ? <CheckIcon /> : stage.number}
                  </div>
                  <div>
                    <span>{state === "active" ? "Current stage" : state}</span>
                    <strong>{stage.label}</strong>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <div className="application-layout">
          <section
            className="application-workspace"
            id="application-workspace"
          >
            <nav className="application-tabs" aria-label="Application sections">
              {TABS.map((tab) => {
                const locked =
                  tab.id === "documentationDisbursement" &&
                  !documentationUnlocked;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    className={activeTab === tab.id ? "is-active" : ""}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setRequestedSection("");
                    }}
                    disabled={locked}
                    aria-current={activeTab === tab.id ? "page" : undefined}
                    title={
                      locked
                        ? "Available after appraisal is completed"
                        : undefined
                    }
                  >
                    {tab.label}
                    {locked && <span className="tab-lock">Locked</span>}
                  </button>
                );
              })}
            </nav>

            <div className="application-tab-content">
              {activeTab === "summary" && (
                <ApplicationSummaryTab {...tabProps} />
              )}
              {activeTab === "details" && (
                <ApplicationDetailsTab {...tabProps} />
              )}
              {activeTab === "documentationDisbursement" &&
                documentationUnlocked && (
                  <DocumentationDisbursementTab {...tabProps} />
                )}
            </div>
          </section>

          <aside className="application-context-panel">
            <section className="application-action-card">
              <span className="application-action-card__eyebrow">
                {currentAction.eyebrow}
              </span>
              <h2>{currentAction.title}</h2>
              <p>{currentAction.description}</p>
              <button type="button" onClick={openAction}>
                {currentAction.buttonLabel}
                <ArrowIcon />
              </button>
            </section>

            <section className="application-side-card">
              <div className="application-side-card__heading">
                <div>
                  <span>WORKFLOW CONTEXT</span>
                  <h2>Assignment</h2>
                </div>
              </div>
              <dl className="application-assignment-list">
                <div>
                  <dt>Current owner</dt>
                  <dd>
                    {applicationDetail.assignment?.currentOwner ||
                      applicationDetail.currentOwner ||
                      lead?.owner ||
                      "—"}
                  </dd>
                </div>
                <div>
                  <dt>Assigned persona</dt>
                  <dd>
                    {applicationDetail.assignment?.persona ||
                      applicationDetail.assignedPersona ||
                      "—"}
                  </dd>
                </div>
                <div>
                  <dt>Servicing branch</dt>
                  <dd>
                    {applicationDetail.branch?.name ||
                      lead?.homeBranch?.name ||
                      lead?.homeBranch?.branchName ||
                      "—"}
                  </dd>
                </div>
                <div>
                  <dt>Last updated</dt>
                  <dd>
                    {formatDateTime(
                      applicationDetail.updatedAt ||
                        lead?.leadDetails?.updatedAt,
                    )}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="application-side-card">
              <div className="application-side-card__heading">
                <div>
                  <span>PROGRESS</span>
                  <h2>Workflow checklist</h2>
                </div>
              </div>
              <ul className="application-checklist">
                {checklist.map((item) => {
                  const statusClass = String(item.status)
                    .toLowerCase()
                    .replace(/\s+/g, "-");
                  return (
                    <li key={item.id}>
                      <span className={`check-state is-${statusClass}`}>
                        {String(item.status).toLowerCase() === "completed" ? (
                          <CheckIcon />
                        ) : (
                          <span />
                        )}
                      </span>
                      <span>{item.label}</span>
                      <small>{item.status}</small>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="application-side-card application-activity-card">
              <button
                type="button"
                className="application-activity-toggle"
                onClick={() => setActivityExpanded((current) => !current)}
                aria-expanded={activityExpanded}
              >
                <span>
                  <small>RECENT EVENTS</small>
                  <strong>Activity</strong>
                </span>
                <span>{activityEvents.length}</span>
              </button>

              <div className="application-activity-content">
                {visibleActivity.length ? (
                  <ol className="application-activity-list">
                    {visibleActivity.map((event) => (
                      <li key={event.id || `${event.title}-${event.createdAt}`}>
                        <span className="activity-icon">
                          <ClockIcon />
                        </span>
                        <div>
                          <strong>{event.title || "Application updated"}</strong>
                          {event.description && <p>{event.description}</p>}
                          <span>
                            {event.actor?.name ||
                              event.actor?.role ||
                              "System"}
                            {event.createdAt
                              ? ` · ${formatDateTime(event.createdAt)}`
                              : ""}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <div className="application-empty-activity">
                    <ClockIcon />
                    <strong>No activity recorded yet</strong>
                    <p>Workflow actions will appear here.</p>
                  </div>
                )}

                {activityEvents.length > 8 && (
                  <button
                    type="button"
                    className="application-show-activity"
                    onClick={() => setActivityExpanded((current) => !current)}
                  >
                    {activityExpanded ? "Show recent activity" : "View complete activity"}
                  </button>
                )}
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default ApplicationDetailPage;