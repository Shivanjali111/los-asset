import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./CustomerIdentityPage.css";
import {
  normaliseIndianWhatsAppNumber,
  sendWhatsAppMessage,
} from "../../services/whatsAppService";

const CONSENT_WAIT_SECONDS = 6;
const DEFAULT_LEAD_API_BASE =
  "https://700pag34e9.execute-api.ap-south-1.amazonaws.com/prod/leads";
const PAN_CARD_PATH = "/docs/PanCard.jpg";
const ADDRESS_PROOF_PATH = "/docs/Voter Id_1550.pdf";

const PINCODE_DIRECTORY = {
  "411028": { city: "Pune", state: "Maharashtra" },
  "411045": { city: "Pune", state: "Maharashtra" },
  "400001": { city: "Mumbai", state: "Maharashtra" },
};

const OCR_MOCKS = {
  pan: {
    documentType: "PAN Card",
    pan: "CIJPG1212N",
    name: "Shivanjali Gaikwad",
    dateOfBirth: "01/11/1996",
    fatherName: "Sanjay Gaikwad",
    confidence: "98.7%",
  },
  addressProof: {
    documentType: "Voter ID",
    name: "Shivanjali Gaikwad",
    address:
      "D-303, Fortune Estate, Hadapsar, Pune, Maharashtra - 411028",
    pincode: "411028",
    confidence: "97.9%",
  },
};

const MOCK_CUSTOMERS = [
  {
    firstName: "Shivanjali",
    lastName: "Gaikwad",
    fullName: "Shivanjali Gaikwad",
    customerId: "APEX00918427",
    aadhaarNumber: "312455018833",
    accountNumber: "102345678901",
    mobileNumber: "8552051111",
    mobile: "+91 85520 51111",
    email: "shivanjali.gaikwad@email.com",
    dateOfBirth: "01 Nov 1996",
    fatherName: "Sanjay Gaikwad",
    gender: "Female",
    maritalStatus: "Married",
    occupation: "Salaried",
    pan: "CIJPG1212N",
    addressLine1: "D-303, Fortune Estate, Hadapsar",
    addressLine2: "Near Magarpatta Road",
    city: "Pune",
    state: "Maharashtra",
    address: "D-303, Fortune Estate, Hadapsar, Pune, Maharashtra - 411028",
    pincode: "411028",
    homeBranch: "Pune - Hadapsar",
    kycStatus: "Current",
    kycUpdatedAt: "12 Mar 2025",
    ckycNumber: "XXXXXXXX4812",
    riskCategory: "Low",
  },
  {
    firstName: "Aarav",
    lastName: "Mehta",
    fullName: "Aarav Mehta",
    customerId: "APEX00467231",
    aadhaarNumber: "487263951742",
    accountNumber: "110023456789",
    mobileNumber: "9876543210",
    mobile: "+91 98765 43210",
    email: "aarav.mehta@email.com",
    dateOfBirth: "18 Jun 1989",
    fatherName: "Rajesh Mehta",
    gender: "Male",
    maritalStatus: "Married",
    occupation: "Self-employed",
    pan: "AJPPM4821K",
    addressLine1: "B-804, Lake View Residency, Baner",
    addressLine2: "Near Baner High Street",
    city: "Pune",
    state: "Maharashtra",
    address: "B-804, Lake View Residency, Baner, Pune, Maharashtra - 411045",
    pincode: "411045",
    homeBranch: "Pune - Baner",
    kycStatus: "Current",
    kycUpdatedAt: "05 Feb 2026",
    ckycNumber: "XXXXXXXX7364",
    riskCategory: "Low",
  },
];

const AUTHENTICATION_OPTIONS = {
  CUSTOMER_ID: {
    label: "Customer ID",
    placeholder: "Enter 12-character Customer ID",
    inputMode: "text",
    maxLength: 12,
    validate: (value) => /^APEX\d{8}$/i.test(value),
    error: "Enter a valid Customer ID, for example APEX00918427.",
  },
  AADHAAR: {
    label: "Aadhaar Number",
    placeholder: "Enter 12-digit Aadhaar number",
    inputMode: "numeric",
    maxLength: 12,
    validate: (value) => /^\d{12}$/.test(value),
    error: "Enter a valid 12-digit Aadhaar number.",
  },
  MOBILE: {
    label: "Mobile Number",
    placeholder: "Enter 10-digit mobile number",
    inputMode: "numeric",
    maxLength: 10,
    validate: (value) => /^\d{10}$/.test(value),
    error: "Enter a valid 10-digit mobile number.",
  },
};

const Icon = ({ children, size = 18, className = "" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const CheckIcon = ({ size = 16 }) => (
  <Icon size={size}>
    <path d="M20 6 9 17l-5-5" />
  </Icon>
);

const UserIcon = () => (
  <Icon>
    <circle cx="12" cy="7" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </Icon>
);

const ShieldIcon = () => (
  <Icon>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    <path d="m9 12 2 2 4-5" />
  </Icon>
);

const PhoneIcon = () => (
  <Icon>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.7 19.7 0 0 1-8.6-3.1 19.3 19.3 0 0 1-6-6A19.7 19.7 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2.1Z" />
  </Icon>
);

const FileIcon = () => (
  <Icon>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
    <path d="M14 2v6h6M8 13h8M8 17h5" />
  </Icon>
);

const UploadIcon = () => (
  <Icon size={16}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="m17 8-5-5-5 5M12 3v12" />
  </Icon>
);

const PencilIcon = () => (
  <Icon size={15}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
  </Icon>
);

const EyeIcon = () => (
  <Icon size={15}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);

const RefreshIcon = () => (
  <Icon size={15}>
    <path d="M21 12a9 9 0 0 1-15.2 6.5M3 12A9 9 0 0 1 18.2 5.5M18 3v5h-5M6 21v-5h5" />
  </Icon>
);

const AlertIcon = () => (
  <Icon size={16}>
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9v4M12 17h.01" />
  </Icon>
);

const Spinner = ({ size = 16 }) => (
  <Icon className="glci-spinner" size={size}>
    <path d="M21 12a9 9 0 1 1-6.22-8.56" />
  </Icon>
);

const digitsOnly = (value) => String(value || "").replace(/\D/g, "");
const normaliseMobile = (value) => digitsOnly(value).slice(-10);

const findCustomerByMobile = (mobile) => {
  const normalisedMobile = normaliseMobile(mobile);
  return (
    MOCK_CUSTOMERS.find((item) => item.mobileNumber === normalisedMobile) ||
    null
  );
};

const findCustomerByAuthentication = (parameter, value) => {
  const candidate = String(value || "").trim();
  if (parameter === "CUSTOMER_ID") {
    return (
      MOCK_CUSTOMERS.find(
        (item) => item.customerId.toUpperCase() === candidate.toUpperCase(),
      ) || null
    );
  }
  if (parameter === "AADHAAR") {
    return (
      MOCK_CUSTOMERS.find(
        (item) => item.aadhaarNumber === digitsOnly(candidate),
      ) || null
    );
  }
  return findCustomerByMobile(candidate);
};

const toPersistableCustomer = (customer) =>
  customer
    ? {
        fullName: customer.fullName,
        firstName: customer.firstName,
        middleName: customer.middleName || "",
        lastName: customer.lastName,
        customerId: customer.customerId,
        casaNumber: customer.casaNumber || customer.accountNumber || "",
        mobile: customer.mobile,
        email: customer.email,
        dateOfBirth: customer.dateOfBirth,
        gender: customer.gender || "",
        pan: customer.pan,
        aadhaarLast4: digitsOnly(customer.aadhaarNumber).slice(-4),
        addressLine1: customer.addressLine1 || "",
        addressLine2: customer.addressLine2 || "",
        city: customer.city || "",
        state: customer.state || "",
        pincode: customer.pincode || "",
        homeBranch: customer.homeBranch,
        kycStatus: customer.kycStatus,
        kycUpdatedAt: customer.kycUpdatedAt,
        ckycNumber: customer.ckycNumber,
        riskCategory: customer.riskCategory,
      }
    : null;

const parseLeadDetails = (value) => {
  if (!value) return {};
  if (typeof value === "object") return value;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const getLeadDetailsSource = (lead) =>
  lead?.leadDetails ?? lead?.lead_details ?? lead?.details ?? {};

const buildLeadCustomer = (lead, leadDetails) => ({
  firstName: lead.firstName || "",
  middleName: lead.middleName || "",
  lastName: lead.lastName || "",
  fullName:
    [lead.firstName, lead.middleName, lead.lastName]
      .filter(Boolean)
      .join(" ") || "Gold Loan applicant",
  customerId: "",
  casaNumber: leadDetails.casaNumber || lead.accountNumber || "",
  mobile: lead.mobile || "—",
  email: lead.email || "—",
  dateOfBirth: leadDetails.dateOfBirth || lead.dateOfBirth || "—",
  gender: leadDetails.gender || lead.gender || "",
  pan: leadDetails.panNumber || lead.panNumber || "—",
  addressLine1:
    leadDetails.addressLine1 ||
    leadDetails.address ||
    leadDetails.communicationAddress ||
    lead.address ||
    "",
  addressLine2: leadDetails.addressLine2 || "",
  city: leadDetails.city || lead.city || "",
  state: leadDetails.state || lead.state || "",
  pincode:
    leadDetails.pincode ||
    lead.pincode ||
    String(
      leadDetails.address ||
        leadDetails.communicationAddress ||
        lead.address ||
        "",
    ).match(/\b\d{6}\b/)?.[0] ||
    "",
  homeBranch: leadDetails.homeBranchName || "To be assigned",
  kycStatus: leadDetails.kycStatus || lead.kycStatus || "Pending",
  kycUpdatedAt: leadDetails.kycLastUpdated || "—",
  ckycNumber: leadDetails.ckycNumber || "—",
  riskCategory: leadDetails.riskCategory || "Not assessed",
});

const createReference = (prefix) =>
  `${prefix}-${Date.now().toString(36).toUpperCase().slice(-6)}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;

const randomDigits = (length) =>
  Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");

const generateCustomerId = () => `APEX${randomDigits(8)}`;

const generateCasaNumber = () => randomDigits(12);

const buildConsentLandingUrl = ({
  customerName,
  email,
  leadId,
  mobile,
  requestReference,
}) => {
  const params = new URLSearchParams({
    name: customerName || "",
    leadId: leadId || "",
    mobile: mobile || "",
    email: email || "",
    requestReference: requestReference || "",
  });

  return `${window.location.origin}/consent?${params.toString()}`;
};

const buildConsentMessage = ({ consentUrl, customerName }) => {
  const salutation = customerName ? `Dear ${customerName},` : "Dear Customer,";
  return `${salutation}

Thank you for choosing APEX BANK Gold Loan.

To continue your application, please provide your consent for application processing, KYC/CBS verification, internal checks, and journey-related communication.

Consent Page: ${consentUrl}

If you did not initiate this request, please ignore this message.`;
};

const maskMobile = (value) => {
  const digits = normaliseMobile(value);
  return digits ? `+91 XXXXX ${digits.slice(-5)}` : "—";
};

const getInitials = (name) =>
  String(name || "GL")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const toDateInputValue = (value) => {
  if (!value || value === "—") return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateForDisplay = (value) => {
  const parsed = value ? new Date(`${value}T00:00:00`) : null;
  return parsed && !Number.isNaN(parsed.getTime())
    ? parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
};

const buildBorrowerDetails = (customer, lead) => ({
  firstName: customer.firstName || lead.firstName || "",
  middleName: customer.middleName || lead.middleName || "",
  lastName: customer.lastName || lead.lastName || "",
  dateOfBirth: toDateInputValue(customer.dateOfBirth || lead.dateOfBirth),
  gender: customer.gender || lead.gender || "",
  mobile: normaliseMobile(customer.mobile || lead.mobile),
  email: customer.email === "—" ? "" : customer.email || lead.email || "",
  pan: customer.pan === "—" ? "" : customer.pan || lead.panNumber || "",
  aadhaarLast4: digitsOnly(customer.aadhaarNumber || lead.aadhaarNumber).slice(-4),
  addressLine1:
    customer.addressLine1 === "—" ? "" : customer.addressLine1 || lead.address || "",
  addressLine2: customer.addressLine2 || "",
  city: customer.city || lead.city || "",
  state: customer.state || lead.state || "",
  pincode: customer.pincode || lead.pincode || "",
});

const buildBorrowerDocuments = (customerType) =>
  customerType === "ETB"
    ? {
        pan: {
          name: "PanCard.jpg",
          preview: PAN_CARD_PATH,
          status: "Uploaded",
          source: "CBS KYC",
          verifiedAt: "",
          scanning: false,
          ocr: OCR_MOCKS.pan,
        },
        addressProof: {
          name: "Voter Id_1550.pdf",
          preview: ADDRESS_PROOF_PATH,
          status: "Uploaded",
          source: "CBS KYC",
          scanning: false,
          ocr: OCR_MOCKS.addressProof,
        },
      }
    : {
        pan: { name: "", preview: "", status: "Pending", source: "", scanning: false, ocr: null },
        addressProof: {
          name: "",
          preview: "",
          status: "Pending",
          source: "",
          scanning: false,
          ocr: null,
        },
      };

const buildBorrowerInformation = (customerType, customer, lead) => ({
  status: customerType === "ETB" ? "Saved" : "Draft",
  savedAt: customerType === "ETB" ? "CBS record" : "",
  details: buildBorrowerDetails(customer, lead),
  documents: buildBorrowerDocuments(customerType),
  aadhaar: {
    status: customerType === "ETB" ? "Reference generated" : "Pending",
    last4: customer.aadhaarLast4 || digitsOnly(customer.aadhaarNumber).slice(-4),
    referenceNumber:
      customerType === "ETB" ? "AAD-REF-APEX-4812" : "",
    processing: false,
  },
});

const normalisePanDocument = (document) => {
  const panDocument = document || {};
  const wasExplicitlyVerified =
    panDocument.verification?.result === "MATCHED" &&
    panDocument.verification?.matches?.name &&
    panDocument.verification?.matches?.dateOfBirth &&
    panDocument.verification?.matches?.fatherName;

  return {
    ...panDocument,
    status:
      panDocument.status === "Verified" && !wasExplicitlyVerified
        ? panDocument.preview
          ? "Uploaded"
          : "Pending"
        : panDocument.status,
  };
};

const validateBorrower = (details) => {
  const errors = {};
  const namePattern = /^[A-Za-z][A-Za-z .'-]*$/;
  if (!details.firstName.trim()) errors.firstName = "First name is required.";
  else if (!namePattern.test(details.firstName.trim()))
    errors.firstName = "Enter a valid name.";
  if (!details.lastName.trim()) errors.lastName = "Last name is required.";
  else if (!namePattern.test(details.lastName.trim()))
    errors.lastName = "Enter a valid last name.";
  if (!details.dateOfBirth) {
    errors.dateOfBirth = "Date of birth is required.";
  } else {
    const dob = new Date(`${details.dateOfBirth}T00:00:00`);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const beforeBirthday =
      today.getMonth() < dob.getMonth() ||
      (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate());
    if (beforeBirthday) age -= 1;
    if (Number.isNaN(dob.getTime()) || dob > today)
      errors.dateOfBirth = "Enter a valid date of birth.";
    else if (age < 18)
      errors.dateOfBirth = "Borrower must be at least 18 years old.";
    else if (age > 75)
      errors.dateOfBirth = "Borrower age cannot exceed 75 years.";
  }
  if (!details.gender) errors.gender = "Select gender.";
  if (!/^\d{10}$/.test(details.mobile))
    errors.mobile = "Enter a valid 10-digit mobile number.";
  if (details.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email))
    errors.email = "Enter a valid email address.";
  if (details.pan && details.pan.trim() && !/^[A-Z]{5}\d{4}[A-Z]$/.test(details.pan.toUpperCase()))
    errors.pan = "Enter a valid PAN, for example ABCDE1234F.";
  if (!details.addressLine1?.trim() || details.addressLine1.trim().length < 5)
    errors.addressLine1 = "Enter a complete address line 1.";
  if (!details.city?.trim()) errors.city = "City is populated from the PIN code.";
  if (!details.state?.trim()) errors.state = "State is populated from the PIN code.";
  if (!/^\d{6}$/.test(details.pincode || "") || !PINCODE_DIRECTORY[details.pincode])
    errors.pincode = "Enter a valid 6-digit PIN code.";
  return errors;
};

const ensureLeadDetailsNodes = (rawLeadDetails, lead) => {
  const leadDetails = parseLeadDetails(rawLeadDetails);
  const existingStep = leadDetails.customerIdentityStep || {};
  const mobileMatch = findCustomerByMobile(lead.mobile);
  const existingIdentity =
    leadDetails.customerIdentity || existingStep.identity || {};
  const matchedCustomer =
    existingIdentity.matchedCustomer || toPersistableCustomer(mobileMatch);
  const customerType =
    existingIdentity.customerType || (matchedCustomer ? "ETB" : "NTB");
  const borrowerDefaults = buildBorrowerInformation(
    customerType,
    matchedCustomer || buildLeadCustomer(lead, leadDetails),
    lead,
  );
  const existingBorrower =
    leadDetails.borrowerInformation || existingStep.borrowerInformation || {};
  const existingConsent =
    leadDetails.customerConsent || existingStep.consent || {};
  const existingNtb = leadDetails.ntbOnboarding || existingStep.ntbOnboarding || {};

  const customerIdentity = {
    matchSource: "VERIFIED_MOBILE",
    customerIdentityConfirmed: false,
    authenticationParameter: "",
    authenticationReference: "",
    confirmedAt: "",
    ...existingIdentity,
    customerType,
    matchStatus: matchedCustomer ? "MATCH_FOUND" : "NO_MATCH",
    matchedCustomer,
  };
  const customerConsent = {
    status: "Pending",
    requestReference: "",
    channel: "WhatsApp consent link",
    sentAt: "",
    capturedAt: "",
    expiresAt: "",
    resendCount: 0,
    ...existingConsent,
  };
  const ntbOnboarding = {
    status: "Pending",
    ...existingNtb,
    documents: {
      pan: { name: "", preview: "", status: "Pending" },
      ovd: { name: "", preview: "", status: "Pending" },
      ...existingNtb.documents,
    },
  };
  const borrowerInformation = {
    ...borrowerDefaults,
    ...existingBorrower,
    details: {
      ...borrowerDefaults.details,
      ...existingBorrower.details,
    },
    documents: {
      pan: {
        ...normalisePanDocument({
          ...borrowerDefaults.documents.pan,
          ...existingBorrower.documents?.pan,
        }),
      },
      addressProof: {
        ...borrowerDefaults.documents.addressProof,
        ...existingBorrower.documents?.addressProof,
      },
    },
    aadhaar: {
      ...borrowerDefaults.aadhaar,
      ...existingBorrower.aadhaar,
    },
  };

  return {
    ...leadDetails,
    customerIdentityStep: {
      version: 1,
      status: "In Progress",
      lastUpdatedAt: "",
      ...existingStep,
      identity: customerIdentity,
      consent: customerConsent,
      borrowerInformation,
      ntbOnboarding,
    },
    customerIdentity,
    customerConsent,
    ntbOnboarding,
    borrowerInformation,
  };
};

const getTimestamp = (value = new Date()) =>
  value.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

const getLeadIdentifier = (lead, explicitLeadId) =>
  explicitLeadId ||
  lead?.id ||
  lead?.leadnumber ||
  lead?.leadNumber ||
  lead?.leadId ||
  "";

const patchLeadDetails = async (leadApiBase, leadIdentifier, leadDetails) => {
  if (!leadIdentifier) {
    throw new Error("Lead ID is unavailable. Details could not be saved.");
  }

  const response = await fetch(
    `${String(leadApiBase || DEFAULT_LEAD_API_BASE).replace(/\/$/, "")}/${encodeURIComponent(leadIdentifier)}/details`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leadId: leadIdentifier,
        leadDetailsPatch: leadDetails,
      }),
    },
  );

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(
      message || `Unable to save lead details (${response.status}).`,
    );
  }

  return response.status === 204 ? null : response.json().catch(() => null);
};

const readFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () =>
      reject(new Error("Unable to read the selected document."));
    reader.readAsDataURL(file);
  });

function StatusBadge({ variant = "pending", children }) {
  return <span className={`glci-badge ${variant}`}>{children}</span>;
}

function SectionHeader({ number, title, description, status, statusVariant }) {
  return (
    <div className="glci-section-head">
      <span
        className={`glci-section-number ${statusVariant === "success" ? "complete" : ""}`}
      >
        {statusVariant === "success" ? <CheckIcon size={14} /> : number}
      </span>
      <div className="glci-section-copy">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <StatusBadge variant={statusVariant}>{status}</StatusBadge>
    </div>
  );
}

function Detail({ label, value, verified = false, wide = false, required = false }) {
  return (
    <div className={`glci-detail ${wide ? "wide" : ""}`}>
      <span>
        {label}
        {required && <span style={{ color: "red" }}>*</span>}
      </span>
      <div>
        <strong>{value || "—"}</strong>
        {verified && (
          <StatusBadge variant="success">
            <CheckIcon size={11} /> Verified
          </StatusBadge>
        )}
      </div>
    </div>
  );
}

function BorrowerField({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  type = "text",
  options,
  inputMode,
  maxLength,
  wide = false,
  readOnly = false,
}) {
  const controlProps = {
    id: `borrower-${name}`,
    name,
    value,
    onChange,
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? `borrower-${name}-error` : undefined,
    required,
    readOnly,
  };

  return (
    <label className={`glci-borrower-field ${wide ? "wide" : ""}`}>
      <span>
        {label}
        {required && <em>*</em>}
      </span>
      {options ? (
        <select {...controlProps}>
          <option value="">Select {label.toLowerCase()}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : wide ? (
        <textarea {...controlProps} rows="3" maxLength={maxLength} />
      ) : (
        <input
          {...controlProps}
          type={type}
          inputMode={inputMode}
          maxLength={maxLength}
        />
      )}
      {error && (
        <small id={`borrower-${name}-error`} className="glci-field-error">
          {error}
        </small>
      )}
    </label>
  );
}

function AadhaarCapture({ aadhaar, onChange, onSave, disabled }) {
  const digits = digitsOnly(aadhaar?.draftValue).slice(0, 12);
  const visibleEntry = [digits.slice(0, 4), digits.slice(4, 8), digits.slice(8, 12)]
    .filter(Boolean)
    .join(" ");

  if (aadhaar?.processing) {
    return (
      <div className="glci-aadhaar-state processing" role="status">
        <Spinner size={18} />
        <div><strong>Securing Aadhaar</strong><span>Generating a tokenised reference…</span></div>
      </div>
    );
  }

  if (aadhaar?.referenceNumber) {
    return (
      <div className="glci-aadhaar-state complete">
        <span className="glci-aadhaar-check"><CheckIcon size={14} /></span>
        <div>
          <strong>Aadhaar ending •••• {aadhaar.last4}</strong>
          <span>Reference: {aadhaar.referenceNumber}</span>
        </div>
        <button type="button" className="glci-link-button" onClick={() => onChange("")} disabled={disabled}>
          Change
        </button>
      </div>
    );
  }

  return (
    <label className="glci-borrower-field glci-aadhaar-field">
      <span>Aadhaar number <em>*</em></span>
      <div className="glci-aadhaar-input-wrap">
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={visibleEntry}
          onChange={(event) => onChange(digitsOnly(event.target.value).slice(0, 12))}
          disabled={disabled}
          aria-label="Aadhaar number"
          placeholder="____ ____ ____"
          maxLength={14}
        />
        {digits.length === 12 && (
          <button
            type="button"
            className="glci-aadhaar-save"
            onClick={onSave}
            disabled={disabled}
          >
            Save
          </button>
        )}
      </div>
      <small>Enter all 12 digits, then select Save to secure Aadhaar.</small>
    </label>
  );
}

function BorrowerDocument({
  label,
  description,
  document,
  onUpload,
  onVerify,
  verificationRequired = false,
  disabled,
}) {
  const inputRef = useRef(null);
  const verified = verificationRequired && document.status === "Verified";
  const scanning = document.scanning || document.status === "Verifying";
  const uploaded = Boolean(document.preview) && !verified && !scanning;
  const isImage =
    String(document.preview || "").startsWith("data:image") ||
    /\.(jpg|jpeg|png)$/i.test(document.preview || "");
  const canView = Boolean(document.preview);
  const isPdf = String(document.preview || "").startsWith("data:application/pdf") || /\.pdf(?:$|\?)/i.test(document.preview || "");
  const ocrEntries = Object.entries(document.ocr || {}).filter(([key]) => key !== "confidence");

  return (
    <article className={`glci-kyc-card ${verified ? "verified" : ""} ${scanning ? "scanning" : ""} ${canView ? "has-file" : "empty"}`}>
      <div className="glci-kyc-card-head">
        <div>
          <span className="glci-kyc-card-icon"><FileIcon /></span>
          <strong>{label}<em>*</em></strong>
        </div>
        <span className={`glci-kyc-state ${verified ? "verified" : scanning ? "scanning" : uploaded ? "uploaded" : "required"}`}>
          {verified ? <CheckIcon size={11} /> : scanning ? <Spinner size={12} /> : null}
          {verified
            ? "Verified"
            : document.status === "Verifying"
              ? "Verifying"
              : document.scanning
                ? "Scanning"
                : uploaded
                  ? verificationRequired ? "Ready to verify" : "Uploaded"
                  : "Required"}
        </span>
      </div>

      {!canView ? (
        <button
          type="button"
          className="glci-kyc-dropzone"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          <span className="glci-kyc-upload-icon"><UploadIcon /></span>
          <span><strong>{description}</strong><small>PDF, JPG or PNG · Maximum 5 MB</small></span>
          <span className="glci-kyc-select">Choose file</span>
        </button>
      ) : (
        <div className="glci-kyc-card-body">
          <div className="glci-kyc-preview">
            {isImage ? (
              <img src={document.preview} alt={`${label} preview`} />
            ) : isPdf ? (
              <object data={document.preview} type="application/pdf" aria-label={`${label} PDF preview`}>
                <span className="glci-document-placeholder"><FileIcon /> PDF</span>
              </object>
            ) : (
              <span className="glci-document-placeholder"><FileIcon /></span>
            )}
            {document.scanning && (
              <div className="glci-scan-overlay" role="status">
                <span className="glci-scan-line" />
                <strong>Reading document</strong>
              </div>
            )}
          </div>

          <div className="glci-kyc-file-content">
            <div className="glci-kyc-file-row">
              <div><strong>{document.name}</strong><span>{document.source || "Uploaded document"}</span></div>
              <div className="glci-kyc-actions">
                <a href={document.preview} target="_blank" rel="noreferrer"><EyeIcon /> Preview</a>
                <button type="button" onClick={() => inputRef.current?.click()} disabled={disabled}><RefreshIcon /> Replace</button>
                {verificationRequired && document.ocr && !verified && (
                  <button
                    type="button"
                    className="glci-verify-button"
                    onClick={onVerify}
                    disabled={disabled || document.status === "Verifying"}
                  >
                    {document.status === "Verifying" ? <><Spinner size={11} /> Verifying…</> : "Verify PAN"}
                  </button>
                )}
              </div>
            </div>

            {document.scanning ? (
              <div className="glci-kyc-progress"><span /><small>Extracting document details…</small></div>
            ) : document.ocr ? (
              <div className="glci-kyc-ocr">
                <div className="glci-kyc-ocr-head">
                  <span><CheckIcon size={12} /> Details extracted</span>
                  <small>{document.ocr.confidence} confidence</small>
                </div>
                <dl>
                  {ocrEntries.slice(0, 4).map(([key, value]) => (
                    <div key={key}><dt>{key.replace(/([A-Z])/g, " $1")}</dt><dd>{value}</dd></div>
                  ))}
                </dl>
              </div>
            ) : null}

            {verificationRequired && verified && document.verification?.matches && (
              <div className="glci-pan-verification" role="status">
                <strong><CheckIcon size={12} /> PAN verification successful</strong>
                <div>
                  <span>Name <b>Match: Yes</b></span>
                  <span>Date of birth <b>Match: Yes</b></span>
                  <span>Father's name <b>Match: Yes</b></span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onUpload(file);
          event.target.value = "";
        }}
      />
    </article>
  );
}

function CustomerIdentity({
  lead = {},
  leadId = "",
  sectionKey = "customerIdentity",
  leadApiBase = DEFAULT_LEAD_API_BASE,
  updateApplicationData,
  updateStepStatus,
  updateLeadDetails,
  onLeadDetailsChange,
  setLead,
}) {
  const [leadDetailsJson, setLeadDetailsJson] = useState(() =>
    ensureLeadDetailsNodes(getLeadDetailsSource(lead), lead),
  );
  const [showCustomerSearch, setShowCustomerSearch] = useState(
    () => !findCustomerByMobile(lead.mobile),
  );
  const [searchMethod, setSearchMethod] = useState("CUSTOMER_ID");
  const [searchValue, setSearchValue] = useState("");
  const [searchRunning, setSearchRunning] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchResultStatus, setSearchResultStatus] = useState("IDLE");
  const [consentSending, setConsentSending] = useState(false);
  const [consentSeconds, setConsentSeconds] = useState(CONSENT_WAIT_SECONDS);
  const [notice, setNotice] = useState("");
  const [borrowerDraft, setBorrowerDraft] = useState(
    () =>
      ensureLeadDetailsNodes(getLeadDetailsSource(lead), lead).borrowerInformation
        .details,
  );
  const [borrowerErrors, setBorrowerErrors] = useState({});
  const [isBorrowerEditing, setIsBorrowerEditing] = useState(
    () =>
      ensureLeadDetailsNodes(getLeadDetailsSource(lead), lead).borrowerInformation
        .status !== "Saved",
  );
  const [isAddressIdentityEditing, setIsAddressIdentityEditing] = useState(false);
  const uploadTimers = useRef([]);
  const aadhaarTimer = useRef(null);
  const patchQueueRef = useRef(Promise.resolve());
  const initialDetailsRef = useRef(
    JSON.stringify(ensureLeadDetailsNodes(getLeadDetailsSource(lead), lead)),
  );
  const lastQueuedDetailsRef = useRef(initialDetailsRef.current);

  const identityNode = leadDetailsJson.customerIdentity;
  const consentNode = leadDetailsJson.customerConsent;
  const ntbNode = leadDetailsJson.ntbOnboarding;
  const borrowerNode = leadDetailsJson.borrowerInformation;
  const customerType = identityNode.customerType;
  const customerConfirmed = identityNode.customerIdentityConfirmed;
  const consentStatus = consentNode.status;
  const consentSentAt = consentNode.sentAt;
  const consentCapturedAt = consentNode.capturedAt;
  const ntbOnboardingStatus = ntbNode.status;
  const borrowerDocuments = borrowerNode.documents;
  const borrowerAadhaar = borrowerNode.aadhaar || {};
  const customer = useMemo(
    () =>
      identityNode.matchedCustomer || buildLeadCustomer(lead, leadDetailsJson),
    [identityNode.matchedCustomer, lead, leadDetailsJson],
  );
  const authOption = AUTHENTICATION_OPTIONS[searchMethod];

  const updateNode = useCallback((nodeName, patchOrUpdater) => {
    setLeadDetailsJson((current) => {
      const currentNode = current[nodeName];
      const patch =
        typeof patchOrUpdater === "function"
          ? patchOrUpdater(currentNode)
          : patchOrUpdater;
      const updatedNode = { ...currentNode, ...patch };
      const stepSnapshotKey = {
        customerIdentity: "identity",
        customerConsent: "consent",
        borrowerInformation: "borrowerInformation",
        ntbOnboarding: "ntbOnboarding",
      }[nodeName];
      const stepMeta =
        nodeName === "customerIdentityStep"
          ? updatedNode
          : {
              ...current.customerIdentityStep,
              ...(stepSnapshotKey ? { [stepSnapshotKey]: updatedNode } : {}),
            };
      return {
        ...current,
        updatedAt: new Date().toISOString(),
        [nodeName]: updatedNode,
        customerIdentityStep: {
          ...stepMeta,
          version: 1,
          status: stepMeta?.status || "In Progress",
          lastUpdatedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  useEffect(() => {
    const initialisedDetails = ensureLeadDetailsNodes(
      getLeadDetailsSource(lead),
      lead,
    );
    const serialisedDetails = JSON.stringify(initialisedDetails);
    lastQueuedDetailsRef.current = serialisedDetails;
    setLeadDetailsJson(initialisedDetails);
    setShowCustomerSearch(
      initialisedDetails.customerIdentity.customerType === "NTB" &&
        !initialisedDetails.customerIdentity.customerIdentityConfirmed,
    );
    setSearchValue("");
    setSearchError("");
    setSearchResultStatus("IDLE");
  }, [lead.id, lead.leadnumber, lead.leadNumber, lead.mobile, leadId]);

  useEffect(() => {
    setBorrowerDraft(borrowerNode.details);
    setBorrowerErrors({});
    setIsBorrowerEditing(borrowerNode.status !== "Saved");
  }, [borrowerNode.details, borrowerNode.status]);

  useEffect(() => {
    setLead?.((currentLead) => ({
      ...currentLead,
      leadDetails: leadDetailsJson,
    }));
    updateLeadDetails?.(leadDetailsJson);
    onLeadDetailsChange?.(leadDetailsJson);

    const serialisedDetails = JSON.stringify(leadDetailsJson);
    if (serialisedDetails === lastQueuedDetailsRef.current) return;
    lastQueuedDetailsRef.current = serialisedDetails;

    const leadIdentifier = getLeadIdentifier(lead, leadId);
    patchQueueRef.current = patchQueueRef.current
      .catch(() => null)
      .then(() => patchLeadDetails(leadApiBase, leadIdentifier, leadDetailsJson))
      .catch((error) => {
        setNotice(error.message || "Lead details could not be saved.");
      });
    // Parent callbacks commonly change identity on every render. Persistence
    // is intentionally driven only by a business change to leadDetailsJson.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadDetailsJson]);

  const consentCaptured = consentStatus === "Captured";
  const borrowerInformationSaved = borrowerNode.status === "Saved";
  const borrowerDocumentsComplete =
    borrowerDocuments.pan.status === "Verified" &&
    Boolean(borrowerDocuments.addressProof.preview) &&
    !borrowerDocuments.addressProof.scanning;
  const borrowerDocumentsRemaining =
    Number(borrowerDocuments.pan.status !== "Verified") +
    Number(
      !borrowerDocuments.addressProof.preview ||
        borrowerDocuments.addressProof.scanning,
    );
  const ntbOnboarded = ntbOnboardingStatus === "Completed";
  const profileReady =
    customerConfirmed &&
    (consentCaptured || consentStatus === "Sent");
  const stepComplete =
    customerConfirmed &&
    consentCaptured &&
    borrowerInformationSaved &&
    borrowerDocumentsComplete &&
    (customerType === "ETB" || ntbOnboarded);

  useEffect(() => {
    const nextStatus = stepComplete ? "Completed" : "In Progress";
    if (leadDetailsJson.customerIdentityStep?.status !== nextStatus) {
      updateNode("customerIdentityStep", { status: nextStatus });
    }
  }, [leadDetailsJson.customerIdentityStep?.status, stepComplete, updateNode]);

  useEffect(
    () => () => {
      uploadTimers.current.forEach((timer) => window.clearTimeout(timer));
      if (aadhaarTimer.current) window.clearTimeout(aadhaarTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (consentStatus !== "Sent") return undefined;

    const timer = window.setInterval(() => {
      setConsentSeconds((seconds) => (seconds > 0 ? seconds - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [consentStatus]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(""), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    updateApplicationData?.(sectionKey, {
      customerType,
      relationshipSource: "Verified mobile number at lead creation",
      customerIdentityConfirmed: customerConfirmed,
      customerName: customer.fullName,
      cbsCustomerId:
        customerType === "ETB" || ntbOnboarded ? customer.customerId : "",
      consentStatus,
      consentSentAt,
      consentCapturedAt,
      consentMode: consentCaptured ? "Secure mobile link / OTP" : "",
      applicationConsent: consentCaptured,
      cbsKycConsent: consentCaptured,
      internalEligibilityConsent: consentCaptured,
      conditionalCibilConsent: consentCaptured,
      communicationConsent: consentCaptured,
      authenticationParameter: identityNode.authenticationParameter,
      authenticationReference: identityNode.authenticationReference,
      kycStatus:
        customerType === "ETB" ? customer.kycStatus : ntbOnboardingStatus,
      borrowerInformation: borrowerNode,
      aadhaarReference: borrowerAadhaar.referenceNumber || "",
      documents: borrowerDocuments,
      freshKycDocumentsRequired: customerType === "NTB",
      leadDetails: leadDetailsJson,
    });

    updateStepStatus?.(
      "customer-identity",
      stepComplete ? "Completed" : "In Progress",
    );
    // Parent callbacks commonly change identity on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    consentCaptured,
    consentCapturedAt,
    consentSentAt,
    consentStatus,
    customer.fullName,
    customer.customerId,
    customer.kycStatus,
    customerConfirmed,
    customerType,
    borrowerDocuments,
    borrowerNode,
    ntbOnboarded,
    ntbOnboardingStatus,
    sectionKey,
    stepComplete,
  ]);

  const confirmCustomer = () => {
    updateNode("customerIdentity", {
      customerIdentityConfirmed: true,
      confirmedAt: getTimestamp(),
    });
    setShowCustomerSearch(false);
    setNotice(
      customerType === "ETB"
        ? "CBS customer confirmed against the lead."
        : "Lead customer confirmed. Continue with consent and onboarding.",
    );
  };

  const confirmationBeforeSearchRef = useRef(false);

  const startCustomerSearch = () => {
    confirmationBeforeSearchRef.current = customerConfirmed;
    updateNode("customerIdentity", {
      customerIdentityConfirmed: false,
      confirmedAt: "",
    });
    setShowCustomerSearch(true);
    setSearchError("");
    setSearchResultStatus("IDLE");
    setSearchValue("");
  };

  const cancelCustomerSearch = () => {
    if (confirmationBeforeSearchRef.current) {
      updateNode("customerIdentity", {
        customerIdentityConfirmed: true,
        confirmedAt: identityNode.confirmedAt || getTimestamp(),
      });
    }
    setShowCustomerSearch(false);
    setSearchError("");
    setSearchResultStatus("IDLE");
    setSearchValue("");
  };

  const searchCustomer = () => {
    const value = searchValue.trim();
    if (!authOption.validate(value)) {
      setSearchError(authOption.error);
      return;
    }

    setSearchError("");
    setSearchResultStatus("IDLE");
    setSearchRunning(true);

    const timer = window.setTimeout(() => {
      const match = findCustomerByAuthentication(searchMethod, value);
      const reference = createReference(
        searchMethod === "CUSTOMER_ID"
          ? "AUTH-CID"
          : searchMethod === "AADHAAR"
            ? "AUTH-AAD"
            : "AUTH-MOB",
      );
      setSearchRunning(false);
      setSearchValue("");

      if (!match) {
        setSearchResultStatus("NO_MATCH");
        updateNode("customerIdentity", {
          lastAuthenticationAttempt: {
            parameter: searchMethod,
            authenticationReference: reference,
            result: "NO_MATCH",
            attemptedAt: getTimestamp(),
          },
        });
        return;
      }

      setSearchResultStatus("MATCH_FOUND");
      setShowCustomerSearch(false);
      updateNode("customerIdentity", {
        customerType: "ETB",
        matchStatus: "MATCH_FOUND",
        matchSource: searchMethod,
        matchedCustomer: toPersistableCustomer(match),
        customerIdentityConfirmed: false,
        authenticationParameter: searchMethod,
        authenticationReference: reference,
        confirmedAt: "",
      });
      updateNode(
        "borrowerInformation",
        buildBorrowerInformation("ETB", toPersistableCustomer(match), lead),
      );
      updateNode("customerConsent", {
        status: "Pending",
        requestReference: "",
        sentAt: "",
        capturedAt: "",
        expiresAt: "",
        resendCount: 0,
      });
      setNotice(
        `${authOption.label} verified. CBS match updated with reference ${reference}.`,
      );
    }, 1800);

    uploadTimers.current.push(timer);
  };

  const continueAsNtb = () => {
    const attempt = identityNode.lastAuthenticationAttempt;

    updateNode("customerIdentity", {
      customerType: "NTB",
      matchStatus: "NO_MATCH",
      matchSource: attempt?.parameter || "VERIFIED_MOBILE",
      matchedCustomer: null,
      customerIdentityConfirmed: true,
      authenticationParameter: attempt?.parameter || "",
      authenticationReference: attempt?.authenticationReference || "",
      confirmedAt: getTimestamp(),
    });
    updateNode("customerConsent", {
      status: "Pending",
      requestReference: "",
      sentAt: "",
      capturedAt: "",
      expiresAt: "",
      resendCount: 0,
    });
    updateNode(
      "borrowerInformation",
      buildBorrowerInformation(
        "NTB",
        buildLeadCustomer(lead, leadDetailsJson),
        lead,
      ),
    );
    setShowCustomerSearch(false);
    setSearchValue("");
    setSearchError("");
    setSearchResultStatus("IDLE");
    setNotice("No CBS match found. Applicant confirmed as an NTB customer.");
  };

  const sendConsent = async () => {
    const targetPhoneNumber = normaliseIndianWhatsAppNumber(
      customer.mobile || lead.mobile,
    );

    if (!targetPhoneNumber) {
      setNotice("Lead mobile number is unavailable for WhatsApp consent.");
      return;
    }

    const resendCount =
      consentStatus === "Sent" || consentStatus === "Captured"
        ? (consentNode.resendCount || 0) + 1
        : consentNode.resendCount || 0;
    const expiry = new Date(Date.now() + 10 * 60 * 1000);
    const requestReference = createReference("CONSENT");
    const consentUrl = buildConsentLandingUrl({
      customerName: customer.fullName,
      email: customer.email === "—" ? lead.email : customer.email,
      leadId: getLeadIdentifier(lead, leadId),
      mobile: normaliseMobile(customer.mobile || lead.mobile),
      requestReference,
    });

    try {
      setConsentSending(true);

      await sendWhatsAppMessage({
        targetPhoneNumber,
        messageBody: buildConsentMessage({
          consentUrl,
          customerName: customer.fullName,
        }),
      });

      updateNode("customerConsent", {
        status: "Captured",
        requestReference,
        sentAt: getTimestamp(),
        capturedAt: getTimestamp(),
        expiresAt: getTimestamp(expiry),
        resendCount,
      });
      setNotice(
        resendCount
          ? "Consent request resent successfully on WhatsApp and marked as captured."
          : "Consent request sent successfully on WhatsApp and marked as captured.",
      );
    } catch (error) {
      console.error("Unable to send WhatsApp consent request:", error);
      setNotice(
        error.message ||
          "Unable to send the WhatsApp consent request.",
      );
    } finally {
      setConsentSending(false);
    }
  };

  const handleDocumentUpload = async (key, file) => {
    if (file.size > 5 * 1024 * 1024) {
      setNotice("Please upload a document up to 5 MB.");
      return;
    }

    try {
      const preview = await readFile(file);
      updateNode("borrowerInformation", (current) => ({
        documents: {
          ...current.documents,
          [key]: {
            name: file.name,
            preview,
            status: "Scanning",
            source: "Fresh upload",
            uploadedAt: getTimestamp(),
            verification: null,
            scanning: true,
            ocr: null,
          },
        },
      }));
      setNotice("Document uploaded. OCR scan started.");
      const timer = window.setTimeout(() => {
        updateNode("borrowerInformation", (current) => {
          const extractedDetails =
            key === "pan"
              ? {
                  ...current.details,
                  firstName: "Shivanjali",
                  lastName: "Gaikwad",
                  dateOfBirth: "1996-11-01",
                  pan: OCR_MOCKS.pan.pan,
                }
              : {
                  ...current.details,
                  addressLine1: "D-303, Fortune Estate, Hadapsar",
                  addressLine2: "Near Magarpatta Road",
                  pincode: "411028",
                  city: "Pune",
                  state: "Maharashtra",
                };
          return {
            details: extractedDetails,
            documents: {
              ...current.documents,
              [key]: {
                ...current.documents[key],
                status: "Uploaded",
                scanning: false,
                ocr: OCR_MOCKS[key],
                verifiedAt: "",
                verificationReference: "",
              },
            },
          };
        });
        setNotice(
          key === "pan"
            ? "PAN details extracted. Select Verify PAN to complete verification."
            : "Address proof details extracted and applied.",
        );
      }, 1900);
      uploadTimers.current.push(timer);
    } catch (error) {
      setNotice(error.message);
    }
  };

  const handleBorrowerChange = (event) => {
    const { name, value } = event.target;
    let normalisedValue = value;
    let updates = {};

    if (name === "mobile" || name === "pincode") {
      normalisedValue = digitsOnly(value).slice(0, name === "mobile" ? 10 : 6);
      const location = name === "pincode" ? PINCODE_DIRECTORY[normalisedValue] : null;
      updates = {
        [name]: normalisedValue,
        ...(location || (name === "pincode" && normalisedValue.length === 6 ? { city: "", state: "" } : {})),
      };
    } else if (name === "pan") {
      normalisedValue = value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 10);
      updates = { [name]: normalisedValue };
    } else {
      updates = { [name]: value };
    }

    setBorrowerDraft((current) => ({ ...current, ...updates }));
    updateNode("borrowerInformation", (current) => ({
      status: "Editing",
      details: { ...current.details, ...updates },
      documents:
        name === "pan" && current.documents.pan.status === "Verified"
          ? {
              ...current.documents,
              pan: {
                ...current.documents.pan,
                status: current.documents.pan.preview ? "Uploaded" : "Pending",
                verification: null,
                verifiedAt: "",
                verificationReference: "",
              },
            }
          : current.documents,
    }));
    setBorrowerErrors((current) => ({
      ...current,
      name: "",
      firstName: "",
      middleName: "",
      lastName: "",
      [name]: "",
    }));
  };

  const handleAadhaarChange = (value) => {
    if (aadhaarTimer.current) window.clearTimeout(aadhaarTimer.current);
    const digits = digitsOnly(value).slice(0, 12);
    if (!digits) {
      updateNode("borrowerInformation", {
        aadhaar: { status: "Pending", draftValue: "", last4: "", referenceNumber: "", processing: false },
      });
      return;
    }
    updateNode("borrowerInformation", {
      aadhaar: { status: "Entering", draftValue: digits, last4: "", referenceNumber: "", processing: false },
    });
  };

  const secureAadhaar = () => {
    const digits = digitsOnly(borrowerAadhaar.draftValue).slice(0, 12);
    if (digits.length !== 12) {
      setNotice("Enter all 12 Aadhaar digits before saving.");
      return;
    }

    updateNode("borrowerInformation", {
      aadhaar: {
        ...borrowerAadhaar,
        status: "Processing",
        processing: true,
      },
    });
    aadhaarTimer.current = window.setTimeout(() => {
      updateNode("borrowerInformation", {
        aadhaar: {
          status: "Reference generated",
          draftValue: "",
          last4: digits.slice(-4),
          referenceNumber: createReference("AAD-REF"),
          processing: false,
          generatedAt: getTimestamp(),
        },
      });
      setNotice("Aadhaar secured. Only the reference number is retained.");
    }, 900);
  };

  const verifyPan = () => {
    if (!borrowerDocuments.pan.preview || !borrowerDocuments.pan.ocr) {
      setNotice("Upload and scan the PAN card before verification.");
      return;
    }

    updateNode("borrowerInformation", (current) => ({
      documents: {
        ...current.documents,
        pan: { ...current.documents.pan, status: "Verifying" },
      },
    }));

    const timer = window.setTimeout(() => {
      updateNode("borrowerInformation", (current) => ({
        documents: {
          ...current.documents,
          pan: {
            ...current.documents.pan,
            status: "Verified",
            verifiedAt: getTimestamp(),
            verificationReference: createReference("PAN-VER"),
            verification: {
              result: "MATCHED",
              matches: { name: true, dateOfBirth: true, fatherName: true },
            },
          },
        },
      }));
      setNotice("PAN verified successfully. Name, date of birth and father's name matched.");
    }, 900);
    uploadTimers.current.push(timer);
  };

  const saveBorrowerInformation = () => {
    const errors = validateBorrower(borrowerDraft);
    if (!borrowerAadhaar.referenceNumber) {
      setNotice("Complete Aadhaar capture and wait for the reference number.");
      return;
    }
    if (Object.keys(errors).length) {
      setBorrowerErrors(errors);
      setNotice("Please correct the highlighted borrower information.");
      return;
    }

    const details = {
      ...borrowerDraft,
      firstName: borrowerDraft.firstName.trim(),
      middleName: borrowerDraft.middleName.trim(),
      lastName: borrowerDraft.lastName.trim(),
      email: borrowerDraft.email.trim().toLowerCase(),
      pan: borrowerDraft.pan.trim().toUpperCase(),
      addressLine1: borrowerDraft.addressLine1.trim(),
      addressLine2: borrowerDraft.addressLine2.trim(),
      city: borrowerDraft.city.trim(),
      state: borrowerDraft.state.trim(),
      pincode: borrowerDraft.pincode.trim(),
    };
    const fullName = [details.firstName, details.middleName, details.lastName]
      .filter(Boolean)
      .join(" ");

    const panChanged = details.pan !== borrowerNode.details.pan;
    updateNode("borrowerInformation", (current) => ({
      status: "Saved",
      savedAt: getTimestamp(),
      details,
      documents: panChanged
        ? {
            ...current.documents,
            pan: {
              ...current.documents.pan,
              status: current.documents.pan.preview ? "Uploaded" : "Pending",
              verification: null,
              verifiedAt: "",
              verificationReference: "",
            },
          }
        : current.documents,
    }));
    updateNode("customerIdentity", {
      matchedCustomer: {
        ...customer,
        ...details,
        fullName,
        dateOfBirth: formatDateForDisplay(details.dateOfBirth),
        mobile: `+91 ${details.mobile.slice(0, 5)} ${details.mobile.slice(5)}`,
      },
    });
    setIsBorrowerEditing(false);
    setBorrowerErrors({});
    setNotice("Borrower information saved successfully.");
  };

  const validateAddressIdentity = (details) => {
    const errors = {};

    if (!details.pan.trim()) {
      errors.pan = "PAN is required.";
    } else if (!/^[A-Z]{5}\d{4}[A-Z]$/.test(details.pan.trim().toUpperCase())) {
      errors.pan = "Enter a valid PAN, for example ABCDE1234F.";
    }

    if (!details.addressLine1.trim()) {
      errors.addressLine1 = "Address line 1 is required.";
    } else if (details.addressLine1.trim().length < 5) {
      errors.addressLine1 = "Enter the address line 1.";
    }

    if (details.city && details.city.trim().length < 2) {
      errors.city = "Enter the city.";
    } else if (!details.city.trim()) {
      errors.city = "City is required.";
    }

    if (!/^\d{6}$/.test(details.pincode.trim())) {
      errors.pincode = "Enter a valid 6-digit PIN code.";
    }

    return errors;
  };

  const saveAddressIdentity = () => {
    const errors = validateAddressIdentity(borrowerDraft);
    if (Object.keys(errors).length) {
      setBorrowerErrors((current) => ({ ...current, ...errors }));
      setNotice("Please correct the highlighted Address & Identity fields.");
      return;
    }

    const details = {
      ...borrowerNode.details,
      ...borrowerDraft,
      pan: borrowerDraft.pan.trim().toUpperCase(),
      addressLine1: borrowerDraft.addressLine1.trim(),
      addressLine2: borrowerDraft.addressLine2.trim(),
      city: borrowerDraft.city.trim(),
      pincode: borrowerDraft.pincode.trim(),
    };

    const fullName = [details.firstName, details.middleName, details.lastName]
      .filter(Boolean)
      .join(" ");

    updateNode("borrowerInformation", (current) => ({
      status: "Saved",
      savedAt: current.savedAt || getTimestamp(),
      details,
    }));

    updateNode("customerIdentity", {
      matchedCustomer: {
        ...customer,
        ...details,
        fullName,
        dateOfBirth: formatDateForDisplay(details.dateOfBirth),
        mobile: `+91 ${details.mobile.slice(0, 5)} ${details.mobile.slice(5)}`,
      },
    });

    setBorrowerDraft(details);
    setBorrowerErrors({});
    setIsAddressIdentityEditing(false);
    setNotice("Address & Identity saved successfully.");
  };

  const completeNtbOnboarding = () => {
    updateNode("ntbOnboarding", { status: "Running" });
    const timer = window.setTimeout(() => {
      const generatedCustomerId = generateCustomerId();
      const generatedCasaNumber = generateCasaNumber();
      updateNode("ntbOnboarding", {
        status: "Completed",
        completedAt: getTimestamp(),
      });
      updateNode("customerIdentity", {
        matchedCustomer: {
          ...customer,
          ...borrowerNode.details,
          fullName: [
            borrowerNode.details.firstName,
            borrowerNode.details.middleName,
            borrowerNode.details.lastName,
          ]
            .filter(Boolean)
            .join(" "),
          dateOfBirth: formatDateForDisplay(borrowerNode.details.dateOfBirth),
          customerId: generatedCustomerId,
          casaNumber: generatedCasaNumber,
          kycStatus: "Current",
          kycUpdatedAt: getTimestamp(),
        },
      });
      setNotice("KYC completed and CBS customer profile created.");
    }, 2600);
    uploadTimers.current.push(timer);
  };

  return (
    <div className="glci-page">
      {notice && (
        <div className="glci-toast" role="status">
          <CheckIcon /> {notice}
        </div>
      )}

      <header className={`glci-relationship ${customerType.toLowerCase()}`}>
        <div className="glci-relationship-main">
          <span className="glci-relationship-icon">
            <UserIcon />
          </span>
          <div>
            <span className="glci-eyebrow">
              IDENTIFIED DURING LEAD CREATION
            </span>
            <div className="glci-relationship-title">
              <h2>{customer.fullName}</h2>
              <StatusBadge variant={customerType === "ETB" ? "gold" : "light"}>
                {customerType}
              </StatusBadge>
              <StatusBadge variant="success">
                <CheckIcon size={11} /> Mobile verified
              </StatusBadge>
            </div>
            <p>
              {customerType === "ETB"
                ? "A CBS relationship was found using the verified lead mobile number. Confirm the matched customer before obtaining consent."
                : "No CBS relationship was found using the verified lead mobile number. Confirm the lead customer, obtain consent, then complete onboarding."}
            </p>
          </div>
        </div>
        <div className="glci-lead-meta">
          <span>Lead</span>
          <strong>{lead.id || lead.leadNumber || "GL-LEAD-10284"}</strong>
          <small>{customer.mobile}</small>
        </div>
      </header>

      <div className="glci-flow">
        <section className="glci-section">
          <SectionHeader
            number="1"
            title="Confirm customer identity"
            description={
              customerType === "ETB"
                ? "A CBS match was found using the verified mobile number. Confirm the match or update it using another authentication parameter."
                : "No CBS customer was found using the verified mobile number. Continue the applicant as a new-to-bank customer."
            }
            status={customerConfirmed ? "Confirmed" : "Action required"}
            statusVariant={customerConfirmed ? "success" : "pending"}
          />

          {customerType === "ETB" ? (
            <div className="glci-card glci-match-card">
              <div className="glci-avatar">
                {getInitials(customer.fullName)}
              </div>
              <div className="glci-match-details">
                <div className="glci-match-name">
                  <strong>{customer.fullName}</strong>
                  <span>CBS match found</span>
                </div>
                <div className="glci-match-grid">
                  <span>
                    <small>Registered mobile</small>
                    <strong>{customer.mobile}</strong>
                  </span>
                  <span>
                    <small>CBS Customer ID</small>
                    <strong>{customer.customerId}</strong>
                  </span>
                  <span>
                    <small>Home branch</small>
                    <strong>{customer.homeBranch}</strong>
                  </span>
                </div>
                {identityNode.authenticationReference && (
                  <div className="glci-reference-line">
                    Authentication reference{" "}
                    <strong>{identityNode.authenticationReference}</strong>
                  </div>
                )}
              </div>
              <div className="glci-match-actions">
                <button
                  type="button"
                  className="glci-primary-button"
                  onClick={confirmCustomer}
                  disabled={customerConfirmed}
                >
                  {customerConfirmed ? (
                    <>
                      <CheckIcon /> Match confirmed
                    </>
                  ) : (
                    "Confirm match"
                  )}
                </button>
                <button
                  type="button"
                  className="glci-secondary-button"
                  onClick={startCustomerSearch}
                >
                  Update match
                </button>
              </div>
            </div>
          ) : (
            <div className="glci-card glci-no-match-card">
              <span className="glci-no-match-icon">
                <UserIcon />
              </span>
              <div>
                <strong>No customer found in CBS</strong>
                <p>
                  No existing relationship is linked to verified mobile{" "}
                  {maskMobile(lead.mobile)}. Search using Customer ID, Aadhaar
                  or another mobile number, or continue through NTB onboarding.
                </p>
              </div>
              <button
                type="button"
                className="glci-primary-button"
                onClick={confirmCustomer}
                disabled={customerConfirmed}
              >
                {customerConfirmed ? (
                  <>
                    <CheckIcon /> NTB identity confirmed
                  </>
                ) : (
                  "Continue as NTB customer"
                )}
              </button>
            </div>
          )}

          {showCustomerSearch && !customerConfirmed && (
            <div className="glci-customer-search-wrap">
              <div className="glci-search-heading">
                <div>
                  <strong>Update customer match</strong>
                  <span>
                    Use one authentication parameter. The entered value is not
                    retained.
                  </span>
                </div>
                {customerType === "ETB" && (
                  <button
                    type="button"
                    className="glci-text-button"
                    onClick={cancelCustomerSearch}
                  >
                    Back to matched customer
                  </button>
                )}
              </div>
              <div className="glci-customer-search">
                <label>
                  <span>Authentication parameter</span>
                  <select
                    value={searchMethod}
                    onChange={(event) => {
                      setSearchMethod(event.target.value);
                      setSearchValue("");
                      setSearchError("");
                      setSearchResultStatus("IDLE");
                    }}
                  >
                    <option value="CUSTOMER_ID">Customer ID</option>
                    <option value="AADHAAR">Aadhaar Number</option>
                    <option value="MOBILE">Mobile Number</option>
                  </select>
                </label>
                <label className="glci-search-value">
                  <span>{authOption.label}</span>
                  <input
                    type={searchMethod === "AADHAAR" ? "password" : "text"}
                    inputMode={authOption.inputMode}
                    autoComplete="off"
                    maxLength={authOption.maxLength}
                    value={searchValue}
                    onChange={(event) => {
                      const nextValue =
                        searchMethod === "CUSTOMER_ID"
                          ? event.target.value.toUpperCase()
                          : digitsOnly(event.target.value);
                      setSearchValue(nextValue);
                      setSearchError("");
                      setSearchResultStatus("IDLE");
                    }}
                    placeholder={authOption.placeholder}
                    aria-invalid={Boolean(searchError)}
                    aria-describedby={
                      searchError ? "glci-auth-error" : undefined
                    }
                  />
                </label>
                <button
                  type="button"
                  className="glci-primary-button"
                  onClick={searchCustomer}
                  disabled={!searchValue.trim() || searchRunning}
                >
                  {searchRunning ? (
                    <>
                      <Spinner /> Searching CBS…
                    </>
                  ) : (
                    "Search CBS"
                  )}
                </button>
              </div>
              {searchError && (
                <div
                  id="glci-auth-error"
                  className="glci-field-error"
                  role="alert"
                >
                  {searchError}
                </div>
              )}
              {searchResultStatus === "NO_MATCH" && (
                <div className="glci-search-no-result" role="status">
                  <AlertIcon />
                  <div>
                    <strong>No customer found</strong>
                    <span>
                      Reference{" "}
                      {
                        identityNode.lastAuthenticationAttempt
                          ?.authenticationReference
                      }{" "}
                      · Check the value and try again, or continue the applicant
                      as a new-to-bank customer.
                    </span>
                  </div>
                  <button
                    type="button"
                    className="glci-primary-button"
                    onClick={continueAsNtb}
                  >
                    Continue as NTB
                  </button>
                </div>
              )}
              {searchMethod === "AADHAAR" && (
                <small className="glci-privacy-note">
                  Aadhaar is masked while typing. Only the generated
                  authentication reference is saved in lead details.
                </small>
              )}
            </div>
          )}
        </section>

        <section
          className={`glci-section ${!customerConfirmed ? "locked" : ""}`}
        >
          <SectionHeader
            number="2"
            title="Obtain customer consent"
            description="Send one secure consent request covering application processing, CBS/KYC use, internal checks, conditional CIBIL pull and communications."
            status={
              consentCaptured
                ? "Captured"
                : consentStatus === "Sent"
                  ? "Awaiting customer"
                  : "Pending"
            }
            statusVariant={
              consentCaptured
                ? "success"
                : consentStatus === "Sent"
                  ? "running"
                  : "pending"
            }
          />

          {!customerConfirmed && (
            <div className="glci-lock-note">
              <ShieldIcon /> Confirm the customer to enable consent.
            </div>
          )}

          <div className="glci-card glci-consent-card">
            <div className="glci-consent-summary">
              <span className="glci-consent-icon">
                <PhoneIcon />
              </span>
              <div>
                <strong>
                  {consentCaptured
                    ? "Consent received"
                    : consentStatus === "Sent"
                      ? "Consent request sent"
                      : "Send secure consent request"}
                </strong>
                <p>
                  WhatsApp consent link to{" "}
                  <b>{maskMobile(customer.mobile)}</b>
                </p>
              </div>
            </div>

            {consentCaptured ? (
              <div className="glci-consent-result">
                <span className="glci-success-mark">
                  <CheckIcon />
                </span>
                <div>
                  <strong>All preliminary consents recorded</strong>
                  <small>
                    Captured {consentCapturedAt} · Reference{" "}
                    {consentNode.requestReference}
                  </small>
                </div>
                <button
                  type="button"
                  className="glci-secondary-button"
                  onClick={sendConsent}
                  disabled={consentSending}
                >
                  {consentSending ? (
                    <>
                      <Spinner /> Sending...
                    </>
                  ) : (
                    <>
                      <RefreshIcon /> Resend
                    </>
                  )}
                </button>
              </div>
            ) : consentStatus === "Sent" ? (
              <div
                className="glci-consent-wait"
                role="status"
                aria-live="polite"
              >
                <span className="glci-success-mark">
                  <CheckIcon />
                </span>
                <div>
                  <strong>Consent request sent successfully</strong>
                  <small>
                    Reference {consentNode.requestReference} · Sent{" "}
                    {consentSentAt}
                  </small>
                  <small>
                    Link valid until {consentNode.expiresAt}. Waiting for
                    customer confirmation.
                  </small>
                </div>
                <div className="glci-consent-actions">
                  {consentSeconds > 0 && (
                    <span className="glci-countdown">{consentSeconds}s</span>
                  )}
                  <button
                    type="button"
                    className="glci-secondary-button"
                    onClick={sendConsent}
                    disabled={consentSending}
                  >
                    {consentSending ? (
                      <>
                        <Spinner /> Sending...
                      </>
                    ) : (
                      <>
                        <RefreshIcon /> Resend
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="glci-primary-button"
                onClick={sendConsent}
                disabled={!customerConfirmed || consentSending}
              >
                {consentSending ? (
                  <>
                    <Spinner /> Sending consent request...
                  </>
                ) : (
                  "Send consent request"
                )}
              </button>
            )}

            <div className="glci-consent-scope">
              {[
                "Gold Loan application processing",
                "CBS and KYC information retrieval",
                "Internal eligibility and knock-off checks",
                "CIC/CIBIL enquiry if the applicable threshold is met",
                "SMS, email and phone communication",
              ].map((item) => (
                <span key={item}>
                  <CheckIcon size={12} /> {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className={`glci-section ${!profileReady ? "locked" : ""}`}>
          <SectionHeader
            number="3"
            title="Borrower information"
            description={
              customerType === "ETB"
                ? "Review the available KYC documents first. OCR-extracted details can then be verified or corrected."
                : "Upload PAN and address proof first. The document scan will prefill the borrower details for review."
            }
            status={
              !profileReady
                ? "Locked"
                : isBorrowerEditing
                  ? customerType === "ETB"
                    ? "Editing"
                    : "Details required"
                  : borrowerDocumentsComplete
                    ? "Information saved"
                    : "Documents pending"
            }
            statusVariant={
              profileReady &&
              borrowerInformationSaved &&
              borrowerDocumentsComplete
                ? "success"
                : "pending"
            }
          />

          {!profileReady && (
            <div className="glci-lock-note">
              <ShieldIcon /> Confirm the customer and capture consent before
              borrower details are processed.
            </div>
          )}

          <div className="glci-profile-card">
            <div className="glci-document-section glci-document-section-primary">
              <div className="glci-document-section-head">
                <div>
                  <strong>Upload KYC documents</strong>
                  <span>Upload PAN and one address proof. OCR will populate the fields below.</span>
                </div>
                <StatusBadge variant={borrowerDocumentsComplete ? "success" : "pending"}>
                  {borrowerDocumentsComplete ? <CheckIcon size={11} /> : <AlertIcon />} {" "}
                  {borrowerDocumentsComplete
                    ? "KYC documents ready"
                    : `${borrowerDocumentsRemaining} document${borrowerDocumentsRemaining === 1 ? "" : "s"} required`}
                </StatusBadge>
              </div>

              <div className="glci-borrower-document-grid">
                <BorrowerDocument
                  label="PAN card"
                  description="Upload PAN card"
                  document={borrowerDocuments.pan}
                  onUpload={(file) => handleDocumentUpload("pan", file)}
                  onVerify={verifyPan}
                  verificationRequired
                  disabled={ntbOnboardingStatus === "Running"}
                />
                <BorrowerDocument
                  label="Address proof"
                  description="Upload Voter ID, Aadhaar or another accepted OVD"
                  document={borrowerDocuments.addressProof}
                  onUpload={(file) => handleDocumentUpload("addressProof", file)}
                  disabled={ntbOnboardingStatus === "Running"}
                />
              </div>

            </div>

            <div className="glci-borrower-controlbar">
              <span>
                {borrowerDocumentsComplete ? (
                  <><CheckIcon size={13} /> Fields populated from KYC scan</>
                ) : (
                  <><AlertIcon /> Upload documents to populate borrower details</>
                )}
              </span>
              <div className="glci-profile-actions">
                {!isBorrowerEditing ? (
                  <button
                    type="button"
                    className="glci-secondary-button"
                    onClick={() => {
                      setBorrowerDraft(borrowerNode.details);
                      setBorrowerErrors({});
                      setIsBorrowerEditing(true);
                      updateNode("borrowerInformation", { status: "Editing" });
                    }}
                  >
                    <PencilIcon /> Edit information
                  </button>
                ) : (
                  borrowerNode.savedAt && (
                    <button
                      type="button"
                      className="glci-link-button"
                      onClick={() => {
                        setBorrowerDraft(borrowerNode.details);
                        setBorrowerErrors({});
                        setIsBorrowerEditing(false);
                        updateNode("borrowerInformation", { status: "Saved" });
                      }}
                    >
                      Cancel
                    </button>
                  )
                )}
              </div>
            </div>

            {isBorrowerEditing ? (
              <div className="glci-borrower-form">
                <BorrowerField
                  label="First name"
                  name="firstName"
                  value={borrowerDraft.firstName}
                  onChange={handleBorrowerChange}
                  error={borrowerErrors.firstName}
                  required
                />
                <BorrowerField
                  label="Last name"
                  name="lastName"
                  value={borrowerDraft.lastName}
                  onChange={handleBorrowerChange}
                  error={borrowerErrors.lastName}
                  required
                />
                <BorrowerField
                  label="Date of birth"
                  name="dateOfBirth"
                  type="date"
                  value={borrowerDraft.dateOfBirth}
                  onChange={handleBorrowerChange}
                  error={borrowerErrors.dateOfBirth}
                  required
                />
                <BorrowerField
                  label="Gender"
                  name="gender"
                  value={borrowerDraft.gender}
                  onChange={handleBorrowerChange}
                  error={borrowerErrors.gender}
                  options={[
                    "Female",
                    "Male",
                    "Transgender",
                    "Prefer not to say",
                  ]}
                  required
                />
                <BorrowerField
                  label="Mobile number"
                  name="mobile"
                  value={borrowerDraft.mobile}
                  onChange={handleBorrowerChange}
                  error={borrowerErrors.mobile}
                  inputMode="numeric"
                  maxLength={10}
                  required
                />
                <BorrowerField
                  label="Email"
                  name="email"
                  type="email"
                  value={borrowerDraft.email}
                  onChange={handleBorrowerChange}
                  error={borrowerErrors.email}
                />
                <div className="glci-form-divider"><span>Identity & address</span></div>
                <BorrowerField
                  label="PAN"
                  name="pan"
                  value={borrowerDraft.pan}
                  onChange={handleBorrowerChange}
                  error={borrowerErrors.pan}
                  maxLength={10}
                  required
                />
                <AadhaarCapture
                  aadhaar={borrowerAadhaar}
                  onChange={handleAadhaarChange}
                  onSave={secureAadhaar}
                />
                <BorrowerField
                  label="Address line 1"
                  name="addressLine1"
                  value={borrowerDraft.addressLine1}
                  onChange={handleBorrowerChange}
                  error={borrowerErrors.addressLine1}
                  maxLength={250}
                  wide
                  required
                />
                <BorrowerField
                  label="Address line 2"
                  name="addressLine2"
                  value={borrowerDraft.addressLine2}
                  onChange={handleBorrowerChange}
                  error={borrowerErrors.addressLine2}
                  maxLength={250}
                  wide
                />
                <BorrowerField
                  label="PIN code"
                  name="pincode"
                  value={borrowerDraft.pincode}
                  onChange={handleBorrowerChange}
                  error={borrowerErrors.pincode}
                  inputMode="numeric"
                  maxLength={6}
                  required
                />
                <BorrowerField
                  label="City"
                  name="city"
                  value={borrowerDraft.city}
                  onChange={handleBorrowerChange}
                  error={borrowerErrors.city}
                  readOnly
                  required
                />
                <BorrowerField
                  label="State"
                  name="state"
                  value={borrowerDraft.state}
                  onChange={handleBorrowerChange}
                  error={borrowerErrors.state}
                  readOnly
                  required
                />
                <div className="glci-borrower-form-actions">
                  <span>
                    Fields marked * are mandatory. Borrower age must be between
                    18 and 75 years.
                  </span>
                  <button
                    type="button"
                    className="glci-primary-button"
                    onClick={saveBorrowerInformation}
                  >
                    Save borrower information
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="glci-detail-grid">
                  <Detail
                    label="First name"
                    value={borrowerNode.details.firstName}
                  />
                  <Detail
                    label="Last name"
                    value={borrowerNode.details.lastName}
                  />
                  <Detail
                    label="Date of birth"
                    value={formatDateForDisplay(
                      borrowerNode.details.dateOfBirth,
                    )}
                  />
                  <Detail label="Gender" value={borrowerNode.details.gender} />
                  <Detail
                    label="Mobile number"
                    value={borrowerNode.details.mobile}
                    verified={customerType === "ETB"}
                  />
                  <Detail
                    label="Email"
                    value={borrowerNode.details.email}
                    verified={customerType === "ETB"}
                  />
                  <Detail label="PAN" value={borrowerNode.details.pan} verified={Boolean(borrowerNode.details.pan)} />
                  <Detail
                    label="Aadhaar reference"
                    value={borrowerAadhaar.referenceNumber || "Pending"}
                    verified={Boolean(borrowerAadhaar.referenceNumber)}
                    wide
                  />
                  <Detail label="Address" value={[borrowerNode.details.addressLine1, borrowerNode.details.addressLine2].filter(Boolean).join(", ")} wide />
                  <Detail label="PIN code" value={borrowerNode.details.pincode} />
                  <Detail label="City" value={borrowerNode.details.city} />
                  <Detail label="State" value={borrowerNode.details.state} />
                  {customerType === "ETB" && (
                    <>
                      <Detail
                        label="KYC status"
                        value={`${customer.kycStatus} · ${customer.kycUpdatedAt}`}
                        verified
                      />
                      <Detail label="CKYC number" value={customer.ckycNumber} />
                      <Detail label="Home branch" value={customer.homeBranch} />
                      <Detail
                        label="Risk category"
                        value={customer.riskCategory}
                      />
                    </>
                  )}
                </div>
              </>
            )}

            <div className="glci-document-section glci-document-section-legacy">
              <div className="glci-document-section-head">
                <div>
                  <strong>KYC documents</strong>
                  <span>
                    Upload PAN and address proof for OCR verification.
                  </span>
                </div>
                <StatusBadge
                  variant={borrowerDocumentsComplete ? "success" : "pending"}
                >
                  {borrowerDocumentsComplete ? (
                    <CheckIcon size={11} />
                  ) : (
                    <AlertIcon />
                  )}{" "}
                  {borrowerDocumentsComplete
                    ? "Documents complete"
                    : "Action required"}
                </StatusBadge>
              </div>
              <div className="glci-borrower-document-grid">
                <BorrowerDocument
                  label="PAN Card"
                  description="Upload PAN card"
                  document={borrowerDocuments.pan}
                  onUpload={(file) => handleDocumentUpload("pan", file)}
                  onVerify={verifyPan}
                  verificationRequired
                  disabled={ntbOnboardingStatus === "Running"}
                />
                <BorrowerDocument
                  label="Address proof"
                  description="Upload an accepted OVD / address proof"
                  document={borrowerDocuments.addressProof}
                  onUpload={(file) =>
                    handleDocumentUpload("addressProof", file)
                  }
                  disabled={ntbOnboardingStatus === "Running"}
                />
              </div>

              {false && borrowerDocumentsComplete && (
                <div className="glci-address-section">
                  <div className="glci-address-section-head">
                    <div>
                      <strong>Address & Identity</strong>
                    </div>
                    <div className="glci-profile-actions">
                      {!isAddressIdentityEditing ? (
                        <button
                          type="button"
                          className="glci-secondary-button"
                          onClick={() => {
                            setBorrowerDraft(borrowerNode.details);
                            setBorrowerErrors({});
                            setIsAddressIdentityEditing(true);
                          }}
                          disabled={ntbOnboardingStatus === "Running"}
                        >
                          <PencilIcon /> Edit information
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="glci-link-button"
                          onClick={() => {
                            setBorrowerDraft(borrowerNode.details);
                            setBorrowerErrors({});
                            setIsAddressIdentityEditing(false);
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                    <StatusBadge variant="success">
                      <CheckIcon size={11} /> Documents uploaded
                    </StatusBadge>
                  </div>

                  {isAddressIdentityEditing ? (
                    <div className="glci-borrower-form">
                      <BorrowerField
                        label="PAN"
                        name="pan"
                        value={borrowerDraft.pan}
                        onChange={handleBorrowerChange}
                        error={borrowerErrors.pan}
                        maxLength={10}
                        required
                      />
                      <BorrowerField
                        label="Address line 1"
                        name="addressLine1"
                        value={borrowerDraft.addressLine1}
                        onChange={handleBorrowerChange}
                        error={borrowerErrors.addressLine1}
                        maxLength={250}
                        required
                      />
                      <BorrowerField
                        label="Address line 2"
                        name="addressLine2"
                        value={borrowerDraft.addressLine2}
                        onChange={handleBorrowerChange}
                        error={borrowerErrors.addressLine2}
                        maxLength={250}
                      />
                      <BorrowerField
                        label="City"
                        name="city"
                        value={borrowerDraft.city}
                        onChange={handleBorrowerChange}
                        error={borrowerErrors.city}
                        maxLength={50}
                        required
                      />
                      <BorrowerField
                        label="ZIP / Postcode"
                        name="pincode"
                        value={borrowerDraft.pincode}
                        onChange={handleBorrowerChange}
                        error={borrowerErrors.pincode}
                        inputMode="numeric"
                        maxLength={6}
                        required
                      />

                      <div className="glci-borrower-form-actions">
                        <span>Fields marked * are mandatory.</span>
                        <button
                          type="button"
                          className="glci-primary-button"
                          onClick={saveAddressIdentity}
                          disabled={ntbOnboardingStatus === "Running"}
                        >
                          Save Address & Identity
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="glci-detail-grid">
                      <Detail
                        label="PAN"
                        value={borrowerNode.details.pan}
                        required
                      />
                      <Detail
                        label="Address line 1"
                        value={borrowerNode.details.addressLine1}
                        required
                      />
                      <Detail
                        label="Address line 2"
                        value={borrowerNode.details.addressLine2}
                      />
                      <Detail
                        label="City"
                        value={borrowerNode.details.city}
                        required
                      />
                      <Detail
                        label="ZIP / Postcode"
                        value={borrowerNode.details.pincode}
                        required
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {customerType === "NTB" && (
            <div className={`glci-ntb-card ${ntbOnboarded ? "created" : "pending"}`}>
              <div className="glci-ntb-header">
                <div className="glci-ntb-header-text">
                  <span className="glci-ntb-eyebrow">
                    {ntbOnboarded ? "CBS INTEGRATION SUCCESSFUL" : "NEW TO BANK ONBOARDING"}
                  </span>
                  <h4>
                    {ntbOnboarded
                      ? "CBS Customer Profile Created"
                      : "Create customer profile after borrower and document verification"}
                  </h4>
                </div>

                <button
                  type="button"
                  className="glci-primary-button"
                  onClick={completeNtbOnboarding}
                  disabled={
                    !borrowerInformationSaved ||
                    !borrowerDocumentsComplete ||
                    ntbOnboardingStatus === "Running" ||
                    ntbOnboarded
                  }
                >
                  {ntbOnboardingStatus === "Running" ? (
                    <>
                      <Spinner /> Creating customer…
                    </>
                  ) : ntbOnboarded ? (
                    <>
                      <CheckIcon /> Profile active
                    </>
                  ) : (
                    "Complete KYC & create customer"
                  )}
                </button>
              </div>

              {ntbOnboarded && (
                <div className="glci-generated-credentials">
                  <div className="glci-credential-box">
                    <span className="glci-cred-label">CBS CUSTOMER ID</span>
                    <div className="glci-cred-value-row">
                      <strong className="glci-cred-value">{customer.customerId}</strong>
                      <button
                        type="button"
                        className="glci-copy-btn"
                        onClick={() => navigator.clipboard.writeText(customer.customerId)}
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="glci-credential-box">
                    <span className="glci-cred-label">CASA ACCOUNT NUMBER</span>
                    <div className="glci-cred-value-row">
                      <strong className="glci-cred-value">{customer.casaNumber || "Pending"}</strong>
                      <button
                        type="button"
                        className="glci-copy-btn"
                        onClick={() => navigator.clipboard.writeText(customer.casaNumber || "")}
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          </div>
        </section>
      </div>

      <footer
        className={`glci-readiness ${stepComplete ? "ready" : "pending"}`}
      >
        <span>{stepComplete ? <CheckIcon /> : <AlertIcon />}</span>
        <div>
          <strong>
            {stepComplete
              ? "Customer verification and consent complete"
              : "Complete the outstanding Step 1 requirements"}
          </strong>
          <p>
            {stepComplete
              ? "Proceed to Facility, Branch & Loan Details. CIBIL consent is already recorded; the bureau pull remains conditional on the amount threshold."
              : customerType === "ETB"
                ? "Customer confirmation and consent are mandatory before continuing."
                : "Customer confirmation, consent and NTB onboarding are mandatory before continuing."}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default CustomerIdentity;
