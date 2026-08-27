import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./ApplicationDetailsTab.css";

const DEFAULT_LEAD_API_BASE =
  "https://700pag34e9.execute-api.ap-south-1.amazonaws.com/prod/leads";

const WORKFLOW_USERS = {
  "shivgaikwad@deloitte.com": { name: "Shivanjali Gaikwad", persona: "Maker" },
  "mohikumawat@deloitte.com": { name: "Mohit Kumawat", persona: "Appraiser" },
  "ychapa@deloitte.com": { name: "Yashwant Chapa", persona: "Checker" },
};

const SECTIONS = [
  { id: "jewelleryAppraisal", number: "01", label: "Jewellery appraisal", shortLabel: "Appraisal", icon: "jewellery" },
  { id: "eligibilityRecommendation", number: "02", label: "Loan recommendation", shortLabel: "Recommendation", icon: "calculator" },
  { id: "checkerDecision", number: "03", label: "Checker decision", shortLabel: "Decision", icon: "decision" },
];

const DEMO_APPLICATION_WORKFLOWS = {
  "GL-2026-439306": {
    persona: "Maker",
    section: "eligibilityRecommendation",
    applicationStatus: "Pending Maker Finalisation",
    appraisalStatus: "Completed",
    eligibilityStatus: "In Progress",
    appraiserName: "Ramesh Jewellers",
  },
  "GL-2026-354125": {
    persona: "Checker",
    section: "checkerDecision",
    applicationStatus: "Pending Checker Review",
    appraisalStatus: "Completed",
    eligibilityStatus: "Submitted to Checker",
    appraiserName: "Ramesh Jewellers",
  },
};

const DEMO_LEAD_WORKFLOWS = {
  "LD-1786692354125": {
    force: true,
    persona: "Maker",
    section: "eligibilityRecommendation",
    applicationStatus: "Pending Maker Finalisation",
    appraisalStatus: "Completed",
    eligibilityStatus: "In Progress",
    appraiserName: "Mohit Kumawat",
  },
  "LD-1786687624527": {
    force: true,
    persona: "Checker",
    section: "checkerDecision",
    applicationStatus: "Pending Checker Review",
    appraisalStatus: "Completed",
    eligibilityStatus: "Submitted to Checker",
    appraiserName: "Mohit Kumawat",
  },
};

const PURITY_OPTIONS = ["24K / 999", "22K / 916", "18K / 750"];
const LENDING_RATE_BY_PURITY = {
  "24K / 999": 15528,
  "22K / 916": 14224,
  "18K / 750": 11646,
};
const PUSHBACK_SECTIONS = [
  { value: "Jewellery Appraisal", label: "Jewellery appraisal" },
  { value: "Eligibility & Recommendation", label: "Loan recommendation" },
];

const WEIGHT_LIMITS = {
  goldOrnament: { label: "Gold ornaments", limit: 1000 },
  goldCoin: { label: "Gold coins", limit: 50 },
  silverOrnament: { label: "Silver ornaments", limit: 10000 },
  silverCoin: { label: "Silver coins", limit: 500 },
};

const parseLeadDetails = (value) => {
  if (!value) return {};
  if (typeof value === "object") return value;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    console.error("Unable to parse lead details:", error);
    return {};
  }
};

const clone = (value) => JSON.parse(JSON.stringify(value));
const hasValue = (value) => value !== undefined && value !== null && value !== "";
const getByPath = (source, path) =>
  String(path)
    .split(".")
    .reduce(
      (current, key) =>
        current && Object.prototype.hasOwnProperty.call(current, key)
          ? current[key]
          : undefined,
      source,
    );
const selectValue = (source, paths, fallback = undefined) => {
  for (const path of paths) {
    const value = getByPath(source, path);
    if (hasValue(value)) return value;
  }
  return fallback;
};
const toNumber = (value) => {
  if (!hasValue(value)) return null;
  const normalized = typeof value === "string" ? value.replace(/[^0-9.-]/g, "") : value;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
};
const textValue = (value, fallback = "—") => {
  if (!hasValue(value)) return fallback;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") {
    return String(value.name || value.label || value.status || value.value || fallback);
  }
  return String(value);
};
const formatCurrency = (value) => {
  const amount = toNumber(value);
  if (amount === null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};
const formatWeight = (value) => {
  const weight = toNumber(value);
  return weight === null
    ? "—"
    : `${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(weight)} g`;
};
const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return textValue(value);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};
const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return textValue(value);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};
const statusTone = (value) => {
  const status = String(value || "pending").toLowerCase();
  if (/complete|verified|approved|eligible|sanctioned|signed|generated|disbursed|active|passed|submitted|ready|not required/.test(status)) return "success";
  if (/fail|reject|block|expired|exceed|below|missing/.test(status)) return "danger";
  if (/progress|awaiting|required|pending|rework|pushback|clarification/.test(status)) return "warning";
  return "neutral";
};
const normalizePersona = (value) => {
  const persona = String(value || "").toLowerCase();
  if (persona.includes("appraiser") || persona.includes("jeweller")) return "Appraiser";
  if (persona.includes("checker")) return "Checker";
  if (persona.includes("maker")) return "Maker";
  return "Viewer";
};
const userForEmail = (email) =>
  WORKFLOW_USERS[String(email || "").trim().toLowerCase()] || null;
const normalizeSection = (value) => {
  const section = String(value || "").toLowerCase().replace(/[^a-z]/g, "");
  if (section.includes("customer") || section.includes("kyc")) return "customerKyc";
  if (section.includes("loan") || section.includes("branch")) return "loanBranch";
  if (section.includes("compliance") || section.includes("cibil") || section.includes("land")) return "compliance";
  if (section.includes("jewellery") || section.includes("appraisal")) return "jewelleryAppraisal";
  if (section.includes("eligibility") || section.includes("recommendation")) return "eligibilityRecommendation";
  if (section.includes("checker") || section.includes("decision")) return "checkerDecision";
  return "";
};
const getCategoryKey = (item) => {
  const value = String(item.category || item.metalCategory || item.ornamentCategory || "gold ornament").toLowerCase();
  if (value.includes("silver") && value.includes("coin")) return "silverCoin";
  if (value.includes("silver")) return "silverOrnament";
  if (value.includes("coin")) return "goldCoin";
  return "goldOrnament";
};
const deductionTotalFor = (item) =>
  [
    item.appraisal?.stoneDeduction,
    item.appraisal?.alloyDeduction,
    item.appraisal?.fasteningDeduction,
    item.appraisal?.otherDeduction,
  ].reduce((sum, value) => sum + (toNumber(value) || 0), 0);
const netWeightFor = (item) => {
  const gross = toNumber(item.appraisal?.grossWeight) || 0;
  const deductions = deductionTotalFor(item);
  return Math.max(0, Number((gross - deductions).toFixed(2)));
};
const lendingRateFor = (item) => LENDING_RATE_BY_PURITY[item?.appraisal?.purity] || 0;
const appraisedValueFor = (item) =>
  Math.round(netWeightFor(item) * lendingRateFor(item));
const applicableLtvFor = (appraisedValue) => {
  const value = toNumber(appraisedValue) || 0;
  if (value <= 250000) return 85;
  if (value <= 500000) return 80;
  return 75;
};
const emptyAppraisal = () => ({
  defectPresent: "No",
  defectDescription: "",
  purity: "",
  grossWeight: "",
  stoneDeduction: "",
  alloyDeduction: "",
  fasteningDeduction: "",
  otherDeduction: "",
  jewelleryMatchesImage: false,
  remarks: "",
  status: "Pending",
});
const normalizeItems = (items) =>
  (Array.isArray(items) ? items : []).map((item, index) => ({
    ...item,
    id: item.id || item.itemId || `JWL-${String(index + 1).padStart(3, "0")}`,
    serialNumber: item.serialNumber || item.serialNo || index + 1,
    description: item.description || item.ornamentDescription || item.ornamentType || item.jewelleryType || "Jewellery item",
    itemCount: item.itemCount || item.numberOfItems || item.quantity || item.noOfItems || 1,
    category: item.category || item.metalCategory || item.ornamentCategory || "Gold Ornament",
    ownershipDeclaration: item.ownershipDeclaration || item.ownershipStatus || "Declared by customer",
    ownershipProof: item.ownershipProof || item.proof || null,
    makerRemarks: item.makerRemarks || item.remarks || "",
    appraisal: {
      ...emptyAppraisal(),
      ...(item.appraisal || item.assessment || item.appraiserAssessment || {}),
      purity: item.appraisal?.purity || item.quality || item.fineness || (item.qualityFinenessK ? `${item.qualityFinenessK}K / ${item.qualityFinenessK === 24 ? "999" : item.qualityFinenessK === 22 ? "916" : "750"}` : ""),
      grossWeight: item.appraisal?.grossWeight || item.newWeightGrams || item.netWeight || item.weight || "",
      defectPresent: item.appraisal?.defectPresent || (item.jewelleryDefects ? "Yes" : "No"),
      defectDescription: item.appraisal?.defectDescription || item.jewelleryDefects || "",
      jewelleryMatchesImage: Boolean(
        item.appraisal?.jewelleryMatchesImage ??
          item.assessment?.jewelleryMatchesImage ??
          item.appraiserAssessment?.jewelleryMatchesImage,
      ),
    },
  }));

const Icon = ({ type }) => {
  const paths = {
    customer: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0" />,
    bank: <path d="M3 10h18M5 10v8m4-8v8m6-8v8m4-8v8M3 20h18M12 3l9 5H3z" />,
    shield: <path d="M12 3 5 6v5c0 4.7 2.8 8 7 10 4.2-2 7-5.3 7-10V6zM9 12l2 2 4-5" />,
    jewellery: <path d="m3 9 4-5h10l4 5-9 12zm0 0h18M7 4l5 5 5-5M12 9v12" />,
    calculator: <path d="M6 3h12v18H6zM9 7h6M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01" />,
    decision: <path d="M5 20V4h10l4 4v12zM9 12h6M9 16h4M14 4v5h5" />,
    check: <path d="m5 12 4 4L19 6" />,
    edit: <path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10zM14 7l3 3" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    upload: <path d="M12 16V4m-4 4 4-4 4 4M4 15v5h16v-5" />,
    alert: <path d="M12 3 2 21h20zM12 9v5m0 3h.01" />,
    lock: <path d="M6 10h12v10H6zM8 10V7a4 4 0 0 1 8 0v3" />,
    info: <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-11v6m0-10h.01" />,
    trash: <path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7m4 4v6m4-6v6" />,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[type] || paths.info}</svg>;
};

const Status = ({ value }) => (
  <span className={`details-status is-${statusTone(value)}`}>{textValue(value, "Pending")}</span>
);

const SectionHeading = ({ eyebrow, title, description, status, editable }) => (
  <header className="details-section-heading">
    <div>
      <p>{eyebrow}</p>
      <h3>{title}</h3>
      {description && <span>{description}</span>}
    </div>
    <div className="details-section-heading__meta">
      {status && <Status value={status} />}
      {editable && (
        <span className="details-access can-edit">
          <Icon type="edit" />
          Action required
        </span>
      )}
    </div>
  </header>
);

const ReadOnlyGrid = ({ fields, columns = 3 }) => (
  <dl className={`details-read-grid columns-${columns}`}>
    {fields.map((field) => (
      <div key={field.label} className={field.wide ? "wide" : ""}>
        <dt>{field.label}</dt>
        <dd>{field.status ? <Status value={field.value} /> : textValue(field.value)}</dd>
        {field.helper && <small>{field.helper}</small>}
      </div>
    ))}
  </dl>
);

const Field = ({ label, required, error, helper, children, wide = false }) => (
  <label className={`details-field ${wide ? "wide" : ""} ${error ? "has-error" : ""}`}>
    <span>{label}{required && <b aria-hidden="true">*</b>}</span>
    {children}
    {error ? <small className="field-error">{error}</small> : helper ? <small>{helper}</small> : null}
  </label>
);

const buildView = (leadDetails, lead) => {
  const application = leadDetails.applicationDetail || {};
  const details = application.details || {};
  const identity = leadDetails.customerIdentity || leadDetails.customerAuthenticationConsent || {};
  const facility = leadDetails.facilityBranchLoanDetails || {};
  const support = leadDetails.eligibilitySupportingDetails || {};
  const customer = {
    name: [lead?.firstName, lead?.middleName, lead?.lastName].filter(Boolean).join(" ") || selectValue(leadDetails, ["borrowerInformation.details.fullName", "borrowerInformation.details.firstName", "customerIdentity.matchedCustomer.fullName", "customerIdentity.borrowerInformation.fullName", "customerIdentity.customer.name"], "—"),
    relationship: lead?.relationshipType || selectValue(leadDetails, ["relationshipType", "customerIdentity.relationshipType"], "—"),
    cbsCustomerId: lead?.cbsCustomerId || selectValue(leadDetails, ["cbsCustomerId", "customerIdentity.cbsCustomerId", "customerIdentity.customer.customerId"], "—"),
    dob: selectValue(leadDetails, ["borrowerInformation.details.dateOfBirth", "customerIdentity.matchedCustomer.dateOfBirth", "customerIdentity.borrowerInformation.dateOfBirth", "customerIdentity.customer.dateOfBirth", "customerIdentity.dob"], "—"),
    pan: selectValue(leadDetails, ["borrowerInformation.details.pan", "customerIdentity.matchedCustomer.pan", "customerIdentity.borrowerInformation.pan", "customerIdentity.pan.number", "customerIdentity.panNumber"], "—"),
    mobile: lead?.mobile || selectValue(leadDetails, ["customerIdentity.mobile"], "—"),
    email: lead?.email || selectValue(leadDetails, ["customerIdentity.email"], "—"),
    kycStatus: lead?.kycStatus || selectValue(leadDetails, ["customerIdentity.kycStatus", "customerIdentity.borrowerInformation.kycStatus"], "Pending"),
    permanentAddress: selectValue(leadDetails, ["customerIdentity.borrowerInformation.permanentAddress", "customerIdentity.address.permanent", "customerIdentity.permanentAddress"], "—"),
    communicationAddress: selectValue(leadDetails, ["customerIdentity.borrowerInformation.communicationAddress", "customerIdentity.address.communication", "customerIdentity.communicationAddress"], "—"),
    consentStatus: selectValue(leadDetails, ["customerIdentity.consent.status", "customerIdentity.customerConsent.status", "customerIdentity.consentStatus"], "Pending"),
    consentReference: selectValue(leadDetails, ["customerIdentity.consent.reference", "customerIdentity.customerConsent.reference", "customerIdentity.consentReference"], "—"),
    consentAt: selectValue(leadDetails, ["customerIdentity.consent.capturedAt", "customerIdentity.customerConsent.capturedAt", "customerIdentity.consentTimestamp"], null),
  };
  const selectedBranch = facility.branch || facility.selectedBranch || application.branch || {};
  const existingLoansValue = selectValue(leadDetails, ["facilityBranchLoanDetails.existingGoldLoans", "facilityBranchLoanDetails.exposure.existingLoans", "applicationDetail.details.loanBranch.existingGoldLoans"], []);
  const accountsValue = selectValue(leadDetails, ["facilityBranchLoanDetails.activeCasaAccounts", "facilityBranchLoanDetails.accounts", "customerIdentity.activeCasaAccounts"], []);
  const loan = {
    facilityType: selectValue(leadDetails, ["facilityBranchLoanDetails.facilityType", "facilityBranchLoanDetails.facility", "applicationDetail.facility"], lead?.product || "Gold Loan"),
    scheme: selectValue(leadDetails, ["facilityBranchLoanDetails.scheme.name", "facilityBranchLoanDetails.scheme", "facilityBranchLoanDetails.schemeName", "applicationDetail.scheme"], "—"),
    purpose: selectValue(leadDetails, ["facilityBranchLoanDetails.loanPurpose", "facilityBranchLoanDetails.purpose"], "—"),
    tenure: selectValue(leadDetails, ["facilityBranchLoanDetails.tenure", "facilityBranchLoanDetails.loan.tenure"], "—"),
    repaymentType: selectValue(leadDetails, ["facilityBranchLoanDetails.repaymentType", "facilityBranchLoanDetails.loan.repaymentType"], "—"),
    requestedAmount: selectValue(leadDetails, ["facilityBranchLoanDetails.requestedLoanAmount", "facilityBranchLoanDetails.requestedAmount", "applicationDetail.requestedAmount"], 450000),
    existingExposure: selectValue(leadDetails, ["facilityBranchLoanDetails.exposure.existingGoldLoanExposure", "facilityBranchLoanDetails.exposure.existingExposure"], 0),
    aggregateExposure: selectValue(leadDetails, ["facilityBranchLoanDetails.exposure.aggregateGoldLoanExposure", "facilityBranchLoanDetails.exposure.aggregateExposure"], 0),
    chargesAccount: selectValue(leadDetails, ["facilityBranchLoanDetails.chargesAccount", "facilityBranchLoanDetails.accounts.chargesAccount"], "XXXXXX4821"),
    disbursementAccount: selectValue(leadDetails, ["facilityBranchLoanDetails.disbursementAccount", "applicationDetail.makerFinalisation.disbursementAccount"], "XXXXXX4821"),
    existingLoans: Array.isArray(existingLoansValue) ? existingLoansValue : [],
    accounts: Array.isArray(accountsValue) && accountsValue.length
      ? accountsValue
      : [{ accountNumber: "XXXXXX4821", maskedAccountNumber: "XXXXXX4821", status: "Active" }],
    savingsNominee: selectValue(leadDetails, [
      "facilityBranchLoanDetails.savingsNominee",
      "customerIdentity.savingsNominee",
      "customerIdentity.customer.savingsNominee",
    ], {}),
    branch: {
      name: selectedBranch.branchName || selectedBranch.name || "—",
      code: selectedBranch.branchCode || selectedBranch.code || "—",
      address: selectedBranch.address || selectedBranch.completeAddress || "—",
      pinCode: selectedBranch.pinCode || selectedBranch.pincode || "—",
      dpCode: selectedBranch.dpCode || "—",
    },
  };
  const complianceSource = application.compliance || details.compliance || support || {};
  const compliance = {
    cibilRequired: selectValue(leadDetails, ["applicationDetail.compliance.cibilRequired", "applicationDetail.details.compliance.cibilRequired", "eligibilitySupportingDetails.cibilRequired", "facilityBranchLoanDetails.exposure.cibilRequired"], false),
    cibilStatus: selectValue(leadDetails, ["applicationDetail.compliance.cibil.status", "applicationDetail.compliance.cibilStatus", "eligibilitySupportingDetails.cibil.status", "eligibilitySupportingDetails.cibilStatus"], "Pending"),
    cibilScore: selectValue(leadDetails, ["applicationDetail.compliance.cibil.score", "applicationDetail.compliance.cibilScore", "eligibilitySupportingDetails.cibil.score", "eligibilitySupportingDetails.cibilScore"], null),
    minimumScore: selectValue(leadDetails, ["applicationDetail.compliance.cibil.minimumScore", "applicationDetail.compliance.minimumCibilScore", "eligibilitySupportingDetails.cibil.minimumScore"], null),
    cibilReference: selectValue(leadDetails, ["applicationDetail.compliance.cibil.reference", "eligibilitySupportingDetails.cibil.reference"], "—"),
    cibilAt: selectValue(leadDetails, ["applicationDetail.compliance.cibil.completedAt", "eligibilitySupportingDetails.cibil.completedAt"], null),
    cibilReport: selectValue(leadDetails, ["applicationDetail.compliance.cibil.reportUrl", "eligibilitySupportingDetails.cibil.reportUrl"], "/docs/cibil-report.pdf"),
    landRequired: selectValue(leadDetails, ["applicationDetail.compliance.landDetailsRequired", "applicationDetail.details.compliance.landDetailsRequired", "eligibilitySupportingDetails.landDetailsRequired", "facilityBranchLoanDetails.exposure.landDetailsRequired"], false),
    landStatus: selectValue(leadDetails, ["applicationDetail.compliance.landDetails.status", "applicationDetail.compliance.landStatus", "eligibilitySupportingDetails.landDetails.status", "eligibilitySupportingDetails.landStatus"], "Pending"),
    state: selectValue(leadDetails, ["eligibilitySupportingDetails.landDetails.state", "applicationDetail.compliance.landDetails.state"], "—"),
    district: selectValue(leadDetails, ["eligibilitySupportingDetails.landDetails.district", "applicationDetail.compliance.landDetails.district"], "—"),
    village: selectValue(leadDetails, ["eligibilitySupportingDetails.landDetails.village", "applicationDetail.compliance.landDetails.village"], "—"),
    surveyNumber: selectValue(leadDetails, ["eligibilitySupportingDetails.landDetails.surveyNumber", "applicationDetail.compliance.landDetails.surveyNumber"], "—"),
    season: selectValue(leadDetails, ["eligibilitySupportingDetails.landDetails.season", "applicationDetail.compliance.landDetails.season"], "—"),
    crop: selectValue(leadDetails, ["eligibilitySupportingDetails.landDetails.crop", "applicationDetail.compliance.landDetails.crop"], "—"),
    landArea: selectValue(leadDetails, ["eligibilitySupportingDetails.landDetails.landArea", "applicationDetail.compliance.landDetails.landArea"], "—"),
    costPerUnit: selectValue(leadDetails, ["eligibilitySupportingDetails.landDetails.costPerUnit", "applicationDetail.compliance.landDetails.costPerUnit"], "—"),
    ownershipStatus: selectValue(leadDetails, ["eligibilitySupportingDetails.landDetails.ownershipStatus", "applicationDetail.compliance.landDetails.ownershipStatus"], "—"),
    document: selectValue(leadDetails, ["eligibilitySupportingDetails.landDetails.document", "applicationDetail.compliance.landDetails.document"], null),
    verifiedBy: selectValue(leadDetails, ["eligibilitySupportingDetails.landDetails.verifiedBy", "applicationDetail.compliance.landDetails.verifiedBy"], "—"),
    verifiedAt: selectValue(leadDetails, ["eligibilitySupportingDetails.landDetails.verifiedAt", "applicationDetail.compliance.landDetails.verifiedAt"], null),
    raw: complianceSource,
  };
  const itemsValue = [
    getByPath(leadDetails, "applicationDetail.details.jewelleryAppraisal.items"),
    getByPath(leadDetails, "applicationDetail.appraisal.items"),
    getByPath(leadDetails, "applicationDetail.jewelleryAppraisal.items"),
    getByPath(leadDetails, "facilityBranchLoanDetails.jewelleryItems"),
    getByPath(leadDetails, "jewelleryDetails.items"),
    getByPath(leadDetails, "jewelleryDetails.jewelleryItems"),
  ].find((items) => Array.isArray(items) && items.length) || [];
  const jewelleryItems = Array.isArray(itemsValue) && itemsValue.length
    ? itemsValue
    : [];
  const appraiserSource = selectValue(
    leadDetails,
    [
      "applicationDetail.assignment.appraiser",
      "applicationDetail.details.jewelleryAppraisal.appraiser",
      "applicationDetail.appraisal.appraiser",
      "applicationDetail.jewelleryAppraisal.appraiser",
      "jewelleryDetails.appraiser",
      "jewelleryDetails.selectedAppraiser",
    ],
    {},
  );
  const appraiserObject =
    appraiserSource && typeof appraiserSource === "object" ? appraiserSource : {};
  const appraisal = {
    status: selectValue(leadDetails, ["applicationDetail.details.jewelleryAppraisal.status", "applicationDetail.appraisal.status", "applicationDetail.jewelleryAppraisal.status"], application.status || "Awaiting Appraisal"),
    items: normalizeItems(jewelleryItems),
    appraiser: {
      name:
        appraiserObject.name ||
        appraiserObject.appraiserName ||
        (typeof appraiserSource === "string" ? appraiserSource : "") ||
        "Mohit Kumawat",
      email: appraiserObject.email || appraiserObject.appraiserEmail || "mohikumawat@deloitte.com",
      id: appraiserObject.id || appraiserObject.appraiserId || "APR-YES-0142",
      type: appraiserObject.type || appraiserObject.appraiserType || "Panel Jeweller",
      branch: appraiserObject.branch || appraiserObject.assignedBranch || loan.branch.name,
    },
    clarificationComment: selectValue(leadDetails, ["applicationDetail.details.jewelleryAppraisal.clarificationComment", "applicationDetail.appraisal.clarificationComment"], ""),
  };
  const eligibilitySource = application.eligibility || details.eligibilityRecommendation || support.eligibility || {};
  const makerSource = application.makerFinalisation || details.eligibilityRecommendation || {};
  const charges = application.charges || makerSource.charges || support.charges || {};
  const nominee = makerSource.nominee || support.nominee || {};
  const calculatedNetWeight = appraisal.items.reduce(
    (sum, item) => sum + netWeightFor(item),
    0,
  );
  const calculatedAppraisedValue = appraisal.items.reduce(
    (sum, item) => sum + appraisedValueFor(item),
    0,
  );
  const totalAppraisedValue =
    calculatedAppraisedValue || toNumber(eligibilitySource.schemeLendingValue) || 0;
  const applicableLtv = applicableLtvFor(totalAppraisedValue);
  const ltvBasedValue = Math.round((totalAppraisedValue * applicableLtv) / 100);
  const availableExposureLimit =
    toNumber(eligibilitySource.availableExposureLimit) || 3500000;
  const maximumEligibleAmount = Math.min(
    ltvBasedValue,
    totalAppraisedValue,
    availableExposureLimit,
  );
  const eligibility = {
    ibjaGoldRate: eligibilitySource.ibjaGoldRate || eligibilitySource.ibjaRate || 6950,
    schemePercentage: applicableLtv,
    lendingRatePerGram: eligibilitySource.schemeLendingRatePerGram || eligibilitySource.lendingRatePerGram || 5908,
    totalNetWeight: calculatedNetWeight || toNumber(eligibilitySource.totalNetWeight) || 0,
    schemeLendingValue: totalAppraisedValue,
    availableExposureLimit,
    ltvBasedValue,
    applicableLtv,
    maximumEligibleAmount,
    controllingLimit: eligibilitySource.controllingLimit || "Minimum of LTV value, appraised value and available exposure",
    requiredAmount: makerSource.requiredAmount || eligibilitySource.requiredAmount || 450000,
    recommendedAmount: makerSource.recommendedAmount || eligibilitySource.recommendedAmount || 440000,
    disbursementAccount: makerSource.disbursementAccount || loan.disbursementAccount || "",
    makerComments: makerSource.makerComments || makerSource.comments || "Recommended based on verified net weight and maximum applicable LTV.",
    eSignRequired:
      makerSource.eSignRequired === undefined
        ? true
        : Boolean(makerSource.eSignRequired),
    status: makerSource.status || "Pending",
    charges: {
      processingCharge: charges.processingCharge || 2200,
      appraiserCharge: charges.appraiserCharge || 500,
      gst: charges.gst || 486,
      otherCharges: charges.otherCharges || 0,
      totalCharges: charges.totalCharges || 3186,
      chargesAccount: charges.chargesAccount || loan.chargesAccount || "—",
    },
    nominee: {
      useSavingsNominee: Boolean(nominee.useSavingsNominee),
      name: nominee.name || "Anita Sharma",
      relationship: nominee.relationship || "Spouse",
      dateOfBirth: nominee.dateOfBirth || "1988-07-18",
      address: nominee.address || "Baner Road, Pune, Maharashtra 411045",
      guardianName: nominee.guardianName || "",
      guardianRelationship: nominee.guardianRelationship || "",
      guardianContact: nominee.guardianContact || "",
    },
    nominees: Array.isArray(makerSource.nominees) ? makerSource.nominees : [],
  };
  const checker = application.checkerDecision || details.checkerDecision || {};
  return { application, details, identity, facility, customer, loan, compliance, appraisal, eligibility, checker };
};

export default function ApplicationDetailsTab({
  leadId,
  lead,
  setLead,
  applicationNumber = "",
  loggedInUserEmail = "",
  loggedInUserName = "",
  persona = "Viewer",
  initialSection = "jewelleryAppraisal",
  requestedSection = "",
  leadApiBase = DEFAULT_LEAD_API_BASE,
  updateLeadDetails,
}) {
  const leadDetails = useMemo(
    () => parseLeadDetails(lead?.leadDetails ?? lead?.lead_details),
    [lead?.leadDetails, lead?.lead_details],
  );
  const routeApplicationNumber =
    typeof window !== "undefined"
      ? decodeURIComponent(window.location.pathname.split("/").filter(Boolean).pop() || "")
      : "";
  const resolvedApplicationNumber = String(
    applicationNumber ||
      lead?.applicationNumber ||
      selectValue(
        leadDetails,
        [
          "applicationNumber",
          "applicationDetail.applicationNumber",
          "applicationDetail.applicationId",
        ],
        routeApplicationNumber,
      ),
  ).toUpperCase();
  const resolvedLeadId = String(
    leadId ||
      lead?.leadId ||
      lead?.lead_id ||
      lead?.id ||
      lead?.leadNumber ||
      lead?.leadnumber ||
      selectValue(
        leadDetails,
        ["leadId", "lead_id", "leadNumber", "applicationDetail.leadId"],
        routeApplicationNumber.startsWith("LD-") ? routeApplicationNumber : "",
      ),
  ).toUpperCase();
  const demoWorkflow =
    DEMO_LEAD_WORKFLOWS[resolvedLeadId] ||
    DEMO_APPLICATION_WORKFLOWS[resolvedApplicationNumber] ||
    null;
  const view = useMemo(() => {
    const baseView = buildView(leadDetails, lead);
    if (
      !demoWorkflow ||
      (!demoWorkflow.force && hasValue(baseView.application.status))
    ) {
      return baseView;
    }

    return {
      ...baseView,
      application: {
        ...baseView.application,
        stage: "APPRAISAL_ELIGIBILITY",
        status: demoWorkflow.applicationStatus,
        assignedPersona: demoWorkflow.persona,
        currentOwner:
          demoWorkflow.persona === "Checker" ? "Branch Checker" : "Branch Maker",
        assignment: {
          ...(baseView.application.assignment || {}),
          persona: demoWorkflow.persona,
          currentOwner:
            demoWorkflow.persona === "Checker" ? "Branch Checker" : "Branch Maker",
        },
      },
      appraisal: {
        ...baseView.appraisal,
        status: demoWorkflow.appraisalStatus,
        appraiser: {
          ...baseView.appraisal.appraiser,
          name: baseView.appraisal.appraiser.name || demoWorkflow.appraiserName,
        },
        items: baseView.appraisal.items.map((item) => ({
          ...item,
          appraisal: {
            ...item.appraisal,
            status: demoWorkflow.appraisalStatus,
            appraisedBy:
              item.appraisal.appraisedBy || {
                name: demoWorkflow.appraiserName,
                role: "Jeweller / Appraiser",
              },
          },
        })),
      },
      eligibility: {
        ...baseView.eligibility,
        status: demoWorkflow.eligibilityStatus,
      },
      checker: {
        ...baseView.checker,
        status:
          demoWorkflow.persona === "Checker"
            ? demoWorkflow.force
              ? "Pending Review"
              : baseView.checker.status || "Pending Review"
            : baseView.checker.status,
      },
    };
  }, [demoWorkflow, leadDetails, lead]);
  const mappedUser = userForEmail(loggedInUserEmail);
  const normalizedPersona = normalizePersona(
    demoWorkflow?.force
      ? demoWorkflow.persona
      : mappedUser?.persona ||
          (normalizePersona(persona) !== "Viewer" ? persona : demoWorkflow?.persona),
  );
  const preferredInitialSection =
    demoWorkflow?.section || requestedSection || initialSection;
  const [activeSection, setActiveSection] = useState(
    SECTIONS.some((section) => section.id === normalizeSection(preferredInitialSection))
      ? normalizeSection(preferredInitialSection)
      : "jewelleryAppraisal",
  );
  const [expandedItemId, setExpandedItemId] = useState("");
  const [appraisalItems, setAppraisalItems] = useState(view.appraisal.items);
  const [clarificationComment, setClarificationComment] = useState(view.appraisal.clarificationComment);
  const [makerDraft, setMakerDraft] = useState({
    requiredAmount: view.eligibility.requiredAmount,
    recommendedAmount: view.eligibility.recommendedAmount,
    disbursementAccount: view.eligibility.disbursementAccount,
    makerComments: view.eligibility.makerComments,
    eSignRequired: view.eligibility.eSignRequired,
    nominee: view.eligibility.nominee,
    nominees: view.eligibility.nominees,
  });
  const [checkerDraft, setCheckerDraft] = useState({
    comments: view.checker.comments || "",
    pushbackSection: view.checker.pushbackSection || "Eligibility & Recommendation",
    pushbackReason: view.checker.pushbackReason || "",
    rejectionReason: view.checker.rejectionReason || "",
  });
  const [checkerDecisionMode, setCheckerDecisionMode] = useState(() => {
    const existingDecision = String(view.checker.decision || "").toLowerCase();
    if (existingDecision.includes("push")) return "pushback";
    if (existingDecision.includes("reject")) return "reject";
    return "approve";
  });
  const [saveState, setSaveState] = useState("idle");
  const [saveError, setSaveError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const initializedSectionRef = useRef(false);
  const autoSaveTimerRef = useRef(null);
  const lastAutoSaveRef = useRef("");
  const autoSaveReadyRef = useRef(false);

  useEffect(() => {
    setAppraisalItems(view.appraisal.items);
    setClarificationComment(view.appraisal.clarificationComment);
    if (!expandedItemId && view.appraisal.items.length) setExpandedItemId(view.appraisal.items[0].id);
  }, [view.appraisal.items, view.appraisal.clarificationComment]);

  useEffect(() => {
    setMakerDraft({
      requiredAmount: view.eligibility.requiredAmount,
      recommendedAmount: view.eligibility.recommendedAmount,
      disbursementAccount: view.eligibility.disbursementAccount,
      makerComments: view.eligibility.makerComments,
      eSignRequired: view.eligibility.eSignRequired,
      nominee: view.eligibility.nominee,
      nominees: view.eligibility.nominees,
    });
  }, [view.eligibility]);

  useEffect(() => {
    if (demoWorkflow?.force) {
      setActiveSection(demoWorkflow.section);
      initializedSectionRef.current = true;
      return;
    }
    const requested = normalizeSection(requestedSection);
    if (requested && SECTIONS.some((section) => section.id === requested)) {
      setActiveSection(requested);
      initializedSectionRef.current = true;
      return;
    }
    if (initializedSectionRef.current) return;
    if (normalizedPersona === "Appraiser") {
      setActiveSection("jewelleryAppraisal");
    } else if (normalizedPersona === "Maker") {
      const pushbackSection = normalizeSection(view.application.pushback?.section);
      setActiveSection(
        SECTIONS.some((section) => section.id === pushbackSection)
          ? pushbackSection
          : "eligibilityRecommendation",
      );
    } else if (normalizedPersona === "Checker") {
      setActiveSection("checkerDecision");
    } else if (demoWorkflow) {
      setActiveSection(demoWorkflow.section);
    }
    initializedSectionRef.current = true;
  }, [demoWorkflow, normalizedPersona, requestedSection, view.application]);

  const assignmentPersona = normalizePersona(
    view.application.assignment?.persona || view.application.assignedPersona || "",
  );
  const assignmentMatches = (role) => assignmentPersona === role;
  const statusText = String(view.application.status || "").toLowerCase();
  const appraisalStatusText = String(view.appraisal.status || "").toLowerCase();
  const eligibilityStatusText = String(view.eligibility.status || "").toLowerCase();
  const appraiserCanEdit =
    normalizedPersona === "Appraiser" &&
    !/completed|sanctioned|rejected|disbursed/.test(appraisalStatusText) &&
    (/apprais|clarification|rework|awaiting/.test(statusText) || assignmentMatches("Appraiser"));
  const makerCanEdit =
    normalizedPersona === "Maker" &&
    !/pending checker|sanctioned|rejected|disbursed/.test(statusText) &&
    (/maker|rework|clarification/.test(statusText) ||
      (/completed/.test(appraisalStatusText) && assignmentMatches("Maker")));
  const checkerCanEdit =
    normalizedPersona === "Checker" &&
    (/checker|sanction/.test(statusText) ||
      (/submitted/.test(eligibilityStatusText) && assignmentMatches("Checker"))) &&
    !/sanctioned|rejected/.test(statusText);
  // Every workflow section remains visible. Edit controls are independently
  // gated above so only the assigned role can change its active work item.
  const visibleSections = SECTIONS;

  const actor = useMemo(
    () => ({
      name: loggedInUserName || mappedUser?.name || loggedInUserEmail.split("@")[0] || normalizedPersona,
      email: loggedInUserEmail,
      role: normalizedPersona,
    }),
    [loggedInUserEmail, loggedInUserName, mappedUser?.name, normalizedPersona],
  );

  const appendEvent = useCallback(
    (applicationDetail, event) => {
      const now = new Date().toISOString();
      const currentActivity = applicationDetail.activity || {};
      const nextEvent = {
        id: `ACT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: event.type || "data_update",
        title: event.title || "Application details updated",
        description: event.description || "",
        stage: event.stage || applicationDetail.stage || "Appraisal & Eligibility",
        section: event.section || "Application Details",
        fromStatus: event.fromStatus || applicationDetail.status || "",
        toStatus: event.toStatus || applicationDetail.status || "",
        actor,
        comments: event.comments || "",
        createdAt: now,
        metadata: event.metadata || {},
      };
      return {
        ...applicationDetail,
        activity: {
          ...currentActivity,
          events: [nextEvent, ...(Array.isArray(currentActivity.events) ? currentActivity.events : [])],
          lastUpdatedAt: now,
        },
        updatedAt: now,
      };
    },
    [actor],
  );

  const commitUpdate = useCallback(
    async (applicationUpdater, activityEvent, immediate = true) => {
      setSaveState("saving");
      setSaveError("");
      try {
        const buildNext = (currentLeadDetails) => {
          const currentApplication = currentLeadDetails.applicationDetail || {};
          const updatedApplication = applicationUpdater(clone(currentApplication), currentLeadDetails);
          const updatedDetails = updatedApplication.details || {};
          const appraisalNode =
            updatedDetails.jewelleryAppraisal || updatedApplication.appraisal || {};
          const persistedItems = Array.isArray(appraisalNode.items) && appraisalNode.items.length
            ? appraisalNode.items
            : [];
          const applicationWithDefaults = {
            ...updatedApplication,
            details: {
              ...updatedDetails,
              jewelleryAppraisal: { ...appraisalNode, items: persistedItems },
            },
            appraisal: { ...appraisalNode, items: persistedItems },
          };
          return {
            ...currentLeadDetails,
            applicationDetail: appendEvent(applicationWithDefaults, activityEvent),
          };
        };

        const nextLeadDetails = buildNext(clone(leadDetails));
        setLead?.((previousLead) => ({
          ...(previousLead || {}),
          leadDetails: nextLeadDetails,
          lead_details: JSON.stringify(nextLeadDetails),
        }));

        if (typeof updateLeadDetails === "function") {
          await Promise.resolve(updateLeadDetails(() => nextLeadDetails, immediate));
        } else {
          const leadIdentity = leadId || lead?.id || lead?.leadnumber;
          if (!leadIdentity) throw new Error("Lead ID is unavailable.");
          const response = await fetch(
            `${leadApiBase}/${encodeURIComponent(leadIdentity)}/details`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ leadId: leadIdentity, leadDetailsPatch: nextLeadDetails }),
            },
          );
          if (!response.ok) throw new Error(`Unable to save Application Details (${response.status}).`);
        }
        setSaveState("saved");
        return true;
      } catch (error) {
        console.error("Unable to save Application Details:", error);
        setSaveState("error");
        setSaveError(error.message || "Unable to save Application Details.");
        return false;
      }
    },
    [appendEvent, lead, leadApiBase, leadDetails, leadId, setLead, updateLeadDetails],
  );

  const updateAppraisalItem = (itemId, field, value) => {
    setAppraisalItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? { ...item, appraisal: { ...item.appraisal, [field]: value } }
          : item,
      ),
    );
    setValidationErrors((current) => ({ ...current, [`${itemId}.${field}`]: "" }));
  };

  useEffect(() => {
    const draftKey = JSON.stringify({ appraisalItems, makerDraft, checkerDraft });
    // The initial values are loaded from leadDetails. Never PATCH that first
    // render back as a draft, as it can overwrite a just-completed appraisal.
    if (!autoSaveReadyRef.current) {
      autoSaveReadyRef.current = true;
      lastAutoSaveRef.current = draftKey;
      return;
    }
    if (lastAutoSaveRef.current === draftKey) return;
    lastAutoSaveRef.current = draftKey;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      commitUpdate(
        (application) => {
          const details = application.details || {};
          const appraisalNode = {
            ...(details.jewelleryAppraisal || application.appraisal || {}),
            items: appraisalItems.map((item) => ({ ...item, appraisal: { ...item.appraisal, netWeight: netWeightFor(item), lendingRatePerGram: lendingRateFor(item), appraisedValue: appraisedValueFor(item) } })),
            totalAppraisedValue: appraisalItems.reduce((sum, item) => sum + appraisedValueFor(item), 0),
            lastSavedAt: new Date().toISOString(),
          };
          const eligibilityNode = { ...(details.eligibilityRecommendation || application.makerFinalisation || {}), ...makerDraft, lastSavedAt: new Date().toISOString() };
          const checkerNode = { ...(details.checkerDecision || application.checkerDecision || {}), ...checkerDraft, lastSavedAt: new Date().toISOString() };
          return { ...application, details: { ...details, jewelleryAppraisal: appraisalNode, eligibilityRecommendation: eligibilityNode, checkerDecision: checkerNode }, appraisal: appraisalNode, makerFinalisation: eligibilityNode, checkerDecision: checkerNode };
        },
        { type: "draft_autosave", title: "Application details draft saved", description: "Latest changes were saved automatically.", section: "Application Details" },
        false,
      );
    }, 600);
    return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current); };
  }, [appraisalItems, makerDraft, checkerDraft, commitUpdate]);

  const handleReplacementImage = (itemId, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAppraisalItems((current) =>
        current.map((item) =>
          item.id === itemId
            ? {
                ...item,
                jewelImage: {
                  type: file.type,
                  dataUrl: reader.result,
                  size: file.size,
                  name: file.name,
                  uploadedAt: new Date().toISOString(),
                },
                appraisal: { ...item.appraisal, jewelleryMatchesImage: false },
              }
            : item,
        ),
      );
      setValidationErrors((current) => ({
        ...current,
        [`${itemId}.jewelImage`]: "",
        [`${itemId}.jewelleryMatchesImage`]: "",
      }));
    };
    reader.readAsDataURL(file);
  };

  const weightSummary = useMemo(() => {
    const totals = Object.keys(WEIGHT_LIMITS).reduce((result, key) => ({ ...result, [key]: 0 }), {});
    appraisalItems.forEach((item) => {
      totals[getCategoryKey(item)] += netWeightFor(item);
    });
    return Object.entries(WEIGHT_LIMITS).map(([key, config]) => ({
      key,
      ...config,
      total: Number(totals[key].toFixed(2)),
      exceeded: totals[key] > config.limit,
    }));
  }, [appraisalItems]);
  const relevantWeightSummary = weightSummary.filter(
    (item) => item.total > 0 || item.key === "goldOrnament" || item.key === "goldCoin",
  );

  // Simple validation safeguard for non-negative values
  const validateAppraisal = () => {
    const errors = {};
    appraisalItems.forEach((item) => {
      if (!item.appraisal.purity) errors[`${item.id}.purity`] = "Select quality/purity.";
      if (!(toNumber(item.appraisal.grossWeight) > 0)) errors[`${item.id}.grossWeight`] = "Enter a valid gross weight.";
      
      const gross = toNumber(item.appraisal.grossWeight) || 0;
      const deductions = deductionTotalFor(item);
      if (gross > 0 && deductions >= gross) {
        errors[`${item.id}.grossWeight`] = "Total deductions must be lower than the gross weight.";
      }
      if (
        toNumber(item.appraisal.stoneDeduction) < 0 ||
        toNumber(item.appraisal.alloyDeduction) < 0 ||
        toNumber(item.appraisal.fasteningDeduction) < 0 ||
        toNumber(item.appraisal.otherDeduction) < 0
      ) {
        errors[`${item.id}.grossWeight`] = "Deductions cannot be negative values.";
      }
      
      if (item.appraisal.defectPresent === "Yes" && !item.appraisal.defectDescription.trim()) errors[`${item.id}.defectDescription`] = "Describe the defect.";
      if (!item.jewelImage?.dataUrl) errors[`${item.id}.jewelImage`] = "A jewellery image is required.";
      if (!item.appraisal.jewelleryMatchesImage) errors[`${item.id}.jewelleryMatchesImage`] = "Confirm that the jewellery is as per the image.";
    });
    if (!appraisalItems.length) errors.items = "No jewellery items are available for appraisal.";
    if (weightSummary.some((item) => item.exceeded)) errors.weightLimit = "Borrower-level weight policy is exceeded.";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const persistAppraisal = async (action) => {
    if (!appraiserCanEdit) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    if (action === "complete" && !validateAppraisal()) return;
    if (action === "clarification" && !clarificationComment.trim()) {
      setValidationErrors((current) => ({ ...current, clarification: "Enter the clarification required." }));
      return;
    }
    const now = new Date().toISOString();
    const completedItems = appraisalItems.map((item) => ({
      ...item,
      appraisal: {
        ...item.appraisal,
        netWeight: netWeightFor(item),
        lendingRatePerGram: lendingRateFor(item),
        appraisedValue: appraisedValueFor(item),
        status: action === "complete" ? "Completed" : item.appraisal.status === "Pending" ? "In Progress" : item.appraisal.status,
        appraisedBy: actor,
        appraisedAt: action === "complete" ? now : item.appraisal.appraisedAt,
      },
    }));
    const totalNetWeight = completedItems
      .filter((item) => ["goldOrnament", "goldCoin"].includes(getCategoryKey(item)))
      .reduce((sum, item) => sum + netWeightFor(item), 0);
    const totalAppraisedValue = completedItems.reduce((sum, item) => sum + appraisedValueFor(item), 0);
    const statusMap = {
      start: "Appraisal In Progress",
      save: "Appraisal In Progress",
      clarification: "Clarification Required",
      complete: "Completed",
    };
    const applicationStatusMap = {
      start: "Appraisal In Progress",
      save: "Appraisal In Progress",
      clarification: "Rework Required",
      complete: "Pending Maker Finalisation",
    };
    const descriptionMap = {
      start: "Jewellery appraisal was started.",
      save: `${completedItems.length} jewellery item drafts were saved.`,
      clarification: clarificationComment.trim(),
      complete: `${completedItems.length} items completed with ${formatWeight(totalNetWeight)} eligible gold net weight.`,
    };
    const success = await commitUpdate(
      (application) => {
        const details = application.details || {};
        const appraisalNode = {
          ...(details.jewelleryAppraisal || application.appraisal || {}),
          status: statusMap[action],
          items: completedItems,
          totalNetWeight: Number(totalNetWeight.toFixed(2)),
          totalAppraisedValue,
          weightSummary,
          weightPolicyStatus: weightSummary.some((item) => item.exceeded) ? "Exceeded" : "Within limit",
          clarificationComment: action === "clarification" ? clarificationComment.trim() : "",
          appraiser: actor,
          startedAt: action === "start" ? now : details.jewelleryAppraisal?.startedAt || application.appraisal?.startedAt,
          completedAt: action === "complete" ? now : null,
          lastSavedAt: now,
        };
        const nextAssignment =
          action === "complete" || action === "clarification"
            ? { ...(application.assignment || {}), persona: "Maker", currentOwner: "Branch Maker", assignedAt: now }
            : { ...(application.assignment || {}), persona: "Appraiser", currentOwner: actor.name, assignedAt: application.assignment?.assignedAt || now };
        return {
          ...application,
          status: applicationStatusMap[action],
          stage: "APPRAISAL_ELIGIBILITY",
          assignment: nextAssignment,
          assignedPersona: nextAssignment.persona,
          currentOwner: nextAssignment.currentOwner,
          details: { ...details, jewelleryAppraisal: appraisalNode },
          appraisal: appraisalNode,
          checklist: {
            ...(application.checklist || {}),
            jewelleryAppraisal: action === "complete" ? "Completed" : action === "clarification" ? "Blocked" : "In progress",
          },
          pushback:
            action === "clarification"
              ? { section: "Jewellery Appraisal", reason: clarificationComment.trim(), assignedTo: "Maker", createdAt: now, createdBy: actor }
              : application.pushback,
        };
      },
      {
        type: `appraisal_${action}`,
        title: action === "complete" ? "Jewellery appraisal completed" : action === "clarification" ? "Appraisal clarification requested" : action === "start" ? "Jewellery appraisal started" : "Jewellery appraisal saved",
        description: descriptionMap[action],
        section: "Jewellery Appraisal",
        toStatus: applicationStatusMap[action],
        metadata: { itemCount: completedItems.length, totalNetWeight, totalAppraisedValue },
      },
      action !== "save",
    );
    if (success && action === "complete") setValidationErrors({});
  };

  const nomineeAge = useMemo(() => {
    if (!makerDraft.nominee.dateOfBirth) return null;
    const dob = new Date(makerDraft.nominee.dateOfBirth);
    if (Number.isNaN(dob.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const month = today.getMonth() - dob.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < dob.getDate())) age -= 1;
    return age;
  }, [makerDraft.nominee.dateOfBirth]);

  const validateMaker = (submit) => {
    const errors = {};
    const required = toNumber(makerDraft.requiredAmount);
    const recommended = toNumber(makerDraft.recommendedAmount);
    const maximum = toNumber(view.eligibility.maximumEligibleAmount);
    if (!(required > 0)) errors.requiredAmount = "Enter the required loan amount.";
    if (maximum !== null && required > maximum) errors.requiredAmount = "Required amount cannot exceed maximum eligibility.";
    if (!(recommended > 0)) errors.recommendedAmount = "Enter the recommended amount.";
    if (recommended > required) errors.recommendedAmount = "Recommended amount cannot exceed the required amount.";
    if (maximum !== null && recommended > maximum) errors.recommendedAmount = "Recommended amount cannot exceed maximum eligibility.";
    const isOverdraft = String(view.loan.repaymentType || view.loan.facilityType).toLowerCase().includes("overdraft");
    if (!isOverdraft && !makerDraft.disbursementAccount) errors.disbursementAccount = "Select an active CASA account.";
    if (submit && !makerDraft.nominee.name.trim()) errors.nomineeName = "Enter nominee name.";
    if (submit && !makerDraft.nominee.relationship) errors.nomineeRelationship = "Select relationship.";
    if (submit && !makerDraft.nominee.dateOfBirth) errors.nomineeDob = "Enter nominee date of birth.";
    if (nomineeAge !== null && (nomineeAge < 0 || nomineeAge > 120)) {
      errors.nomineeDob = "Enter a valid nominee date of birth.";
    }
    if (nomineeAge !== null && nomineeAge < 18 && !makerDraft.nominee.guardianName.trim()) errors.guardianName = "Guardian details are required for a minor nominee.";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const persistMaker = async (submit) => {
    if (!makerCanEdit || !validateMaker(submit)) return;
    const now = new Date().toISOString();
    const isMinor = nomineeAge !== null && nomineeAge < 18;
    const status = submit ? "Submitted to Checker" : "Draft";
    await commitUpdate(
      (application) => {
        const details = application.details || {};
        const makerNode = {
          ...(details.eligibilityRecommendation || application.makerFinalisation || {}),
          ...makerDraft,
          requiredAmount: toNumber(makerDraft.requiredAmount),
          recommendedAmount: toNumber(makerDraft.recommendedAmount),
          nominee: { ...makerDraft.nominee, isMinor },
          status,
          submittedAt: submit ? now : null,
          submittedBy: submit ? actor : null,
          lastSavedAt: now,
        };
        const assignment = submit
          ? { ...(application.assignment || {}), persona: "Checker", currentOwner: "Branch Checker", assignedAt: now }
          : application.assignment;
        return {
          ...application,
          status: submit ? "Pending Checker Review" : application.status,
          stage: submit ? "CHECKER_SANCTION" : application.stage,
          assignment,
          assignedPersona: submit ? "Checker" : application.assignedPersona,
          currentOwner: submit ? "Branch Checker" : application.currentOwner,
          details: { ...details, eligibilityRecommendation: makerNode },
          makerFinalisation: makerNode,
          checklist: { ...(application.checklist || {}), makerRecommendation: submit ? "Completed" : "In progress" },
          pushback: submit ? null : application.pushback,
        };
      },
      {
        type: submit ? "maker_submission" : "maker_draft",
        title: submit ? "Maker recommendation submitted" : "Maker recommendation saved",
        description: submit
          ? `${formatCurrency(makerDraft.recommendedAmount)} recommended to the Branch Checker.`
          : "Eligibility and recommendation changes were saved as draft.",
        section: "Eligibility & Recommendation",
        toStatus: submit ? "Pending Checker Review" : view.application.status,
      },
      submit,
    );
  };

  const persistCheckerDecision = async (decision) => {
    if (!checkerCanEdit) return;
    const errors = {};
    if (!checkerDraft.comments.trim()) errors.checkerComments = "Enter decision comments.";
    if (decision === "pushback" && !checkerDraft.pushbackReason.trim()) errors.pushbackReason = "Enter the required correction or clarification.";
    if (decision === "reject" && !checkerDraft.rejectionReason.trim()) errors.rejectionReason = "Select or enter a rejection reason.";
    setValidationErrors(errors);
    if (Object.keys(errors).length) return;
    const now = new Date().toISOString();
    const isAppraisalPushback = normalizeSection(checkerDraft.pushbackSection) === "jewelleryAppraisal";
    const decisionConfig = {
      approve: { status: "Sanctioned", stage: "DOCUMENTATION_DISBURSEMENT", persona: "Maker", owner: "Branch Maker" },
      pushback: { status: "Rework Required", stage: "APPRAISAL_ELIGIBILITY", persona: isAppraisalPushback ? "Appraiser" : "Maker", owner: isAppraisalPushback ? "Assigned Appraiser" : "Branch Maker" },
      reject: { status: "Rejected", stage: "EXIT", persona: "", owner: "Closed" },
    }[decision];
    await commitUpdate(
      (application) => {
        const details = application.details || {};
        const checkerNode = {
          ...(details.checkerDecision || application.checkerDecision || {}),
          decision: decision === "approve" ? "Approved" : decision === "pushback" ? "Push Back" : "Rejected",
          isSanctioned: decision === "approve",
          status: decisionConfig.status,
          comments: checkerDraft.comments.trim(),
          pushbackSection: decision === "pushback" ? checkerDraft.pushbackSection : "",
          pushbackReason: decision === "pushback" ? checkerDraft.pushbackReason.trim() : "",
          rejectionReason: decision === "reject" ? checkerDraft.rejectionReason.trim() : "",
          decidedAt: now,
          decidedBy: actor,
          cbsLoanAccountReference:
            decision === "approve"
              ? application.checkerDecision?.cbsLoanAccountReference || `GL-${Date.now()}`
              : null,
          sanction:
            decision === "approve"
              ? {
                  status: "Sanctioned",
                  amount: application.makerFinalisation?.recommendedAmount,
                  sanctionedAt: now,
                  sanctionedBy: actor,
                }
              : { status: "Not Sanctioned" },
        };
        return {
          ...application,
          status: decisionConfig.status,
          stage: decisionConfig.stage,
          assignment: { ...(application.assignment || {}), persona: decisionConfig.persona, currentOwner: decisionConfig.owner, assignedAt: now },
          assignedPersona: decisionConfig.persona,
          currentOwner: decisionConfig.owner,
          details: { ...details, checkerDecision: checkerNode },
          checkerDecision: checkerNode,
          checklist: { ...(application.checklist || {}), checkerSanction: decision === "approve" ? "Completed" : decision === "reject" ? "Rejected" : "Blocked" },
          pushback:
            decision === "pushback"
              ? { section: checkerDraft.pushbackSection, reason: checkerDraft.pushbackReason.trim(), assignedTo: decisionConfig.persona, createdAt: now, createdBy: actor }
              : null,
          documentationDisbursement:
            decision === "approve"
              ? { ...(application.documentationDisbursement || {}), status: "Pending Document Generation", sanction: { amount: application.makerFinalisation?.recommendedAmount, sanctionedAt: now, checker: actor, cbsLoanAccountReference: checkerNode.cbsLoanAccountReference } }
              : application.documentationDisbursement,
        };
      },
      {
        type: `checker_${decision}`,
        title: decision === "approve" ? "Application approved and sanctioned" : decision === "pushback" ? "Application pushed back" : "Application rejected",
        description: decision === "pushback" ? checkerDraft.pushbackReason.trim() : decision === "reject" ? checkerDraft.rejectionReason.trim() : checkerDraft.comments.trim(),
        section: "Checker Decision",
        toStatus: decisionConfig.status,
      },
      true,
    );
  };

  const sectionStatus = (id) => {
    if (id === "customerKyc") return view.customer.kycStatus;
    if (id === "loanBranch") return hasValue(view.loan.requestedAmount) ? "Completed" : "Pending";
    if (id === "compliance") {
      const requiredStatuses = [];
      if (String(view.compliance.cibilRequired).toLowerCase() === "true") requiredStatuses.push(view.compliance.cibilStatus);
      if (String(view.compliance.landRequired).toLowerCase() === "true") requiredStatuses.push(view.compliance.landStatus);
      return requiredStatuses.some((item) => statusTone(item) !== "success") ? "Pending" : "Completed";
    }
    if (id === "jewelleryAppraisal") return view.appraisal.status;
    if (id === "eligibilityRecommendation") return view.eligibility.status;
    return view.checker.status || view.checker.decision || "Pending";
  };

  const renderAppraisal = () => {
    const totalNetWeight = appraisalItems.reduce(
      (sum, item) => sum + netWeightFor(item),
      0,
    );
    const totalAppraisedValue = appraisalItems.reduce(
      (sum, item) => sum + appraisedValueFor(item),
      0,
    );
    const completedItems = appraisalItems.filter(
      (item) => statusTone(item.appraisal.status) === "success",
    ).length;

    return (
      <section className="details-section appraisal-section">
        <SectionHeading
          eyebrow="Step 1 of 3 · Collateral assessment"
          title="Jewellery appraisal"
          description="Verify each ornament against the supplied image, record deductions and confirm its lendable value."
          status={view.appraisal.status}
          editable={appraiserCanEdit}
        />

        <div className="section-summary-grid" aria-label="Appraisal summary">
          <article>
            <small>Items assessed</small>
            <strong>{completedItems} of {appraisalItems.length}</strong>
          </article>
          <article>
            <small>Total net weight</small>
            <strong>{formatWeight(totalNetWeight)}</strong>
          </article>
          <article className="is-featured">
            <small>Total appraised value</small>
            <strong>{formatCurrency(totalAppraisedValue)}</strong>
          </article>
          <article>
            <small>Weight policy</small>
            <strong>{weightSummary.some((item) => item.exceeded) ? "Limit exceeded" : "Within limit"}</strong>
          </article>
        </div>

        <div className="assignment-strip" aria-label="Assigned appraiser">
          <span className="assignment-strip__icon"><Icon type="jewellery" /></span>
          <div>
            <small>Assigned appraiser</small>
            <strong>Anant Deshmukh</strong>
            <span>{view.appraisal.appraiser.id} · {view.appraisal.appraiser.type} · {view.appraisal.appraiser.branch}</span>
          </div>
        </div>

        <div className="weight-policy-grid" aria-label="Borrower weight limits">
          {relevantWeightSummary.map((item) => (
            <article key={item.key} className={item.exceeded ? "is-exceeded" : ""}>
              <div>
                <p>{item.label}</p>
                <strong>{formatWeight(item.total)} <span>of {formatWeight(item.limit)}</span></strong>
              </div>
              <div className="weight-progress" aria-hidden="true">
                <i style={{ width: `${Math.min(100, (item.total / item.limit) * 100)}%` }} />
              </div>
            </article>
          ))}
        </div>

        {validationErrors.weightLimit && <div className="details-validation-banner"><Icon type="alert" />{validationErrors.weightLimit}</div>}
        {validationErrors.items && <div className="details-validation-banner"><Icon type="alert" />{validationErrors.items}</div>}

        <div className="content-heading">
          <div><h4>Ornaments received</h4><p>Select an item to review its evidence and assessment.</p></div>
          <span>{appraisalItems.length} item{appraisalItems.length === 1 ? "" : "s"}</span>
        </div>

        <div className="appraisal-item-list">
          {appraisalItems.map((item) => {
            const expanded = expandedItemId === item.id;
            const netWeight = netWeightFor(item);
            const imageError =
              validationErrors[`${item.id}.jewelImage`] ||
              validationErrors[`${item.id}.jewelleryMatchesImage`];

            return (
              <article key={item.id} className={`appraisal-item ${expanded ? "is-expanded" : ""}`}>
                <button
                  type="button"
                  className="appraisal-item__header"
                  onClick={() => setExpandedItemId(expanded ? "" : item.id)}
                  aria-expanded={expanded}
                >
                  <span className="item-number">{String(item.serialNumber).padStart(2, "0")}</span>
                  <span className="item-title">
                    <strong>{item.description}</strong>
                    <small>{item.category} · Quantity {item.itemCount}</small>
                  </span>
                  <span className="item-weight"><small>Net weight</small><strong>{formatWeight(netWeight)}</strong></span>
                  <span className="item-weight"><small>Appraised value</small><strong>{formatCurrency(appraisedValueFor(item))}</strong></span>
                  <Status value={item.appraisal.status} />
                  <span className="item-chevron"><Icon type="chevron" /></span>
                </button>

                {expanded && (
                  <div className="appraisal-item__body">
                    <section className="review-block">
                      <div className="content-heading compact">
                        <div><h4>Collateral received</h4><p>Information captured by the Maker.</p></div>
                      </div>
                      <ReadOnlyGrid columns={3} fields={[
                        { label: "Description", value: item.description },
                        { label: "Quantity", value: item.itemCount },
                        { label: "Category", value: item.category },
                        { label: "Ownership declaration", value: item.ownershipDeclaration },
                        { label: "Ownership proof", value: item.ownershipProof?.name || item.ownershipProof || "Not uploaded" },
                        { label: "Maker remarks", value: item.makerRemarks || "—", wide: true },
                      ]} />
                    </section>

                    <div className="appraisal-detail-grid">
                      <section className={`evidence-panel ${imageError ? "has-error" : ""}`}>
                        <div className="content-heading compact">
                          <div><h4>Image verification</h4><p>Compare the presented ornament with the customer image.</p></div>
                        </div>
                        {item.jewelImage?.dataUrl ? (
                          <figure className="jewellery-evidence">
                            <img src={item.jewelImage.dataUrl} alt={item.jewelImage.name || `${item.description} uploaded by customer`} />
                            <figcaption>
                              <strong>{item.jewelImage.name || "Jewellery image"}</strong>
                              <span>{item.jewelImage.type || "Image"}{item.jewelImage.size ? ` · ${Math.ceil(item.jewelImage.size / 1024)} KB` : ""}</span>
                              {item.jewelImage.uploadedAt && <small>Uploaded {formatDate(item.jewelImage.uploadedAt)}</small>}
                            </figcaption>
                          </figure>
                        ) : (
                          <div className="jewellery-image-empty"><Icon type="alert" /><span>No customer image is available.</span></div>
                        )}

                        {appraiserCanEdit ? (
                          <>
                            <label className="replace-image-button">
                              <Icon type="upload" />
                              {item.jewelImage?.dataUrl ? "Replace image" : "Upload image"}
                              <input type="file" accept="image/*" capture="environment" onChange={(event) => handleReplacementImage(item.id, event.target.files?.[0])} />
                            </label>
                            <label className="image-match-check">
                              <input
                                type="checkbox"
                                disabled={!item.jewelImage?.dataUrl}
                                checked={Boolean(item.appraisal.jewelleryMatchesImage)}
                                onChange={(event) => updateAppraisalItem(item.id, "jewelleryMatchesImage", event.target.checked)}
                              />
                              <span>Jewellery matches the uploaded image</span>
                            </label>
                          </>
                        ) : (
                          <div className={`verification-result ${item.appraisal.jewelleryMatchesImage ? "is-verified" : ""}`}>
                            <Icon type={item.appraisal.jewelleryMatchesImage ? "check" : "alert"} />
                            {item.appraisal.jewelleryMatchesImage ? "Image match confirmed" : "Image match not confirmed"}
                          </div>
                        )}
                        {validationErrors[`${item.id}.jewelImage`] && <small className="field-error">{validationErrors[`${item.id}.jewelImage`]}</small>}
                        {validationErrors[`${item.id}.jewelleryMatchesImage`] && <small className="field-error">{validationErrors[`${item.id}.jewelleryMatchesImage`]}</small>}
                      </section>

                      <section className="assessment-panel">
                        <div className="content-heading compact">
                          <div><h4>Appraiser assessment</h4><p>{appraiserCanEdit ? "Enter only the measured and observed values." : "Recorded assessment and derived values."}</p></div>
                        </div>

                        {appraiserCanEdit ? (
                          <>
                            <div className="details-form-grid columns-2">
                              <Field label="Quality / purity" required error={validationErrors[`${item.id}.purity`]}>
                                <select value={item.appraisal.purity} onChange={(event) => updateAppraisalItem(item.id, "purity", event.target.value)}>
                                  <option value="">Select purity</option>
                                  {PURITY_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                                </select>
                              </Field>
                              <Field label="Gross weight (g)" required error={validationErrors[`${item.id}.grossWeight`]}>
                                <input type="number" inputMode="decimal" min="0" step="0.01" value={item.appraisal.grossWeight} onChange={(event) => updateAppraisalItem(item.id, "grossWeight", event.target.value)} />
                              </Field>
                              <Field label="Stone deduction (g)"><input type="number" inputMode="decimal" min="0" step="0.01" value={item.appraisal.stoneDeduction} onChange={(event) => updateAppraisalItem(item.id, "stoneDeduction", event.target.value)} /></Field>
                              <Field label="Alloy deduction (g)"><input type="number" inputMode="decimal" min="0" step="0.01" value={item.appraisal.alloyDeduction} onChange={(event) => updateAppraisalItem(item.id, "alloyDeduction", event.target.value)} /></Field>
                              <Field label="String / fastening (g)"><input type="number" inputMode="decimal" min="0" step="0.01" value={item.appraisal.fasteningDeduction} onChange={(event) => updateAppraisalItem(item.id, "fasteningDeduction", event.target.value)} /></Field>
                              <Field label="Other deductions (g)"><input type="number" inputMode="decimal" min="0" step="0.01" value={item.appraisal.otherDeduction} onChange={(event) => updateAppraisalItem(item.id, "otherDeduction", event.target.value)} /></Field>
                              <Field label="Defect present" required>
                                <select value={item.appraisal.defectPresent} onChange={(event) => updateAppraisalItem(item.id, "defectPresent", event.target.value)}><option>No</option><option>Yes</option></select>
                              </Field>
                              {item.appraisal.defectPresent === "Yes" && (
                                <Field label="Defect description" required error={validationErrors[`${item.id}.defectDescription`]}>
                                  <input value={item.appraisal.defectDescription} onChange={(event) => updateAppraisalItem(item.id, "defectDescription", event.target.value)} placeholder="Describe the observed defect" />
                                </Field>
                              )}
                              <Field label="Appraiser remarks" wide>
                                <textarea rows="3" value={item.appraisal.remarks} onChange={(event) => updateAppraisalItem(item.id, "remarks", event.target.value)} placeholder="Add relevant appraisal observations" />
                              </Field>
                            </div>
                            <div className="derived-value-row" aria-label="Calculated appraisal values">
                              <span><small>Net weight</small><strong>{formatWeight(netWeight)}</strong></span>
                              <span><small>Lending rate</small><strong>{formatCurrency(lendingRateFor(item))}/g</strong></span>
                              <span className="is-featured"><small>Appraised value</small><strong>{formatCurrency(appraisedValueFor(item))}</strong></span>
                            </div>
                          </>
                        ) : (
                          <ReadOnlyGrid columns={2} fields={[
                            { label: "Quality / purity", value: item.appraisal.purity },
                            { label: "Gross weight", value: formatWeight(item.appraisal.grossWeight) },
                            { label: "Total deductions", value: formatWeight(deductionTotalFor(item)) },
                            { label: "Net weight", value: formatWeight(netWeight) },
                            { label: "Lending rate", value: `${formatCurrency(lendingRateFor(item))}/g` },
                            { label: "Appraised value", value: formatCurrency(appraisedValueFor(item)) },
                            { label: "Defect status", value: item.appraisal.defectPresent === "Yes" ? item.appraisal.defectDescription || "Defect recorded" : "No defect recorded" },
                            { label: "Appraiser remarks", value: item.appraisal.remarks || "—", wide: true },
                          ]} />
                        )}
                      </section>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {appraiserCanEdit && (
          <div className="action-panel">
            <Field label="Return comments" error={validationErrors.clarification} wide>
              <textarea rows="2" value={clarificationComment} onChange={(event) => setClarificationComment(event.target.value)} placeholder="Add a comment only when returning the application to the Maker" />
            </Field>
            <div className="details-action-row split-actions">
              <button type="button" className="warning" onClick={() => persistAppraisal("clarification")}>Return for clarification</button>
              <div>
                {/awaiting|pending/.test(appraisalStatusText) && <button type="button" className="secondary" onClick={() => persistAppraisal("start")}>Start appraisal</button>}
                <button type="button" className="secondary" onClick={() => persistAppraisal("save")}>Save draft</button>
                <button type="button" className="primary" onClick={() => persistAppraisal("complete")}>Complete appraisal</button>
              </div>
            </div>
          </div>
        )}
      </section>
    );
  };

  const renderEligibility = () => {
    const isOverdraft = String(view.loan.repaymentType || view.loan.facilityType).toLowerCase().includes("overdraft");
    const activeAccounts = view.loan.accounts.filter((account) => !account.status || String(account.status).toLowerCase() === "active");
    const minor = nomineeAge !== null && nomineeAge < 18;
    const ltvBand = view.eligibility.applicableLtv === 85
      ? "Up to ₹2.5 lakh"
      : view.eligibility.applicableLtv === 80
        ? "₹2.5–5 lakh"
        : "Above ₹5 lakh";

    return (
      <section className="details-section eligibility-section">
        <SectionHeading
          eyebrow="Step 2 of 3 · Maker finalisation"
          title="Loan recommendation"
          description="Review the calculated lending limit, confirm the customer request and prepare the recommendation for Checker review."
          status={view.eligibility.status}
          editable={makerCanEdit}
        />

        <section className="eligibility-overview" aria-labelledby="eligibility-overview-title">
          <div className="eligibility-overview__header">
            <div>
              <h4 id="eligibility-overview-title">Lending position</h4>
              <p>System-assessed limits based on the completed appraisal and current policy.</p>
            </div>
            <span className="eligibility-policy-chip">{ltvBand} policy band</span>
          </div>

          <div className="eligibility-metrics" aria-label="Eligibility values">
            <article>
              <small>Appraised collateral</small>
              <strong>{formatCurrency(view.eligibility.schemeLendingValue)}</strong>
              <span>Verified value</span>
            </article>
            <article>
              <small>Maximum applicable LTV</small>
              <strong>{textValue(view.eligibility.applicableLtv)}%</strong>
              <span>Policy applied</span>
            </article>
            <article>
              <small>LTV lending value</small>
              <strong>{formatCurrency(view.eligibility.ltvBasedValue)}</strong>
              <span>System derived</span>
            </article>
            <article>
              <small>Available exposure</small>
              <strong>{formatCurrency(view.eligibility.availableExposureLimit)}</strong>
              <span>Current customer limit</span>
            </article>
          </div>

          <div className="eligibility-ceiling">
            <div>
              <small>Maximum eligible amount</small>
              <span>Current recommendation ceiling</span>
            </div>
            <strong>{formatCurrency(view.eligibility.maximumEligibleAmount)}</strong>
          </div>
        </section>

        <div className="maker-workspace">
          <section className="maker-primary-panel">
            <div className="content-heading">
              <div><h4>Recommendation details</h4><p>{makerCanEdit ? "Confirm the amount, account and document execution method." : "Recommendation submitted by the Maker."}</p></div>
            </div>

            {makerCanEdit ? (
              <>
                <div className="details-form-grid columns-2">
                  <Field label="Customer requested amount" required error={validationErrors.requiredAmount}>
                    <div className="currency-input"><span>₹</span><input type="number" inputMode="numeric" min="0" value={makerDraft.requiredAmount} onChange={(event) => setMakerDraft((current) => ({ ...current, requiredAmount: event.target.value }))} /></div>
                  </Field>
                  <Field label="Recommended amount" required error={validationErrors.recommendedAmount}>
                    <div className="currency-input"><span>₹</span><input type="number" inputMode="numeric" min="0" value={makerDraft.recommendedAmount} onChange={(event) => setMakerDraft((current) => ({ ...current, recommendedAmount: event.target.value }))} /></div>
                  </Field>
                  <Field label="Disbursement account" required={!isOverdraft} error={validationErrors.disbursementAccount} wide>
                    <select disabled={isOverdraft} value={makerDraft.disbursementAccount} onChange={(event) => setMakerDraft((current) => ({ ...current, disbursementAccount: event.target.value }))}>
                      <option value="">{isOverdraft ? "Not applicable for Overdraft" : "Select an active CASA account"}</option>
                      {activeAccounts.map((account, index) => <option key={account.accountNumber || index} value={account.accountNumber || account.value}>{account.maskedAccountNumber || account.accountNumber || account.label}</option>)}
                    </select>
                    {isOverdraft && <small>OD limit will be created directly in CBS.</small>}
                  </Field>
                  <Field label="Recommendation comments" wide>
                    <textarea rows="3" value={makerDraft.makerComments} onChange={(event) => setMakerDraft((current) => ({ ...current, makerComments: event.target.value }))} placeholder="Summarise the recommendation rationale" />
                  </Field>
                </div>

                <fieldset className="execution-options">
                  <legend>Document execution</legend>
                  <label className={makerDraft.eSignRequired ? "is-selected" : ""}>
                    <input type="radio" name="documentExecution" checked={makerDraft.eSignRequired} onChange={() => setMakerDraft((current) => ({ ...current, eSignRequired: true }))} />
                    <span><strong>eSign</strong><small>Send documents to the registered mobile and email.</small></span>
                  </label>
                  <label className={!makerDraft.eSignRequired ? "is-selected" : ""}>
                    <input type="radio" name="documentExecution" checked={!makerDraft.eSignRequired} onChange={() => setMakerDraft((current) => ({ ...current, eSignRequired: false }))} />
                    <span><strong>Manual signature</strong><small>Collect and upload the signed document after sanction.</small></span>
                  </label>
                </fieldset>
              </>
            ) : (
              <ReadOnlyGrid columns={2} fields={[
                { label: "Customer requested amount", value: formatCurrency(view.eligibility.requiredAmount) },
                { label: "Recommended amount", value: formatCurrency(view.eligibility.recommendedAmount) },
                { label: "Disbursement account", value: view.eligibility.disbursementAccount || "Not applicable" },
                { label: "Document execution", value: view.eligibility.eSignRequired ? "eSign" : "Manual signature" },
                { label: "Recommendation comments", value: view.eligibility.makerComments || "—", wide: true },
              ]} />
            )}
          </section>

          <aside className="charges-panel">
            <div className="content-heading compact">
              <div><h4>Charges</h4><p>Calculated by the system.</p></div>
            </div>
            <dl className="charge-list">
              <div><dt>Processing charge</dt><dd>{formatCurrency(view.eligibility.charges.processingCharge)}</dd></div>
              <div><dt>Appraiser charge</dt><dd>{formatCurrency(view.eligibility.charges.appraiserCharge)}</dd></div>
              <div><dt>GST</dt><dd>{formatCurrency(view.eligibility.charges.gst)}</dd></div>
              {toNumber(view.eligibility.charges.otherCharges) > 0 && <div><dt>Other charges</dt><dd>{formatCurrency(view.eligibility.charges.otherCharges)}</dd></div>}
              <div className="charge-total"><dt>Total charges</dt><dd>{formatCurrency(view.eligibility.charges.totalCharges)}</dd></div>
              <div><dt>Deduction account</dt><dd>{textValue(view.eligibility.charges.chargesAccount)}</dd></div>
            </dl>
          </aside>
        </div>

        <section className="nominee-panel">
          <div className="content-heading">
            <div><h4>Nominee details</h4><p>Primary nominee for the Gold Loan account.</p></div>
            {makerCanEdit && (
              <label className="details-checkbox">
                <input type="checkbox" checked={makerDraft.nominee.useSavingsNominee} onChange={(event) => {
                  const checked = event.target.checked;
                  const fetchedNominee = view.loan.savingsNominee || {};
                  setMakerDraft((current) => ({
                    ...current,
                    nominee: {
                      ...current.nominee,
                      useSavingsNominee: checked,
                      ...(checked ? {
                        name: fetchedNominee.name || current.nominee.name,
                        relationship: fetchedNominee.relationship || current.nominee.relationship,
                        dateOfBirth: fetchedNominee.dateOfBirth || current.nominee.dateOfBirth,
                        address: fetchedNominee.address || current.nominee.address,
                        guardianName: fetchedNominee.guardianName || current.nominee.guardianName,
                        guardianRelationship: fetchedNominee.guardianRelationship || current.nominee.guardianRelationship,
                        guardianContact: fetchedNominee.guardianContact || current.nominee.guardianContact,
                      } : {}),
                    },
                  }));
                }} />
                <span>Use Savings Account nominee</span>
              </label>
            )}
          </div>

          {makerCanEdit ? (
            <>
              <div className="details-form-grid columns-2">
                <Field label="Nominee name" required error={validationErrors.nomineeName}><input value={makerDraft.nominee.name} onChange={(event) => setMakerDraft((current) => ({ ...current, nominee: { ...current.nominee, name: event.target.value } }))} /></Field>
                <Field label="Relationship" required error={validationErrors.nomineeRelationship}><select value={makerDraft.nominee.relationship} onChange={(event) => setMakerDraft((current) => ({ ...current, nominee: { ...current.nominee, relationship: event.target.value } }))}><option value="">Select relationship</option>{["Spouse", "Son", "Daughter", "Father", "Mother", "Brother", "Sister", "Other"].map((option) => <option key={option}>{option}</option>)}</select></Field>
                <Field label="Date of birth" required error={validationErrors.nomineeDob}><input type="date" value={makerDraft.nominee.dateOfBirth} onChange={(event) => setMakerDraft((current) => ({ ...current, nominee: { ...current.nominee, dateOfBirth: event.target.value } }))} /></Field>
                <Field label="Nominee address"><input value={makerDraft.nominee.address} onChange={(event) => setMakerDraft((current) => ({ ...current, nominee: { ...current.nominee, address: event.target.value } }))} /></Field>
                {minor && <><div className="minor-notice wide"><Icon type="info" />Nominee is a minor. Guardian details are mandatory.</div><Field label="Guardian name" required error={validationErrors.guardianName}><input value={makerDraft.nominee.guardianName} onChange={(event) => setMakerDraft((current) => ({ ...current, nominee: { ...current.nominee, guardianName: event.target.value } }))} /></Field><Field label="Guardian relationship"><input value={makerDraft.nominee.guardianRelationship} onChange={(event) => setMakerDraft((current) => ({ ...current, nominee: { ...current.nominee, guardianRelationship: event.target.value } }))} /></Field><Field label="Guardian contact" wide><input value={makerDraft.nominee.guardianContact} onChange={(event) => setMakerDraft((current) => ({ ...current, nominee: { ...current.nominee, guardianContact: event.target.value } }))} /></Field></>}
              </div>

              {makerDraft.nominees.map((nominee, index) => (
                <div className="additional-nominee" key={`nominee-${index}`}>
                  <div className="content-heading compact"><div><h4>Additional nominee {index + 1}</h4></div><button className="remove-nominee" type="button" onClick={() => setMakerDraft((current) => ({ ...current, nominees: current.nominees.filter((_, nomineeIndex) => nomineeIndex !== index) }))}>Remove</button></div>
                  <div className="details-form-grid columns-2">
                    <Field label="Nominee name"><input value={nominee.name || ""} onChange={(event) => setMakerDraft((current) => ({ ...current, nominees: current.nominees.map((entry, nomineeIndex) => nomineeIndex === index ? { ...entry, name: event.target.value } : entry) }))} /></Field>
                    <Field label="Relationship"><select value={nominee.relationship || ""} onChange={(event) => setMakerDraft((current) => ({ ...current, nominees: current.nominees.map((entry, nomineeIndex) => nomineeIndex === index ? { ...entry, relationship: event.target.value } : entry) }))}><option value="">Select relationship</option>{["Spouse", "Son", "Daughter", "Father", "Mother", "Brother", "Sister", "Other"].map((option) => <option key={option}>{option}</option>)}</select></Field>
                  </div>
                </div>
              ))}
              {makerDraft.nominees.length < 1 && <button className="add-nominee" type="button" onClick={() => setMakerDraft((current) => ({ ...current, nominees: [...current.nominees, { name: "", relationship: "" }] }))}>+ Add a second nominee</button>}
            </>
          ) : (
            <>
              <ReadOnlyGrid columns={2} fields={[
                { label: "Nominee name", value: view.eligibility.nominee.name },
                { label: "Relationship", value: view.eligibility.nominee.relationship },
                { label: "Date of birth", value: formatDate(view.eligibility.nominee.dateOfBirth) },
                { label: "Address", value: view.eligibility.nominee.address },
                ...(minor ? [
                  { label: "Guardian name", value: view.eligibility.nominee.guardianName },
                  { label: "Guardian contact", value: view.eligibility.nominee.guardianContact },
                ] : []),
              ]} />
              {view.eligibility.nominees.map((nominee, index) => (
                <div className="additional-nominee read-only" key={`saved-nominee-${index}`}>
                  <strong>Additional nominee {index + 1}</strong>
                  <span>{textValue(nominee.name)} · {textValue(nominee.relationship)}</span>
                </div>
              ))}
            </>
          )}
        </section>

        {makerCanEdit && (
          <div className="details-action-row sticky-actions">
            <button type="button" className="secondary" onClick={() => persistMaker(false)}>Save draft</button>
            <button type="button" className="primary" onClick={() => persistMaker(true)}>Submit to Branch Checker</button>
          </div>
        )}
      </section>
    );
  };

  const renderChecker = () => {
    const decisionButton = {
      approve: { label: "Approve and sanction", className: "primary" },
      pushback: { label: "Send back for correction", className: "warning" },
      reject: { label: "Reject application", className: "danger" },
    }[checkerDecisionMode];

    return (
      <section className="details-section checker-section">
        <SectionHeading
          eyebrow="Step 3 of 3 · Independent review"
          title="Checker decision"
          description="Confirm that appraisal and recommendation are complete, then record one clear sanction decision."
          status={view.checker.status || view.checker.decision || "Pending"}
          editable={checkerCanEdit}
        />

        <div className="checker-review-grid" aria-label="Review readiness">
          {[
            ["Jewellery appraisal", view.appraisal.status],
            ["Maker recommendation", view.eligibility.status],
            ["Application ready", view.eligibility.status === "Submitted to Checker" ? "Ready for review" : "Pending"],
          ].map(([label, status]) => (
            <article key={label}>
              <span className={`review-state-icon is-${statusTone(status)}`}><Icon type={statusTone(status) === "success" ? "check" : "info"} /></span>
              <div><strong>{label}</strong><small>{textValue(status)}</small></div>
            </article>
          ))}
        </div>

        <div className="checker-financial-summary" aria-label="Loan amount summary">
          <span><small>Original request</small><strong>{formatCurrency(view.loan.requestedAmount)}</strong></span>
          <span><small>Maximum eligible</small><strong>{formatCurrency(view.eligibility.maximumEligibleAmount)}</strong></span>
          <span><small>Maker recommendation</small><strong>{formatCurrency(view.eligibility.recommendedAmount)}</strong></span>
          <span className="featured"><small>Variance from request</small><strong>{formatCurrency((toNumber(view.eligibility.recommendedAmount) || 0) - (toNumber(view.loan.requestedAmount) || 0))}</strong></span>
        </div>

        {view.checker.decision && (
          <div className="existing-decision">
            <span className="existing-decision__icon"><Icon type="decision" /></span>
            <div>
              <small>Recorded decision</small>
              <strong>{view.checker.decision}</strong>
              <p>{view.checker.comments || "No Checker comments recorded."}</p>
              <span>{view.checker.decidedBy?.name || "Branch Checker"} · {formatDateTime(view.checker.decidedAt)}</span>
            </div>
          </div>
        )}

        {checkerCanEdit ? (
          <section className="checker-decision-form">
            <div className="content-heading">
              <div><h4>Record decision</h4><p>Select the outcome first. Only the information needed for that outcome will be requested.</p></div>
            </div>

            <fieldset className="decision-options">
              <legend className="sr-only">Checker decision</legend>
              <label className={checkerDecisionMode === "approve" ? "is-selected is-approve" : ""}>
                <input type="radio" name="checkerDecision" value="approve" checked={checkerDecisionMode === "approve"} onChange={(event) => setCheckerDecisionMode(event.target.value)} />
                <span><Icon type="check" /><strong>Approve</strong><small>Sanction and move to documentation.</small></span>
              </label>
              <label className={checkerDecisionMode === "pushback" ? "is-selected is-pushback" : ""}>
                <input type="radio" name="checkerDecision" value="pushback" checked={checkerDecisionMode === "pushback"} onChange={(event) => setCheckerDecisionMode(event.target.value)} />
                <span><Icon type="edit" /><strong>Send back</strong><small>Request a specific correction.</small></span>
              </label>
              <label className={checkerDecisionMode === "reject" ? "is-selected is-reject" : ""}>
                <input type="radio" name="checkerDecision" value="reject" checked={checkerDecisionMode === "reject"} onChange={(event) => setCheckerDecisionMode(event.target.value)} />
                <span><Icon type="alert" /><strong>Reject</strong><small>Close the application with a reason.</small></span>
              </label>
            </fieldset>

            <div className="details-form-grid columns-2">
              <Field label="Decision comments" required error={validationErrors.checkerComments} wide>
                <textarea rows="4" value={checkerDraft.comments} onChange={(event) => setCheckerDraft((current) => ({ ...current, comments: event.target.value }))} placeholder="Record the review outcome and rationale" />
              </Field>

              {checkerDecisionMode === "pushback" && (
                <>
                  <Field label="Send back to" required>
                    <select value={checkerDraft.pushbackSection} onChange={(event) => setCheckerDraft((current) => ({ ...current, pushbackSection: event.target.value }))}>{PUSHBACK_SECTIONS.map((section) => <option key={section.value} value={section.value}>{section.label}</option>)}</select>
                  </Field>
                  <Field label="Correction required" required error={validationErrors.pushbackReason}>
                    <input value={checkerDraft.pushbackReason} onChange={(event) => setCheckerDraft((current) => ({ ...current, pushbackReason: event.target.value }))} placeholder="State the exact correction needed" />
                  </Field>
                </>
              )}

              {checkerDecisionMode === "reject" && (
                <Field label="Rejection reason" required error={validationErrors.rejectionReason} wide>
                  <input value={checkerDraft.rejectionReason} onChange={(event) => setCheckerDraft((current) => ({ ...current, rejectionReason: event.target.value }))} placeholder="Policy ineligible, customer declined, fraud concern, or other" />
                </Field>
              )}
            </div>

            <div className="checker-actions">
              <button type="button" className={decisionButton.className} onClick={() => persistCheckerDecision(checkerDecisionMode)}>{decisionButton.label}</button>
            </div>
          </section>
        ) : !view.checker.decision ? (
          <div className="pending-review-note"><Icon type="info" /><div><strong>No Checker action is available yet</strong><span>The decision controls appear when the application is submitted and assigned to the Branch Checker.</span></div></div>
        ) : null}
      </section>
    );
  };

  const sectionContent = {
    jewelleryAppraisal: renderAppraisal,
    eligibilityRecommendation: renderEligibility,
    checkerDecision: renderChecker,
  };
  const currentOwner =
    view.application.currentOwner ||
    view.application.assignment?.currentOwner ||
    view.appraisal.appraiser.name;

  return (
    <section className="details-tab" aria-labelledby="details-tab-title">

      <div className="details-mobile-section-picker">
        <label htmlFor="application-detail-section">Current step</label>
        <select id="application-detail-section" value={activeSection} onChange={(event) => setActiveSection(event.target.value)}>
          {visibleSections.map((section) => <option key={section.id} value={section.id}>{section.number} · {section.label}</option>)}
        </select>
      </div>

      <div className="details-workspace">
        <nav className="details-section-nav" aria-label="Application review steps">
          <ol>
            {visibleSections.map((section) => (
              <li key={section.id}>
                <button type="button" className={activeSection === section.id ? "is-active" : ""} onClick={() => setActiveSection(section.id)} aria-current={activeSection === section.id ? "step" : undefined}>
                  <span className="section-nav-step">{section.number}</span>
                  <span className="section-nav-icon"><Icon type={section.icon} /></span>
                  <span className="section-nav-copy"><small>Step {section.number}</small><strong>{section.label}</strong></span>
                  <Status value={sectionStatus(section.id)} />
                </button>
              </li>
            ))}
          </ol>
        </nav>
        <div className="details-section-content">{sectionContent[activeSection]?.()}</div>
      </div>
      {saveState !== "idle" && (
        <div className={`details-save-state is-${saveState}`} role="status" aria-live="polite">
          {saveState === "saving" && "Saving changes…"}
          {saveState === "saved" && <><Icon type="check" />Changes saved</>}
          {saveState === "error" && <><Icon type="alert" />{saveError}</>}
        </div>
      )}
    </section>
  );
}
