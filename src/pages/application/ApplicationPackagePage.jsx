//_______________This Code was generated using GenAI tool: Codify, Please check for accuracy_______________//
import { useState, useMemo } from "react";
import { pdf } from "@react-pdf/renderer";
import "./ApplicationPackagePage.css";
import ApplicationFormPdf from "./ApplicationFormPdf";

/* ── Icons ───────────────────────────────────────────────────────── */
const FileIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
    <path d="M14 2v6h6" /><path d="M8 13h8" /><path d="M8 17h5" />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const EyeIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="M7 10l5 5 5-5" /><path d="M12 15V3" />
  </svg>
);
const SendIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
  </svg>
);
const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.1">
    <path d="M21 12a9 9 0 0 1-15.5 6.3" /><path d="M3 12A9 9 0 0 1 18.5 5.7" />
    <path d="M18 2v4h4" /><path d="M6 22v-4H2" />
  </svg>
);
const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

/* ── Helpers ─────────────────────────────────────────────────────── */

/**
 * @description  Formats a raw number or numeric string as an Indian-locale currency string.
 *               Strips existing Rs / commas / spaces before formatting.
 *               Returns "dash" when value is falsy or non-numeric.
 * @param        value  Raw amount value (number or string)
 * @return       Formatted string like "Rs 45,00,000" or "dash"
 */
const formatCurrency = (value) => {
  if (!value) return "\u2014";
  const strCleaned = String(value).replace(/[\u20B9,\s]/g, "");
  const intNum = Number(strCleaned);
  if (isNaN(intNum)) return String(value);
  return "\u20B9" + intNum.toLocaleString("en-IN");
};

/**
 * @description  Formats an ISO / YYYY-MM-DD date string into a human-readable date.
 *               Returns "dash" for falsy input, original string if parsing fails.
 * @param        value  Date string
 * @return       Formatted date like "14 Jul 1991"
 */
const formatDate = (value) => {
  if (!value) return "\u2014";
  try {
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch {
    return value;
  }
};

/**
 * @description  Builds the structured PDF data object from live lead, application, and
 *               applicationData props collected across the onboarding steps.
 *               Falls back gracefully to "dash" for any field not yet captured.
 * @param        lead             Lead object from the API (firstName, lastName, mobile, etc.)
 * @param        application      Derived application metadata (id, owner, product, etc.)
 * @param        applicationData  Aggregate step data collected across the onboarding flow
 * @return       Data object matching the ApplicationFormPdf data-prop shape
 */
const buildPdfData = (lead, application, applicationData) => {
  const objIdentity     = applicationData?.customerIdentity  || {};
  const objLoan         = applicationData?.loanRequirement   || {};
  const objIncome       = applicationData?.incomeEmployment  || {};
  const objCollateral   = applicationData?.collateral        || {};
  const objEligibility  = applicationData?.eligibilityOffer  || {};
  const lstCoApplicants = applicationData?.coApplicants      || [];
  const lstDocuments    = applicationData?.documents         || [];

  const strFirstName = lead?.firstName || "";
  const strLastName  = lead?.lastName  || "";
  const strFullName  = [strFirstName, strLastName].filter(Boolean).join(" ") || "\u2014";

  const strOfficeAddress = [
    objIncome.officeAddressLine1,
    objIncome.officeCity,
    objIncome.officeState,
  ].filter(Boolean).join(", ") || "\u2014";

  const strMonthlyIncome =
    objIncome.monthlyGrossSalary ? formatCurrency(objIncome.monthlyGrossSalary) :
    objIncome.monthlyNetSalary   ? formatCurrency(objIncome.monthlyNetSalary)   :
    objIncome.monthlyIncome      ? formatCurrency(objIncome.monthlyIncome)      :
    "\u2014";

  const lstMappedCoApplicants = lstCoApplicants.length > 0
    ? lstCoApplicants.map((coApp) => ({
        name:         coApp.name      || "\u2014",
        role:         coApp.partyType || "Co-Applicant",
        relationship: coApp.relation  || "\u2014",
        mobile:       coApp.mobile    || "\u2014",
        pan:          coApp.pan       || "\u2014",
      }))
    : [];

  const lstMappedDocuments = lstDocuments.length > 0
    ? lstDocuments.map((doc) => ({
        type:    doc.type     || doc.category || "\u2014",
        subtype: doc.subtype  || doc.name     || "\u2014",
        status:  doc.status   || "Pending",
        source:  doc.source   || "Internal Upload",
      }))
    : [];

  return {
    applicationNumber: application?.id     || "\u2014",
    generatedOn:       formatDate(new Date().toISOString()),
    branchName:        lead?.branch        || "\u2014",
    sourcingChannel:   lead?.source        || "\u2014",
    ownerName:         lead?.owner         || application?.owner || "\u2014",

    applicant: {
      fullName:          strFullName,
      firstName:         strFirstName,
      lastName:          strLastName,
      gender:            objIdentity.gender            || "\u2014",
      dateOfBirth:       objIdentity.dateOfBirth
                           ? formatDate(objIdentity.dateOfBirth)
                           : "\u2014",
      fatherName:        objIdentity.fatherName        || "\u2014",
      motherName:        objIdentity.motherName        || "\u2014",
      maritalStatus:     objIdentity.maritalStatus     || "\u2014",
      mobile:            lead?.mobile                  || objIdentity.mobileNumber || "\u2014",
      email:             lead?.email                   || objIdentity.email        || "\u2014",
      pan:               objIdentity.panNumber         || "\u2014",
      residentialStatus: objIdentity.residentialStatus || "\u2014",
    },

    address: {
      permanent:     objIdentity.permanentAddress    || objIdentity.addressLine1 || "\u2014",
      residential:   objIdentity.residentialAddress  || objIdentity.addressLine1 || "\u2014",
      communication: objIdentity.communicationAddress || objIdentity.addressLine1 || "\u2014",
    },

    employment: {
      employmentType: objIncome.employmentType || "\u2014",
      employerName:   objIncome.employerName   || objIncome.businessName || "\u2014",
      designation:    objIncome.designation    || "\u2014",
      monthlyIncome:  strMonthlyIncome,
      officeAddress:  strOfficeAddress,
    },

    loan: {
      product:         objLoan.product            || lead?.product || "\u2014",
      loanType:        objLoan.loanType            || "\u2014",
      purpose:         objLoan.loanPurpose         || "\u2014",
      requestedAmount: objLoan.requestedLoanAmount
                         ? formatCurrency(objLoan.requestedLoanAmount)
                         : "\u2014",
      tenure:          objLoan.loanTenureYears
                         ? objLoan.loanTenureYears + " Years"
                         : "\u2014",
      repaymentType:   objLoan.repaymentType       || "\u2014",
      rateType:        objLoan.rateType            || "\u2014",
    },

    collateral: {
      propertyType:    objCollateral.propertyType    || "\u2014",
      propertyName:    objCollateral.projectName     || objCollateral.propertyName || "\u2014",
      unitNumber:      objCollateral.unitNumber      || "\u2014",
      propertyAddress: [
        objCollateral.projectName,
        objCollateral.collateralAddress,
      ].filter(Boolean).join(", ") || "\u2014",
      estimatedValue:  objCollateral.estimatedMarketValue
                         ? formatCurrency(objCollateral.estimatedMarketValue)
                         : objCollateral.propertyValue
                         ? formatCurrency(objCollateral.propertyValue)
                         : "\u2014",
      legalStatus:     objCollateral.legalStatus    || "Pending",
      technicalStatus: objCollateral.technicalStatus || "Pending",
    },

    eligibility: {
      breResult:         objEligibility.eligibilityStatus || objEligibility.breResult || "\u2014",
      decision:          objEligibility.recommendedOffer  || objEligibility.decision  || "\u2014",
      preliminaryAmount: objEligibility.eligibleAmount
                           ? formatCurrency(objEligibility.eligibleAmount)
                           : "\u2014",
      roi:               objEligibility.roi || "\u2014",
      emi:               objEligibility.emi
                           ? formatCurrency(objEligibility.emi)
                           : "\u2014",
      remarks:           objEligibility.remarks ||
        "Preliminary offer is subject to document completion, credit appraisal, legal and technical verification.",
    },

    coApplicants: lstMappedCoApplicants,
    documents:    lstMappedDocuments,
  };
};

/* ── Generation steps ────────────────────────────────────────────── */
const genSteps = [
  { id: 1, label: "Collecting applicant data" },
  { id: 2, label: "Compiling loan & collateral" },
  { id: 3, label: "Applying declaration" },
  { id: 4, label: "Generating PDF" },
];

/* ── Component ───────────────────────────────────────────────────── */

/**
 * @description  Step 9 of the Application Onboarding flow. Builds a live application
 *               summary and PDF from lead + applicationData props collected across earlier
 *               steps. Falls back to "dash" for any field not yet captured in prior steps.
 * @param        lead             Lead object from the API
 * @param        application      Derived application metadata (id, owner, product, etc.)
 * @param        applicationData  Aggregate step data collected across the onboarding flow
 */
function ApplicationPackagePage({ lead, application, applicationData }) {
  const [openSections,   setOpenSections]   = useState([]);
  const [genStage,       setGenStage]       = useState("idle");
  const [completedSteps, setCompletedSteps] = useState([]);
  const [pdfUrl,         setPdfUrl]         = useState("");
  const [esignStatus,    setEsignStatus]    = useState("Not Sent");
  const [esignRequestId, setEsignRequestId] = useState("");

  const pdfData = useMemo(
    () => buildPdfData(lead, application, applicationData),
    [lead, application, applicationData]
  );

  const strFileName = (pdfData.applicationNumber !== "\u2014" ? pdfData.applicationNumber : "Application") + "_Application_Form.pdf";

  const summaryGroups = useMemo(() => [
    {
      id:    "applicant",
      title: "Applicant Details",
      sub:   "Identity, profile and contact information",
      rows: [
        ["Full Name",             pdfData.applicant.fullName],
        ["PAN",                   pdfData.applicant.pan],
        ["Mobile",                pdfData.applicant.mobile],
        ["Email",                 pdfData.applicant.email],
        ["Date of Birth",         pdfData.applicant.dateOfBirth],
        ["Gender",                pdfData.applicant.gender],
        ["Residential Status",    pdfData.applicant.residentialStatus],
        ["Communication Address", pdfData.address.communication],
      ],
    },
    {
      id:    "loan",
      title: "Loan & Collateral",
      sub:   "Loan requirement and property details",
      rows: [
        ["Product",          pdfData.loan.product],
        ["Loan Type",        pdfData.loan.loanType],
        ["Purpose",          pdfData.loan.purpose],
        ["Requested Amount", pdfData.loan.requestedAmount],
        ["Tenure",           pdfData.loan.tenure],
        ["Property Type",    pdfData.collateral.propertyType],
        ["Property Name",    pdfData.collateral.propertyName],
        ["Unit Number",      pdfData.collateral.unitNumber],
        ["Estimated Value",  pdfData.collateral.estimatedValue],
      ],
    },
    {
      id:    "income",
      title: "Income & Eligibility",
      sub:   "Employment details and preliminary offer",
      rows: [
        ["Employment Type",    pdfData.employment.employmentType],
        ["Employer",           pdfData.employment.employerName],
        ["Designation",        pdfData.employment.designation],
        ["Monthly Income",     pdfData.employment.monthlyIncome],
        ["BRE Result",         pdfData.eligibility.breResult],
        ["Decision",           pdfData.eligibility.decision],
        ["Preliminary Amount", pdfData.eligibility.preliminaryAmount],
        ["ROI",                pdfData.eligibility.roi],
        ["EMI",                pdfData.eligibility.emi],
      ],
    },
  ], [pdfData]);

  const toggleSection = (id) =>
    setOpenSections((p) => p.includes(id) ? p.filter((s) => s !== id) : [...p, id]);

  /**
   * @description  Generates the application PDF from live pdfData, animates the progress
   *               steps, creates an object URL and auto-opens it in a new tab.
   */
  const generatePdf = async () => {
    setGenStage("generating");
    setCompletedSteps([]);

    const pdfPromise = pdf(<ApplicationFormPdf data={pdfData} />).toBlob();

    genSteps.forEach((_, idx) => {
      setTimeout(() => setCompletedSteps((p) => [...p, idx + 1]), (idx + 1) * 380);
    });

    const [blob] = await Promise.all([
      pdfPromise,
      new Promise((r) => setTimeout(r, 1700)),
    ]);

    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    const strUrl = URL.createObjectURL(blob);
    setPdfUrl(strUrl);
    setGenStage("done");

    window.open(strUrl, "_blank", "noopener,noreferrer");
  };

  const viewPdf = () => pdfUrl && window.open(pdfUrl, "_blank", "noopener,noreferrer");

  const downloadPdf = () => {
    if (!pdfUrl) return;
    const objAnchor    = document.createElement("a");
    objAnchor.href     = pdfUrl;
    objAnchor.download = strFileName;
    document.body.appendChild(objAnchor);
    objAnchor.click();
    document.body.removeChild(objAnchor);
  };

  const sendForEsign = () => {
    if (!pdfUrl) return;
    setEsignStatus("Sending\u2026");
    setTimeout(() => {
      const strId = "ESIGN-" + Math.floor(100000 + Math.random() * 900000);
      setEsignStatus("Sent for eSign");
      setEsignRequestId(strId);
      setTimeout(() => setEsignStatus("Signed / Received"), 3500);
    }, 1300);
  };

  const intActiveStep = completedSteps.length < genSteps.length ? completedSteps.length + 1 : null;

  return (
    <div className="pkg-page">
      <div className="pkg-panel">

        {/* ── Application Summary ── */}
        <div className="pkg-section">
          <div className="pkg-section-head no-btn">
            <span className="pkg-section-title">Application Summary</span>
            <span className="pkg-section-sub">Review details before generating the application form</span>
          </div>

          <div className="pkg-accordion-list">
            {summaryGroups.map((group) => {
              const isIsOpen = openSections.includes(group.id);
              return (
                <div className={"pkg-accordion" + (isIsOpen ? " open" : "")} key={group.id}>
                  <button type="button" className="pkg-acc-head" onClick={() => toggleSection(group.id)}>
                    <div className="pkg-acc-left">
                      <span className={"pkg-acc-chevron" + (isIsOpen ? " open" : "")}><ChevronIcon /></span>
                      <div>
                        <span className="pkg-acc-title">{group.title}</span>
                        <span className="pkg-acc-sub">{group.sub}</span>
                      </div>
                    </div>
                    <span className="pkg-acc-count">{group.rows.length} fields</span>
                  </button>

                  {isIsOpen && (
                    <div className="pkg-acc-body">
                      <div className="pkg-field-grid-3">
                        {group.rows.map(([strLabel, strValue]) => (
                          <div className="pkg-field" key={strLabel}>
                            <span className="pkg-field-label">{strLabel}</span>
                            <div className="pkg-field-ro">{strValue || "\u2014"}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="pkg-divider" />

        {/* ── Application Form ── */}
        <div className="pkg-section">
          <div className="pkg-section-head no-btn">
            <span className="pkg-section-title">Application Form</span>
            <span className="pkg-section-sub">Generate, review and send for eSign</span>
          </div>

          {genStage === "idle" && (
            <div className="pkg-form-idle">
              <div className="pkg-form-idle-info">
                <div className="pkg-form-idle-icon"><FileIcon /></div>
                <div>
                  <span className="pkg-form-idle-title">Application form not yet generated</span>
                  <p>Generates a professional PDF with applicant, loan, collateral and eligibility details, along with declaration.</p>
                </div>
              </div>
              <button type="button" className="pkg-gen-btn" onClick={generatePdf}>
                <FileIcon /> Generate Application Form
              </button>
            </div>
          )}

          {genStage === "generating" && (
            <div className="pkg-gen-progress">
              <div className="pkg-gen-steps">
                {genSteps.map((step, idx) => {
                  const isDone   = completedSteps.includes(step.id);
                  const isActive = !isDone && intActiveStep === step.id;
                  return (
                    <div key={step.id} className={"pkg-gen-step" + (isDone ? " done" : isActive ? " active" : "")}>
                      <div className="pkg-gen-indicator">
                        {isDone   ? <CheckIcon />                    : null}
                        {isActive ? <span className="pkg-spinner" /> : null}
                      </div>
                      {idx < genSteps.length - 1 && (
                        <div className={"pkg-gen-line" + (isDone ? " done" : "")} />
                      )}
                      <span className="pkg-gen-label">{step.label}</span>
                    </div>
                  );
                })}
              </div>
              <p className="pkg-gen-hint">Building your application form&#8230;</p>
            </div>
          )}

          {genStage === "done" && (
            <div className="pkg-form-done">
              <div className="pkg-form-success">
                <div className="pkg-form-success-icon"><CheckIcon /></div>
                <div>
                  <span className="pkg-form-filename">{strFileName}</span>
                  <span className="pkg-form-success-meta">Generated &#183; opened in new tab</span>
                </div>
              </div>

              <div className="pkg-form-actions">
                <button type="button" className="pkg-action-btn" onClick={viewPdf}>
                  <EyeIcon /> View Form
                </button>
                <button type="button" className="pkg-action-btn" onClick={downloadPdf}>
                  <DownloadIcon /> Download
                </button>
                <button type="button" className="pkg-action-btn ghost" onClick={generatePdf}>
                  <RefreshIcon /> Regenerate
                </button>
              </div>

              <div className="pkg-esign-row">
                <div className="pkg-esign-info">
                  <span className="pkg-esign-label">eSign</span>
                  <span className={"pkg-esign-status" + (esignStatus === "Signed / Received" ? " signed" : esignStatus.includes("Sent") ? " sent" : "")}>
                    {esignStatus}
                  </span>
                  {esignRequestId && (
                    <span className="pkg-esign-id">Request ID: {esignRequestId}</span>
                  )}
                </div>
                <button
                  type="button"
                  className="pkg-esign-btn"
                  onClick={sendForEsign}
                  disabled={esignStatus === "Sending\u2026" || esignStatus === "Signed / Received"}
                >
                  <SendIcon />
                  {esignStatus === "Sending\u2026" ? "Sending\u2026" : "Send for eSign"}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default ApplicationPackagePage;
//__________________________GenAI: Generated code ends here______________________________//