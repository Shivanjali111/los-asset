import { useEffect, useMemo, useState } from "react";
import "./ApplicationSummaryTab.css";

const parseLeadDetails = (value) => {
  if (!value) return {};
  if (typeof value === "object") return value;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    console.error("Unable to parse leadDetails for application summary", error);
    return {};
  }
};

const hasValue = (value) =>
  value !== undefined && value !== null && String(value).trim() !== "";

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

const pick = (source, paths, fallback = "") => {
  for (const path of paths) {
    const value = getByPath(source, path);
    if (hasValue(value)) return value;
  }
  return fallback;
};

const toBoolean = (value, fallback = false) => {
  if (typeof value === "boolean") return value;
  const normalized = String(value || "").trim().toLowerCase();
  if (["true", "yes", "required", "y"].includes(normalized)) return true;
  if (["false", "no", "not required", "n"].includes(normalized)) return false;
  return fallback;
};

const formatCurrency = (value) => {
  if (!hasValue(value)) return "—";
  const amount = Number(String(value).replace(/[^0-9.-]/g, ""));
  if (!Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const joinPresent = (values, separator = ", ") =>
  values.filter(hasValue).join(separator) || "—";

const toDateInputValue = (value) => {
  if (!hasValue(value)) return "";
  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
};

const isUsablePreview = (value) =>
  typeof value === "string" &&
  (value.startsWith("data:") || value.startsWith("blob:") || value.startsWith("/"));

const EditIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 20h4l11-11a2.8 2.8 0 0 0-4-4L4 16v4Z" />
    <path d="m13.5 6.5 4 4" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m5 12 4 4L19 6" />
  </svg>
);

const FileIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 2h8l4 4v16H6z" />
    <path d="M14 2v5h5" />
  </svg>
);

const Detail = ({ label, value, full = false }) => (
  <div className={`summary-detail${full ? " is-full" : ""}`}>
    <span>{label}</span>
    <strong>{hasValue(value) ? value : "—"}</strong>
  </div>
);

const Input = ({ label, value, onChange, type = "text", options, readOnly }) => (
  <label className="summary-input">
    <span>{label}</span>
    {options ? (
      <select value={value || ""} onChange={(event) => onChange(event.target.value)}>
        {!options.includes(value) && hasValue(value) && <option value={value}>{value}</option>}
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        value={value || ""}
        readOnly={readOnly}
        onChange={(event) => onChange(event.target.value)}
      />
    )}
  </label>
);

const SectionHeader = ({
  eyebrow,
  title,
  editing,
  canEdit,
  onEdit,
  onSave,
  onCancel,
}) => (
  <header className="summary-section-header">
    <div>
      <span>{eyebrow}</span>
      <h3>{title}</h3>
    </div>
    {canEdit && editing ? (
      <div className="summary-section-actions">
        <button type="button" className="summary-text-button" onClick={onCancel}>Cancel</button>
        <button type="button" className="summary-save-button" onClick={onSave}>
          <CheckIcon /> Save
        </button>
      </div>
    ) : canEdit ? (
      <button type="button" className="summary-edit-button" onClick={onEdit}>
        <EditIcon /> <span>Edit</span>
      </button>
    ) : null}
  </header>
);

const DocumentCard = ({ title, document }) => {
  const matches = document?.verification?.matches || {};
  const preview = document?.preview || document?.dataUrl || "";
  const hasDocument = hasValue(document?.name);

  return (
    <article className="summary-document-card">
      <div className="summary-document-heading">
        <span className="summary-document-icon"><FileIcon /></span>
        <div>
          <h4>{title}</h4>
          <p>{hasDocument ? document.name : "Not uploaded"}</p>
        </div>
        <span className={`summary-document-status is-${String(document?.status || "pending").toLowerCase().replace(/\s+/g, "-")}`}>
          {document?.status || "Pending"}
        </span>
      </div>

      {hasDocument && (
        <>
          <dl className="summary-document-meta">
            <div><dt>Document type</dt><dd>{document?.ocr?.documentType || "—"}</dd></div>
            <div><dt>Uploaded</dt><dd>{document?.uploadedAt || "—"}</dd></div>
            <div><dt>OCR confidence</dt><dd>{document?.ocr?.confidence || "—"}</dd></div>
            <div><dt>Source</dt><dd>{document?.source || "—"}</dd></div>
          </dl>

          {title === "PAN card" && document?.ocr && (
            <div className="summary-document-data">
              <Detail label="PAN" value={document.ocr.pan} />
              <Detail label="Name on PAN" value={document.ocr.name} />
              <Detail label="Date of birth" value={document.ocr.dateOfBirth} />
              <Detail label="Father's name" value={document.ocr.fatherName} />
            </div>
          )}

          {title === "Address proof" && document?.ocr && (
            <div className="summary-document-data">
              <Detail label="Name on document" value={document.ocr.name} />
              <Detail label="PIN code" value={document.ocr.pincode} />
              <Detail label="Extracted address" value={document.ocr.address} full />
            </div>
          )}

          {Object.keys(matches).length > 0 && (
            <div className="summary-match-list" aria-label={`${title} verification matches`}>
              <span className={matches.name ? "is-match" : "is-mismatch"}><CheckIcon /> Name {matches.name ? "match" : "mismatch"}</span>
              {Object.prototype.hasOwnProperty.call(matches, "dateOfBirth") && (
                <span className={matches.dateOfBirth ? "is-match" : "is-mismatch"}><CheckIcon /> DOB {matches.dateOfBirth ? "match" : "mismatch"}</span>
              )}
              {Object.prototype.hasOwnProperty.call(matches, "fatherName") && (
                <span className={matches.fatherName ? "is-match" : "is-mismatch"}><CheckIcon /> Father's name {matches.fatherName ? "match" : "mismatch"}</span>
              )}
            </div>
          )}

          {isUsablePreview(preview) && (
            <a className="summary-document-link" href={preview} target="_blank" rel="noreferrer">
              View document
            </a>
          )}
        </>
      )}
    </article>
  );
};

const buildSummary = (details, lead) => {
  const onboardingData = details?.applicationOnboarding?.applicationData || {};
  const source = { ...onboardingData, ...details };
  const borrower = source.borrowerInformation || source.customerIdentityStep?.borrowerInformation || {};
  const borrowerDetails = borrower.details || {};
  const matchedCustomer = source.customerIdentity?.matchedCustomer ||
    source.customerIdentityStep?.identity?.matchedCustomer || {};
  const facility = source.facilityBranchLoanDetails || {};
  const product = facility.productFacilityAndScheme || {};
  const selectedBranch = facility.branchSelection?.selectedBranch || {};
  const supporting = source.eligibilitySupportingDetails || {};
  const land = supporting.land || {};
  const landDetails = land.details || {};
  const cibil = supporting.cibil || {};

  const customerType = pick(source, [
    "customerIdentity.customerType",
    "customerIdentityStep.identity.customerType",
    "relationshipType",
  ], lead?.relationshipType || "");

  const productType = product.productLabel || product.productType || "";
  const landRequired = toBoolean(
    facility.exposure?.landDetailsRequired,
    toBoolean(land.required, false),
  );
  const cibilRequired = toBoolean(
    facility.exposure?.cibilRequired,
    toBoolean(cibil.required, false),
  );

  return {
    applicationNumber: source.applicationNumber || source.applicationDetail?.applicationNumber || lead?.applicationNumber || "",
    status: source.applicationDetail?.status || source.stage || lead?.status || "",
    customer: {
      customerType,
      customerId: matchedCustomer.customerId || (customerType === "NTB" ? "Created during onboarding" : ""),
      firstName: borrowerDetails.firstName || matchedCustomer.firstName || lead?.firstName || "",
      middleName: borrowerDetails.middleName || matchedCustomer.middleName || lead?.middleName || "",
      lastName: borrowerDetails.lastName || matchedCustomer.lastName || lead?.lastName || "",
      dateOfBirth: borrowerDetails.dateOfBirth || matchedCustomer.dateOfBirth || "",
      gender: borrowerDetails.gender || matchedCustomer.gender || "",
      mobile: borrowerDetails.mobile || matchedCustomer.mobile || lead?.mobile || "",
      email: borrowerDetails.email || matchedCustomer.email || lead?.email || "",
      pan: borrowerDetails.pan || matchedCustomer.pan || "",
      aadhaarReference: borrower.aadhaar?.referenceNumber || "",
      aadhaarLast4: borrower.aadhaar?.last4 || borrowerDetails.aadhaarLast4 || matchedCustomer.aadhaarLast4 || "",
      addressLine1: borrowerDetails.addressLine1 || matchedCustomer.addressLine1 || "",
      addressLine2: borrowerDetails.addressLine2 || matchedCustomer.addressLine2 || "",
      pincode: borrowerDetails.pincode || matchedCustomer.pincode || "",
      city: borrowerDetails.city || matchedCustomer.city || "",
      state: borrowerDetails.state || matchedCustomer.state || "",
      kycStatus: borrower.status || matchedCustomer.kycStatus || "",
      consentStatus: source.customerConsent?.status || source.customerIdentityStep?.consent?.status || "",
      consentReference: source.customerConsent?.requestReference || source.customerIdentityStep?.consent?.requestReference || "",
      documents: borrower.documents || {},
    },
    loan: {
      productType,
      facilityType: facility.facilityType || source.applicationDetail?.facility || "",
      scheme: product.schemeName || facility.schemeName || "",
      purpose: product.purpose || facility.purpose || "",
      loanType: product.loanType || "",
      repaymentType: product.repaymentType || facility.repaymentType || "",
      requestedLoanAmount: product.requestedLoanAmount || facility.exposure?.requestedLoanAmount || facility.requestedLoanAmount || "",
      aggregateLoanAmount: facility.exposure?.aggregateLoanAmount || facility.aggregateExposure || "",
      existingOutstandingAmount: facility.exposure?.existingOutstandingAmount ?? "",
      tenure: product.tenure || "",
      branchType: facility.branchSelection?.type || facility.branchType || "",
      branchName: selectedBranch.name || selectedBranch.branchName || "",
      branchCode: selectedBranch.code || selectedBranch.branchCode || facility.branchSelection?.selectedBranchCode || "",
      branchPincode: selectedBranch.pinCode || selectedBranch.pincode || facility.branchSelection?.pinCode || "",
      branchAddress: selectedBranch.address || "",
      dpCode: selectedBranch.dpCode || "",
    },
    cibil: {
      show: cibilRequired || Object.values(cibil).some(hasValue),
      required: cibilRequired,
      score: cibil.score,
      status: cibil.status,
      outcome: cibil.assessmentOutcome,
      eligibleLoanAmount: cibil.eligibleLoanAmount,
      reportName: cibil.reportName,
      reportPath: cibil.reportPath,
      fetchedAt: cibil.fetchedAt || cibil.pullCompletedAt,
      requestReference: cibil.pullRequestReference,
      chargesAccountMasked: cibil.chargesAccountMasked,
    },
    showAgri: landRequired || toBoolean(land.required, false) || Object.values(landDetails).some(hasValue),
    agri: {
      status: land.status,
      state: landDetails.state,
      district: landDetails.district,
      village: landDetails.village,
      surveyNumber: landDetails.surveyNumber,
      season: landDetails.season,
      crop: landDetails.crop,
      extentAcres: landDetails.extentAcres,
      estimatedCostPerAcre: landDetails.estimatedCostPerAcre,
      ownership: landDetails.isLandOwner,
      recordType: landDetails.recordType,
      landRecord: land.documents?.landRecord || {},
    },
  };
};

export default function ApplicationSummaryTab({
  lead,
  setLead,
  onSaveLeadDetails,
  loggedInUserEmail,
  currentUserEmail,
  userEmail,
  currentUser,
}) {
  const activeUserEmail = String(
    loggedInUserEmail || currentUserEmail || userEmail || currentUser?.email || "",
  ).trim().toLowerCase();
  const canEdit = activeUserEmail === "shivgaikwad@deloitte.com";
  const leadDetails = useMemo(
    () => parseLeadDetails(lead?.leadDetails ?? lead?.lead_details),
    [lead?.leadDetails, lead?.lead_details],
  );
  const summary = useMemo(() => buildSummary(leadDetails, lead), [leadDetails, lead]);
  const [editing, setEditing] = useState(null);
  const [customerDraft, setCustomerDraft] = useState(summary.customer);
  const [loanDraft, setLoanDraft] = useState(summary.loan);
  const [agriDraft, setAgriDraft] = useState(summary.agri);

  useEffect(() => {
    if (!editing) {
      setCustomerDraft(summary.customer);
      setLoanDraft(summary.loan);
      setAgriDraft(summary.agri);
    }
  }, [summary, editing]);

  const updateDraft = (setter, key, value) => {
    setter((current) => ({ ...current, [key]: value }));
  };

  const persist = async (nextDetails) => {
    if (setLead) {
      setLead((currentLead) => ({
        ...currentLead,
        leadDetails: nextDetails,
        ...(Object.prototype.hasOwnProperty.call(currentLead || {}, "lead_details")
          ? { lead_details: JSON.stringify(nextDetails) }
          : {}),
      }));
    }
    if (onSaveLeadDetails) await onSaveLeadDetails(nextDetails);
  };

  const mirrorApplicationData = (nextDetails, key, value) => ({
    ...nextDetails,
    applicationOnboarding: {
      ...(nextDetails.applicationOnboarding || {}),
      applicationData: {
        ...(nextDetails.applicationOnboarding?.applicationData || {}),
        [key]: value,
      },
    },
  });

  const saveCustomer = async () => {
    if (!canEdit) return;
    const currentBorrower = leadDetails.borrowerInformation || {};
    const nextBorrower = {
      ...currentBorrower,
      details: {
        ...(currentBorrower.details || {}),
        firstName: customerDraft.firstName,
        middleName: customerDraft.middleName,
        lastName: customerDraft.lastName,
        dateOfBirth: customerDraft.dateOfBirth,
        gender: customerDraft.gender,
        mobile: customerDraft.mobile,
        email: customerDraft.email,
        pan: customerDraft.pan,
        addressLine1: customerDraft.addressLine1,
        addressLine2: customerDraft.addressLine2,
        pincode: customerDraft.pincode,
        city: customerDraft.city,
        state: customerDraft.state,
      },
    };
    const nextCustomerIdentityStep = leadDetails.customerIdentityStep
      ? { ...leadDetails.customerIdentityStep, borrowerInformation: nextBorrower }
      : leadDetails.customerIdentityStep;
    let nextDetails = {
      ...leadDetails,
      borrowerInformation: nextBorrower,
      ...(nextCustomerIdentityStep
        ? { customerIdentityStep: nextCustomerIdentityStep }
        : {}),
    };
    nextDetails = mirrorApplicationData(nextDetails, "borrowerInformation", nextBorrower);
    await persist(nextDetails);
    setEditing(null);
  };

  const saveLoan = async () => {
    if (!canEdit) return;
    const currentFacility = leadDetails.facilityBranchLoanDetails || {};
    const currentProduct = currentFacility.productFacilityAndScheme || {};
    const currentBranchSelection = currentFacility.branchSelection || {};
    const currentBranch = currentBranchSelection.selectedBranch || {};
    const requestedAmount = Number(loanDraft.requestedLoanAmount) || 0;
    const nextFacility = {
      ...currentFacility,
      productFacilityAndScheme: {
        ...currentProduct,
        productType: String(loanDraft.productType).toLowerCase().includes("agri")
          ? "Agri"
          : String(loanDraft.productType).toLowerCase().includes("retail")
            ? "Retail"
            : currentProduct.productType,
        productLabel: loanDraft.productType,
        schemeName: loanDraft.scheme,
        purpose: loanDraft.purpose,
        loanType: loanDraft.loanType,
        repaymentType: loanDraft.repaymentType,
        requestedLoanAmount: requestedAmount,
        tenure: loanDraft.tenure,
      },
      branchSelection: {
        ...currentBranchSelection,
        type: loanDraft.branchType,
        selectedBranchCode: loanDraft.branchCode,
        selectedBranch: {
          ...currentBranch,
          name: loanDraft.branchName,
          code: loanDraft.branchCode,
          pinCode: loanDraft.branchPincode,
          address: loanDraft.branchAddress,
          dpCode: loanDraft.dpCode,
        },
      },
      exposure: {
        ...(currentFacility.exposure || {}),
        requestedLoanAmount: requestedAmount,
      },
    };
    let nextDetails = { ...leadDetails, facilityBranchLoanDetails: nextFacility };
    nextDetails = mirrorApplicationData(nextDetails, "facilityBranchLoanDetails", nextFacility);
    await persist(nextDetails);
    setEditing(null);
  };

  const saveAgri = async () => {
    if (!canEdit) return;
    const currentSupporting = leadDetails.eligibilitySupportingDetails || {};
    const currentLand = currentSupporting.land || {};
    const nextLand = {
      ...currentLand,
      required: true,
      details: {
        ...(currentLand.details || {}),
        state: agriDraft.state,
        district: agriDraft.district,
        village: agriDraft.village,
        surveyNumber: agriDraft.surveyNumber,
        season: agriDraft.season,
        crop: agriDraft.crop,
        extentAcres: agriDraft.extentAcres,
        estimatedCostPerAcre: agriDraft.estimatedCostPerAcre,
        isLandOwner: agriDraft.ownership,
        recordType: agriDraft.recordType,
      },
    };
    const nextSupporting = { ...currentSupporting, land: nextLand };
    let nextDetails = { ...leadDetails, eligibilitySupportingDetails: nextSupporting };
    nextDetails = mirrorApplicationData(nextDetails, "eligibilitySupportingDetails", nextSupporting);
    await persist(nextDetails);
    setEditing(null);
  };

  const cancelEdit = () => {
    setCustomerDraft(summary.customer);
    setLoanDraft(summary.loan);
    setAgriDraft(summary.agri);
    setEditing(null);
  };

  const startEdit = (section) => {
    if (!canEdit) return;
    setCustomerDraft(summary.customer);
    setLoanDraft(summary.loan);
    setAgriDraft(summary.agri);
    setEditing(section);
  };

  const customerName = joinPresent([
    summary.customer.firstName,
    summary.customer.middleName,
    summary.customer.lastName,
  ], " ");
  const address = joinPresent([
    summary.customer.addressLine1,
    summary.customer.addressLine2,
    summary.customer.city,
    summary.customer.state,
    summary.customer.pincode,
  ]);

  return (
    <div className="application-summary">

      <div className="summary-content-columns">
        <section className="summary-section">
          <SectionHeader eyebrow="CUSTOMER" title="Customer details" editing={editing === "customer"} canEdit={canEdit} onEdit={() => startEdit("customer")} onSave={saveCustomer} onCancel={cancelEdit} />
          {editing === "customer" ? (
            <div className="summary-form-grid">
              <Input label="Customer type" value={customerDraft.customerType} readOnly onChange={() => {}} />
              <Input label="CBS Customer ID" value={customerDraft.customerId} readOnly onChange={() => {}} />
              <Input label="First name" value={customerDraft.firstName} onChange={(value) => updateDraft(setCustomerDraft, "firstName", value)} />
              <Input label="Middle name" value={customerDraft.middleName} onChange={(value) => updateDraft(setCustomerDraft, "middleName", value)} />
              <Input label="Last name" value={customerDraft.lastName} onChange={(value) => updateDraft(setCustomerDraft, "lastName", value)} />
              <Input label="Date of birth" type="date" value={toDateInputValue(customerDraft.dateOfBirth)} onChange={(value) => updateDraft(setCustomerDraft, "dateOfBirth", value)} />
              <Input label="Gender" value={customerDraft.gender} options={["Female", "Male", "Other"]} onChange={(value) => updateDraft(setCustomerDraft, "gender", value)} />
              <Input label="Mobile" value={customerDraft.mobile} onChange={(value) => updateDraft(setCustomerDraft, "mobile", value)} />
              <Input label="Email" type="email" value={customerDraft.email} onChange={(value) => updateDraft(setCustomerDraft, "email", value)} />
              <Input label="PAN" value={customerDraft.pan} onChange={(value) => updateDraft(setCustomerDraft, "pan", value.toUpperCase())} />
              <Input label="Aadhaar reference" value={customerDraft.aadhaarReference} readOnly onChange={() => {}} />
              <Input label="Aadhaar last 4 digits" value={customerDraft.aadhaarLast4} readOnly onChange={() => {}} />
              <div className="summary-input-wrapper is-full"><Input label="Address line 1" value={customerDraft.addressLine1} onChange={(value) => updateDraft(setCustomerDraft, "addressLine1", value)} /></div>
              <div className="summary-input-wrapper is-full"><Input label="Address line 2" value={customerDraft.addressLine2} onChange={(value) => updateDraft(setCustomerDraft, "addressLine2", value)} /></div>
              <Input label="PIN code" value={customerDraft.pincode} onChange={(value) => updateDraft(setCustomerDraft, "pincode", value.replace(/\D/g, "").slice(0, 6))} />
              <Input label="City" value={customerDraft.city} readOnly onChange={() => {}} />
              <Input label="State" value={customerDraft.state} readOnly onChange={() => {}} />
            </div>
          ) : (
            <div className="summary-details-list">
              <Detail label="Customer type" value={summary.customer.customerType} />
              <Detail label="CBS Customer ID" value={summary.customer.customerId} />
              <Detail label="Customer name" value={customerName} />
              <Detail label="Date of birth" value={summary.customer.dateOfBirth} />
              <Detail label="Gender" value={summary.customer.gender} />
              <Detail label="Mobile" value={summary.customer.mobile} />
              <Detail label="Email" value={summary.customer.email} />
              <Detail label="PAN" value={summary.customer.pan} />
              <Detail label="Aadhaar reference" value={summary.customer.aadhaarReference} />
              <Detail label="Aadhaar" value={summary.customer.aadhaarLast4 ? `XXXX XXXX ${summary.customer.aadhaarLast4}` : ""} />
              <Detail label="Residential address" value={address} full />
            </div>
          )}
          <div className="summary-verification-line">
            {summary.customer.kycStatus && <span><CheckIcon /> KYC {summary.customer.kycStatus}</span>}
            {summary.customer.consentStatus && <span><CheckIcon /> Consent {summary.customer.consentStatus}</span>}
            {summary.customer.consentReference && <small>{summary.customer.consentReference}</small>}
          </div>
        </section>

        <section className="summary-section">
          <SectionHeader eyebrow="LOAN" title="Loan and branch details" editing={editing === "loan"} canEdit={canEdit} onEdit={() => startEdit("loan")} onSave={saveLoan} onCancel={cancelEdit} />
          {editing === "loan" ? (
            <div className="summary-form-grid">
              <Input label="Product" value={loanDraft.productType} options={["Retail Gold Loan", "Agri Gold Loan"]} onChange={(value) => updateDraft(setLoanDraft, "productType", value)} />
              <Input label="Scheme" value={loanDraft.scheme} onChange={(value) => updateDraft(setLoanDraft, "scheme", value)} />
              <Input label="Purpose" value={loanDraft.purpose} onChange={(value) => updateDraft(setLoanDraft, "purpose", value)} />
              <Input label="Requested loan amount" type="number" value={loanDraft.requestedLoanAmount} onChange={(value) => updateDraft(setLoanDraft, "requestedLoanAmount", value)} />
              <Input label="Tenure" value={loanDraft.tenure} onChange={(value) => updateDraft(setLoanDraft, "tenure", value)} />
              <Input label="Loan type" value={loanDraft.loanType} onChange={(value) => updateDraft(setLoanDraft, "loanType", value)} />
              <Input label="Repayment type" value={loanDraft.repaymentType} onChange={(value) => updateDraft(setLoanDraft, "repaymentType", value)} />
              <Input label="Branch type" value={loanDraft.branchType} readOnly onChange={() => {}} />
              <Input label="Servicing branch" value={loanDraft.branchName} onChange={(value) => updateDraft(setLoanDraft, "branchName", value)} />
              <Input label="Branch code" value={loanDraft.branchCode} onChange={(value) => updateDraft(setLoanDraft, "branchCode", value)} />
              <Input label="Branch PIN code" value={loanDraft.branchPincode} onChange={(value) => updateDraft(setLoanDraft, "branchPincode", value.replace(/\D/g, "").slice(0, 6))} />
              <Input label="DP code" value={loanDraft.dpCode} onChange={(value) => updateDraft(setLoanDraft, "dpCode", value)} />
              <div className="summary-input-wrapper is-full"><Input label="Branch address" value={loanDraft.branchAddress} onChange={(value) => updateDraft(setLoanDraft, "branchAddress", value)} /></div>
            </div>
          ) : (
            <div className="summary-details-list">
              <Detail label="Product" value={summary.loan.productType} />
              <Detail label="Scheme" value={summary.loan.scheme} />
              <Detail label="Purpose" value={summary.loan.purpose} />
              <Detail label="Requested loan amount" value={formatCurrency(summary.loan.requestedLoanAmount)} />
              <Detail label="Tenure" value={summary.loan.tenure} />
              <Detail label="Loan type" value={summary.loan.loanType} />
              <Detail label="Repayment type" value={summary.loan.repaymentType} />
              <Detail label="Aggregate exposure" value={formatCurrency(summary.loan.aggregateLoanAmount)} />
              <Detail label="Existing outstanding" value={formatCurrency(summary.loan.existingOutstandingAmount)} />
              <Detail label="Branch type" value={summary.loan.branchType} />
              <Detail label="Servicing branch" value={summary.loan.branchName} />
              <Detail label="Branch code" value={summary.loan.branchCode} />
              <Detail label="Branch PIN code" value={summary.loan.branchPincode} />
              <Detail label="DP code" value={summary.loan.dpCode} />
              <Detail label="Branch address" value={summary.loan.branchAddress} full />
            </div>
          )}

          {summary.cibil.show && (
            <div className="summary-cibil-strip">
              <div><span>CIBIL score</span><strong>{summary.cibil.score || "—"}</strong></div>
              <div><span>Status</span><strong>{summary.cibil.status || (summary.cibil.required ? "Required" : "Not required")}</strong></div>
              <div><span>Assessment</span><strong>{summary.cibil.outcome || "—"}</strong></div>
              <div><span>Eligible amount</span><strong>{formatCurrency(summary.cibil.eligibleLoanAmount)}</strong></div>
              {isUsablePreview(summary.cibil.reportPath) && (
                <a href={summary.cibil.reportPath} target="_blank" rel="noreferrer">View CIBIL report</a>
              )}
            </div>
          )}
        </section>
      </div>

      <section className="summary-section summary-documents-section">
        <header className="summary-section-header">
          <div><span>KYC DOCUMENTS</span><h3>PAN card and address proof</h3></div>
        </header>
        <div className="summary-documents-grid">
          <DocumentCard title="PAN card" document={summary.customer.documents.pan || {}} />
          <DocumentCard title="Address proof" document={summary.customer.documents.addressProof || {}} />
        </div>
      </section>

      {summary.showAgri && (
        <section className="summary-section summary-agri-section">
          <SectionHeader eyebrow="AGRICULTURAL DETAILS" title="Land and crop details" editing={editing === "agri"} canEdit={canEdit} onEdit={() => startEdit("agri")} onSave={saveAgri} onCancel={cancelEdit} />
          {editing === "agri" ? (
            <div className="summary-form-grid is-agri">
              <Input label="State" value={agriDraft.state} onChange={(value) => updateDraft(setAgriDraft, "state", value)} />
              <Input label="District" value={agriDraft.district} onChange={(value) => updateDraft(setAgriDraft, "district", value)} />
              <Input label="Village" value={agriDraft.village} onChange={(value) => updateDraft(setAgriDraft, "village", value)} />
              <Input label="Survey number" value={agriDraft.surveyNumber} onChange={(value) => updateDraft(setAgriDraft, "surveyNumber", value)} />
              <Input label="Season" value={agriDraft.season} options={["Kharif", "Rabi", "Zaid", "Perennial"]} onChange={(value) => updateDraft(setAgriDraft, "season", value)} />
              <Input label="Crop" value={agriDraft.crop} onChange={(value) => updateDraft(setAgriDraft, "crop", value)} />
              <Input label="Extent (acres)" type="number" value={agriDraft.extentAcres} onChange={(value) => updateDraft(setAgriDraft, "extentAcres", value)} />
              <Input label="Estimated cost / acre" type="number" value={agriDraft.estimatedCostPerAcre} onChange={(value) => updateDraft(setAgriDraft, "estimatedCostPerAcre", value)} />
              <Input label="Land owner" value={agriDraft.ownership} options={["Yes", "No"]} onChange={(value) => updateDraft(setAgriDraft, "ownership", value)} />
              <Input label="Record type" value={agriDraft.recordType} onChange={(value) => updateDraft(setAgriDraft, "recordType", value)} />
            </div>
          ) : (
            <>
              <div className="summary-details-list is-agri">
                <Detail label="State" value={summary.agri.state} />
                <Detail label="District" value={summary.agri.district} />
                <Detail label="Village" value={summary.agri.village} />
                <Detail label="Survey number" value={summary.agri.surveyNumber} />
                <Detail label="Season" value={summary.agri.season} />
                <Detail label="Crop" value={summary.agri.crop} />
                <Detail label="Extent" value={hasValue(summary.agri.extentAcres) ? `${summary.agri.extentAcres} acres` : ""} />
                <Detail label="Estimated cost / acre" value={formatCurrency(summary.agri.estimatedCostPerAcre)} />
                <Detail label="Land owner" value={summary.agri.ownership} />
                <Detail label="Record type" value={summary.agri.recordType} />
              </div>
              {hasValue(summary.agri.landRecord?.name) && (
                <div className="summary-land-record">
                  <FileIcon />
                  <div><span>Land record</span><strong>{summary.agri.landRecord.name}</strong></div>
                  <small>{summary.agri.landRecord.uploadedAt}</small>
                </div>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}
