import { useEffect, useRef, useState } from "react";
import "./CustomerIdentityPage.css";
import {
  removeUploadedDocument,
  saveUploadedDocument
} from "../../utils/documentStore";

/* ── AWS S3 Upload API ─────────────────────────────────────────────── */
const GENERATE_UPLOAD_URL_API = import.meta.env.VITE_GENERATE_UPLOAD_URL_API;

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png"
];

/* ── Icons ───────────────────────────────────────────────────────────── */
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.7">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const AlertIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const UploadIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="M17 8 12 3 7 8" />
    <path d="M12 3v12" />
  </svg>
);

const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M21 12a9 9 0 0 1-15.2 6.5" />
    <path d="M3 12A9 9 0 0 1 18.2 5.5" />
    <path d="M18 3v5h-5" />
    <path d="M6 21v-5h5" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    <path d="m9 12 2 2 4-5" />
  </svg>
);

const ScanIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M4 7V5a1 1 0 0 1 1-1h2" />
    <path d="M17 4h2a1 1 0 0 1 1 1v2" />
    <path d="M20 17v2a1 1 0 0 1-1 1h-2" />
    <path d="M7 20H5a1 1 0 0 1-1-1v-2" />
    <path d="M7 12h10" />
  </svg>
);

const DocumentIcon = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
    <path d="M14 2v6h6" />
    <path d="M16 13H8M16 17H8M10 9H8" />
  </svg>
);

const PencilIcon = () => (
  <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="cid-spin-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const ConsentCheckIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.8">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

/* ── Constants ───────────────────────────────────────────────────────── */
const OCR_RESULT = {
  panNumber: "ABCDE1234F",
  firstName: "Rahul",
  lastName: "Sharma",
  fatherName: "Mahesh Sharma",
  dateOfBirth: "1992-08-14"
};

const VERIFY_SCENARIOS = [
  {
    status: "Verified",
    variant: "success",
    headline: "Identity confirmed",
    subline: "Name, date of birth and PAN number match NSDL records."
  },
  {
    status: "Mismatch",
    variant: "warning",
    headline: "Name on PAN differs",
    subline: `NSDL records show "Rahul Sharma" — the application name does not match. Please review and correct before proceeding.`
  },
  {
    status: "Mismatch",
    variant: "warning",
    headline: "Date of birth mismatch",
    subline: "The date of birth on record does not match NSDL data. Confirm with the customer and update before re-submitting."
  },
  {
    status: "NotFound",
    variant: "error",
    headline: "PAN not found in database",
    subline: "No records were returned for the entered PAN number. Verify the PAN and ensure the document is legible."
  }
];

/* ── Helpers ─────────────────────────────────────────────────────────── */
const formatDob = (iso) => {
  if (!iso) return "";

  const [y, m, d] = iso.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return `${+d} ${months[+m - 1]} ${y}`;
};

/* ── Demo seed data ──────────────────────────────────────────────────── */
const DEMO_NSDL_REF = "NSDL-748291";
const DEMO_VERIFIED_AT = "16 Jun, 03:25 PM";

const buildInitialData = (stepData = {}, lead = {}, isCoApplicant = false) => {
  if (isCoApplicant) {
    return {
      consentStatus: stepData.consentStatus || "Pending",
      consentLinkSentAt: stepData.consentLinkSentAt || "",
      consentCapturedAt: stepData.consentCapturedAt || "",
      panDocumentName: stepData.panDocumentName || "",
      panDocumentPreview: stepData.panDocumentPreview || "",
      panDocumentS3ObjectKey: stepData.panDocumentS3ObjectKey || "",
      panOcrStatus: stepData.panOcrStatus || "Pending",
      panVerificationStatus: stepData.panVerificationStatus || "Pending",
      panNumber: stepData.panNumber || "",
      firstName: stepData.firstName || lead.firstName || "",
      lastName: stepData.lastName || lead.lastName || "",
      fatherName: stepData.fatherName || "",
      dateOfBirth: stepData.dateOfBirth || "",
      mobileNumber: stepData.mobileNumber || lead.mobile || "",
      email: stepData.email || "",
      mobileVerified: stepData.mobileVerified || false,
      emailVerified: stepData.emailVerified || false,
      panVerified: stepData.panVerified !== undefined ? stepData.panVerified : false,
      nsdlReferenceNumber: stepData.nsdlReferenceNumber || "",
      nsdlVerifiedAt: stepData.nsdlVerifiedAt || ""
    };
  }

  return {
    consentStatus: stepData.consentStatus || "Captured",
    consentLinkSentAt: stepData.consentLinkSentAt || "16 Jun, 03:20 PM",
    consentCapturedAt: stepData.consentCapturedAt || "16 Jun, 03:21 PM",
    panDocumentName: stepData.panDocumentName || "PanCard.jpg",
    panDocumentPreview: stepData.panDocumentPreview || "/images/PanCard.jpg",
    panDocumentS3ObjectKey: stepData.panDocumentS3ObjectKey || "",
    panOcrStatus: stepData.panOcrStatus || "Completed",
    panVerificationStatus: stepData.panVerificationStatus || "Verified",
    panNumber: stepData.panNumber || "CIJPG1001N",
    firstName: stepData.firstName || lead.firstName || "Shivanjali",
    lastName: stepData.lastName || lead.lastName || "Gaikwad",
    fatherName: stepData.fatherName || "Sadanand Gaikwad",
    dateOfBirth: stepData.dateOfBirth || "1996-11-01",
    mobileNumber: stepData.mobileNumber || lead.mobile || "",
    email: stepData.email || "",
    mobileVerified: stepData.mobileVerified || false,
    emailVerified: stepData.emailVerified || false,
    panVerified: stepData.panVerified !== undefined ? stepData.panVerified : true,
    nsdlReferenceNumber: stepData.nsdlReferenceNumber || DEMO_NSDL_REF,
    nsdlVerifiedAt: stepData.nsdlVerifiedAt || DEMO_VERIFIED_AT
  };
};

const validateFile = (file) => {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return "Invalid file type. Please upload only PDF, JPG, JPEG or PNG files.";
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "File size is too large. Please upload a file up to 5 MB.";
  }

  return "";
};

const readFileAsDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to read selected file."));

    reader.readAsDataURL(file);
  });
};

const uploadFileToS3 = (uploadUrl, file, contentType, onProgress) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", contentType);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress?.(progress);
      }
    };

    xhr.onload = () => {
      console.log("S3 upload response status:", xhr.status);
      console.log("S3 upload response body:", xhr.responseText);

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`S3 upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error while uploading file to S3."));
    };

    xhr.send(file);
  });
};

/* ── Field component ─────────────────────────────────────────────────── */
const Field = ({ label, value, placeholder, type = "text", onChange, editing, wide }) => (
  <div className={`cid-field${wide ? " wide" : ""}`}>
    <span className="cid-field-label">{label}</span>

    {editing ? (
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className="cid-field-input"
      />
    ) : (
      <div className="cid-field-readonly">
        {value || <span className="cid-field-empty">—</span>}
      </div>
    )}
  </div>
);

/* ── Component ───────────────────────────────────────────────────────── */
function CustomerIdentityPage({
  lead,
  stepData = {},
  sectionKey = "customerIdentity",
  updateApplicationData,
  updateStepStatus,
  isCoApplicant = false
}) {
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState(() => buildInitialData(stepData, lead, isCoApplicant));
  const [notice, setNotice] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isConsentWaiting, setIsConsentWaiting] = useState(false);
  const [isReadingDocument, setIsReadingDocument] = useState(false);
  const [isUploadingToS3, setIsUploadingToS3] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isVerifyingPan, setIsVerifyingPan] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [ocrDone, setOcrDone] = useState(
    () => buildInitialData(stepData, lead, isCoApplicant).panOcrStatus === "Completed"
  );
  const [verifyResult, setVerifyResult] = useState(() => {
    const init = buildInitialData(stepData, lead, isCoApplicant);
    if (init.panVerificationStatus === "Verified") {
      return {
        status: "Verified",
        variant: "success",
        headline: "Identity confirmed",
        subline: "Name, date of birth and PAN number match NSDL records.",
        nsdlRef: init.nsdlReferenceNumber,
        verifiedAt: init.nsdlVerifiedAt
      };
    }
    return null;
  });
  const [verifyAttempts, setVerifyAttempts] = useState(0);

  const [cibilFetching, setCibilFetching] = useState(false);
  const [cibilFetched, setCibilFetched] = useState(() => {
    const init = buildInitialData(stepData, lead, isCoApplicant);
    return init.panVerificationStatus === "Verified";
  });

  const consentCaptured = formData.consentStatus === "Captured";
  const consentSent = formData.consentStatus === "Sent";
  const panUploaded = Boolean(formData.panDocumentPreview);
  const panVerified = formData.panVerificationStatus === "Verified";

  const isPdf =
    formData.panDocumentName?.toLowerCase().endsWith(".pdf") ||
    String(formData.panDocumentPreview).startsWith("data:application/pdf");

  const isImage =
    String(formData.panDocumentPreview).startsWith("data:image") ||
    /\.(jpg|jpeg|png|webp|gif)$/i.test(formData.panDocumentPreview);

  const syncParent = (updates) => updateApplicationData?.(sectionKey, updates);

  const setValues = (updates) =>
    setFormData((prev) => {
      const next = { ...prev, ...updates };
      syncParent(updates);
      return next;
    });

  const setField = (name, value) => setValues({ [name]: value });

  const showNotice = (msg) => {
    setNotice(msg);
    window.setTimeout(() => setNotice(""), 2800);
  };

  const getTimestamp = () =>
    new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });

  /* ── Consent ── */
  const sendConsent = () => {
    setValues({
      consentStatus: "Sent",
      consentLinkSentAt: getTimestamp(),
      consentCapturedAt: ""
    });

    setIsConsentWaiting(true);
  };

  useEffect(() => {
    if (!isConsentWaiting) return undefined;

    const timer = window.setTimeout(() => {
      setValues({
        consentStatus: "Captured",
        consentCapturedAt: getTimestamp()
      });

      setIsConsentWaiting(false);
      showNotice("Customer consent received.");
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [isConsentWaiting]); // eslint-disable-line

  /* ── Step status ── */
  useEffect(() => {
    if (consentCaptured && panVerified) {
      updateStepStatus?.("customer-identity", "Completed");
      return;
    }

    if (consentCaptured || panUploaded || ocrDone) {
      updateStepStatus?.("customer-identity", "In Progress");
    }
  }, [consentCaptured, panUploaded, ocrDone, panVerified, updateStepStatus]); // eslint-disable-line

  /* ── Generate pre-signed URL from Lambda ── */
  const generateUploadUrl = async (file) => {
    console.log("Calling Lambda API to generate S3 pre-signed URL...");
    console.log("Lambda API URL:", GENERATE_UPLOAD_URL_API);

    if (!GENERATE_UPLOAD_URL_API) {
      throw new Error("Upload API URL is missing. Please check VITE_GENERATE_UPLOAD_URL_API in .env file.");
    }

    const applicantId = lead?.applicantId || lead?.id || "APP-1001";

    const response = await fetch(GENERATE_UPLOAD_URL_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        documentType: "PAN",
        applicantId
      })
    });

    const data = await response.json();

    console.log("Lambda response status:", response.status);
    console.log("Lambda response data:", data);

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to generate S3 upload URL.");
    }

    return data;
  };

  /* ── File upload → S3 → local preview → auto-extract ── */
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];

    console.log("PAN file selected:", file);

    setUploadError("");
    setUploadProgress(0);

    if (!file) return;

    const validationError = validateFile(file);

    if (validationError) {
      setUploadError(validationError);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    try {
      setIsUploadingToS3(true);
      setIsReadingDocument(false);
      setOcrDone(false);
      setVerifyResult(null);
      setIsEditing(false);

      setValues({
        panDocumentName: "",
        panDocumentPreview: "",
        panDocumentS3ObjectKey: "",
        panOcrStatus: "Pending",
        panVerificationStatus: "Pending",
        panVerified: false,
        nsdlReferenceNumber: "",
        nsdlVerifiedAt: ""
      });

      console.log("Step 1: Generate S3 upload URL");
      const presignData = await generateUploadUrl(file);

      console.log("Step 2: Upload file to S3");
      await uploadFileToS3(
        presignData.uploadUrl,
        file,
        file.type,
        setUploadProgress
      );

      console.log("S3 upload successful");
      console.log("S3 object key:", presignData.objectKey);

      console.log("Step 3: Creating local preview");
      const previewValue = await readFileAsDataUrl(file);

      setValues({
        panDocumentName: file.name,
        panDocumentPreview: previewValue,
        panDocumentS3ObjectKey: presignData.objectKey,
        panOcrStatus: "Ready",
        panVerificationStatus: "Pending",
        panVerified: false,
        nsdlReferenceNumber: "",
        nsdlVerifiedAt: ""
      });

      saveUploadedDocument({
        applicant: "Primary Applicant",
        type: "Identity Proof",
        subtype: "PAN Card",
        source: "Customer Identity",
        fileName: file.name,
        fileType: file.type.startsWith("image/") ? "Image" : "PDF / Document",
        previewUrl: previewValue,
        s3ObjectKey: presignData.objectKey,
        ocrStatus: "Ready",
        verificationStatus: "Pending Review"
      });

      showNotice("PAN document uploaded successfully to S3.");

      console.log("Step 4: Starting mock OCR extraction");

      window.setTimeout(() => {
        setIsReadingDocument(true);

        window.setTimeout(() => {
          setValues({
            ...OCR_RESULT,
            panOcrStatus: "Completed",
            panVerificationStatus: "Pending",
            panVerified: false
          });

          saveUploadedDocument({
            applicant: "Primary Applicant",
            type: "Identity Proof",
            subtype: "PAN Card",
            source: "Customer Identity",
            fileName: file.name,
            fileType: file.type.startsWith("image/") ? "Image" : "PDF / Document",
            previewUrl: previewValue,
            s3ObjectKey: presignData.objectKey,
            ocrStatus: "Completed",
            verificationStatus: "Pending Review"
          });

          setIsReadingDocument(false);
          setOcrDone(true);
          setIsEditing(true);
        }, 2800);
      }, 500);
    } catch (error) {
      console.error("PAN S3 upload failed:", error);

      setUploadError(
        error.message ||
          "PAN document upload failed. Please check API Gateway CORS, S3 CORS and Lambda logs."
      );

      setValues({
        panDocumentName: "",
        panDocumentPreview: "",
        panDocumentS3ObjectKey: "",
        panOcrStatus: "Pending",
        panVerificationStatus: "Pending",
        panVerified: false,
        nsdlReferenceNumber: "",
        nsdlVerifiedAt: ""
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setIsUploadingToS3(false);
    }
  };

  /* ── Verification ── */
  const verifyPan = () => {
    setIsVerifyingPan(true);
    setVerifyResult(null);

    window.setTimeout(() => {
      const scenario = VERIFY_SCENARIOS[verifyAttempts % VERIFY_SCENARIOS.length];

      setVerifyAttempts((n) => n + 1);

      const nsdlRef = `NSDL-${Math.floor(100000 + Math.random() * 900000)}`;
      const verifiedAt = getTimestamp();
      const isVerified = scenario.status === "Verified";

      setValues({
        panVerificationStatus: isVerified ? "Verified" : "Mismatch",
        panVerified: isVerified,
        nsdlReferenceNumber: nsdlRef,
        nsdlVerifiedAt: verifiedAt
      });

      saveUploadedDocument({
        applicant: "Primary Applicant",
        type: "Identity Proof",
        subtype: "PAN Card",
        source: "Customer Identity",
        fileName: formData.panDocumentName,
        fileType: isImage ? "Image" : "PDF / Document",
        previewUrl: formData.panDocumentPreview,
        s3ObjectKey: formData.panDocumentS3ObjectKey,
        ocrStatus: "Completed",
        verificationStatus: isVerified ? "Verified" : "Mismatch"
      });

      setVerifyResult({
        ...scenario,
        nsdlRef,
        verifiedAt
      });

      setIsVerifyingPan(false);
    }, 3000);
  };

  /* ── Remove PAN ── */
  const removePan = () => {
    setValues({
      panDocumentName: "",
      panDocumentPreview: "",
      panDocumentS3ObjectKey: "",
      panOcrStatus: "Pending",
      panVerificationStatus: "Pending",
      panNumber: "",
      firstName: lead?.firstName || "",
      lastName: lead?.lastName || "",
      fatherName: "",
      dateOfBirth: "",
      panVerified: false,
      nsdlReferenceNumber: "",
      nsdlVerifiedAt: ""
    });

    removeUploadedDocument({
      applicant: "Primary Applicant",
      type: "Identity Proof",
      subtype: "PAN Card"
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setUploadError("");
    setUploadProgress(0);
    setOcrDone(false);
    setVerifyResult(null);
    setIsEditing(false);
  };

  /* ── Render ── */
  return (
    <div className="cid-page">
      {notice && (
        <div className="cid-toast">
          <CheckIcon /> {notice}
        </div>
      )}

      <div className="cid-steps">
        {/* ── Step 1: Consent ──────────────────────────────────────────── */}
        <div className="cid-step">
          <div className="cid-step-track">
            <div className={`cid-step-node ${consentCaptured ? "complete" : consentSent ? "active" : "idle"}`}>
              {consentCaptured ? <CheckIcon /> : <span>1</span>}
            </div>

            <div className={`cid-step-line ${consentCaptured ? "filled" : ""}`} />
          </div>

          <div className="cid-step-panel">
            <div className="cid-panel-head">
              <div>
                <span className="cid-panel-title">Customer Consent</span>
                <span className="cid-panel-sub">
                  Obtain authorization before processing identity documents
                </span>
              </div>

              <span className={`cid-badge ${consentCaptured ? "green" : consentSent ? "amber" : "gray"}`}>
                {consentCaptured ? <CheckIcon /> : <ClockIcon />}
                {consentCaptured ? "Captured" : consentSent ? "Awaiting" : "Pending"}
              </span>
            </div>

            <div className="cid-panel-body">
              {consentCaptured ? (
                <div className="cid-consent-confirmed">
                  <div className="cid-check-badge">
                    <ConsentCheckIcon />
                  </div>

                  <div className="cid-consent-confirmed-body">
                    <span className="cid-consent-confirmed-title">Consent received</span>
                    <span className="cid-consent-confirmed-meta">
                      Captured {formData.consentCapturedAt}
                      {formData.mobileNumber && <> &nbsp;·&nbsp; {formData.mobileNumber}</>}
                    </span>
                  </div>

                  <button className="cid-btn-ghost small" type="button" onClick={sendConsent}>
                    <RefreshIcon /> Resend
                  </button>
                </div>
              ) : (
                <div className="cid-consent-send-area">
                  <div>
                    <div className="cid-copy-main">
                      Send a secure consent link to the customer
                    </div>

                    <div className="cid-copy-sub">
                      Delivered to{" "}
                      <strong>{formData.mobileNumber || "the registered mobile number"}</strong>
                    </div>
                  </div>

                  <button className="cid-btn-primary" type="button" onClick={sendConsent} disabled={isConsentWaiting}>
                    {isConsentWaiting ? (
                      <>
                        <SpinnerIcon /> Sending…
                      </>
                    ) : consentSent ? (
                      <>
                        <RefreshIcon /> Resend Link
                      </>
                    ) : (
                      "Send Link"
                    )}
                  </button>
                </div>
              )}

              {formData.consentLinkSentAt && !consentCaptured && (
                <div className="cid-timeline">
                  <div className="cid-tl-item">
                    <span className="cid-tl-dot amber" />
                    Link sent at <b>{formData.consentLinkSentAt}</b>
                  </div>
                </div>
              )}

              {consentSent && !consentCaptured && (
                <div className="cid-alert amber">
                  <SpinnerIcon /> Awaiting customer response on their registered device
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Step 2: PAN ──────────────────────────────────────────────── */}
        <div className={`cid-step${!consentCaptured ? " cid-step--locked" : ""}`}>
          <div className="cid-step-track">
            <div className={`cid-step-node ${panVerified ? "complete" : panUploaded ? "active" : "idle"}`}>
              {panVerified ? <CheckIcon /> : <span>2</span>}
            </div>
            <div className={`cid-step-line ${panVerified ? "filled" : ""}`} />
          </div>

          <div className="cid-step-panel">
            <div className="cid-panel-head">
              <div>
                <span className="cid-panel-title">PAN Verification</span>
                <span className="cid-panel-sub">
                  Upload PAN document, extract details, and verify with NSDL
                </span>
              </div>

              <span className={`cid-badge ${panVerified ? "green" : panUploaded ? "amber" : "gray"}`}>
                {panVerified ? <CheckIcon /> : <ClockIcon />}
                {panVerified ? "Verified" : panUploaded ? "In progress" : "Pending"}
              </span>
            </div>

            {!consentCaptured && (
              <div className="cid-lock-note">
                Complete consent capture to enable PAN verification
              </div>
            )}

            <div className={`cid-panel-body${!consentCaptured ? " locked" : ""}`}>
              <div className="cid-pan-layout">
                {/* ── Upload column ── */}
                <div className="cid-upload-col">
                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    disabled={!consentCaptured || isUploadingToS3 || isReadingDocument}
                  />

                  <div
                    className={`cid-upload-zone${!panUploaded && consentCaptured ? " clickable" : ""}`}
                    onClick={
                      !panUploaded && consentCaptured && !isUploadingToS3 && !isReadingDocument
                        ? () => fileInputRef.current?.click()
                        : undefined
                    }
                  >
                    {(isUploadingToS3 || isReadingDocument) && (
                      <div className="cid-ocr-overlay">
                        <div className="cid-scan-beam" />

                        <div className="cid-scan-status">
                          <SpinnerIcon />
                          {isUploadingToS3
                            ? `Uploading to S3${uploadProgress ? ` ${uploadProgress}%` : ""}`
                            : "Reading document"}
                        </div>
                      </div>
                    )}

                    {!panUploaded ? (
                      <div className="cid-upload-placeholder">
                        <div className="cid-upload-icon-wrap">
                          <UploadIcon />
                        </div>

                        <span className="cid-upload-label">Upload PAN document</span>
                        <span className="cid-upload-hint">JPG, PNG or PDF · Max 5 MB</span>
                      </div>
                    ) : isImage ? (
                      <img
                        src={formData.panDocumentPreview}
                        alt="PAN preview"
                        className="cid-preview-img"
                      />
                    ) : isPdf ? (
                      <iframe
                        src={formData.panDocumentPreview}
                        title="PAN Document"
                        className="cid-preview-pdf"
                      />
                    ) : (
                      <div className="cid-upload-placeholder">
                        <DocumentIcon />
                        <span className="cid-upload-label">{formData.panDocumentName}</span>
                      </div>
                    )}
                  </div>

                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="cid-upload-progress">
                      <div className="cid-upload-progress-head">
                        <span>Uploading</span>
                        <strong>{uploadProgress}%</strong>
                      </div>

                      <div className="cid-upload-progress-bar">
                        <div style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="cid-upload-actions">
                    <button
                      className="cid-btn-secondary small"
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={!consentCaptured || isUploadingToS3 || isReadingDocument}
                    >
                      <UploadIcon /> {panUploaded ? "Replace" : "Upload"}
                    </button>

                    {panUploaded && (
                      <button
                        className="cid-btn-ghost danger"
                        type="button"
                        onClick={removePan}
                        disabled={isUploadingToS3 || isReadingDocument}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                </div>

                {/* ── Form column ── */}
                <div className="cid-form-col">
                  <div className="cid-fields-toolbar">
                    <span className="cid-fields-label">PAN Details</span>

                    {consentCaptured && (
                      <button
                        className={`cid-edit-toggle${isEditing ? " active" : ""}`}
                        type="button"
                        onClick={() => setIsEditing((value) => !value)}
                      >
                        {isEditing ? (
                          <>
                            <CheckIcon /> Done
                          </>
                        ) : (
                          <>
                            <PencilIcon /> Edit
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {uploadError && (
                    <div className="cid-banner error">
                      <AlertIcon />
                      <div className="cid-banner-body">
                        <strong>Document upload failed</strong>
                        <p>{uploadError}</p>
                      </div>
                    </div>
                  )}

                  {ocrDone && !isReadingDocument && (
                    <div className="cid-banner info">
                      <ScanIcon />

                      <div className="cid-banner-body">
                        <strong>Details read from document</strong>
                        <p>
                          {formData.panNumber}
                          {formData.firstName && ` · ${formData.firstName} ${formData.lastName}`}
                          {formData.dateOfBirth && ` · ${formatDob(formData.dateOfBirth)}`}
                          {formData.fatherName && ` · S/o ${formData.fatherName}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {isVerifyingPan && (
                    <div className="cid-banner info">
                      <SpinnerIcon />
                      <span>Verifying with NSDL database…</span>
                    </div>
                  )}

                  {verifyResult && !isVerifyingPan && (
                    <div className={`cid-banner ${verifyResult.variant}`}>
                      {verifyResult.variant === "success" ? <CheckIcon /> : <AlertIcon />}

                      <div className="cid-banner-body">
                        <strong>{verifyResult.headline}</strong>
                        {verifyResult.subline && <p>{verifyResult.subline}</p>}

                        <span className="cid-banner-meta">
                          Ref {verifyResult.nsdlRef} &nbsp;·&nbsp; {verifyResult.verifiedAt}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="cid-form-grid">
                    <Field
                      label="PAN Number"
                      value={formData.panNumber}
                      placeholder="ABCDE1234F"
                      editing={isEditing}
                      onChange={(event) => setField("panNumber", event.target.value.toUpperCase())}
                    />

                    <Field
                      label="Date of Birth"
                      value={formData.dateOfBirth}
                      type="date"
                      editing={isEditing}
                      onChange={(event) => setField("dateOfBirth", event.target.value)}
                    />

                    <Field
                      label="First Name"
                      value={formData.firstName}
                      placeholder="First name"
                      editing={isEditing}
                      onChange={(event) => setField("firstName", event.target.value)}
                    />

                    <Field
                      label="Last Name"
                      value={formData.lastName}
                      placeholder="Last name"
                      editing={isEditing}
                      onChange={(event) => setField("lastName", event.target.value)}
                    />

                    <Field
                      label="Father / Spouse Name"
                      value={formData.fatherName}
                      placeholder="As on PAN card"
                      editing={isEditing}
                      wide
                      onChange={(event) => setField("fatherName", event.target.value)}
                    />

                    <Field
                      label="Mobile"
                      value={formData.mobileNumber}
                      placeholder="Mobile"
                      editing={isEditing}
                      onChange={(event) => setField("mobileNumber", event.target.value)}
                    />

                    <Field
                      label="Email"
                      value={formData.email}
                      placeholder="Email"
                      editing={isEditing}
                      onChange={(event) => setField("email", event.target.value)}
                    />
                  </div>

                  <div className="cid-verify-row">
                    {panVerified ? (
                      <div className="cid-verified-status">
                        <span className="cid-verified-dot" />
                        PAN verified &nbsp;·&nbsp; {formData.nsdlReferenceNumber}
                      </div>
                    ) : (
                      <span className="cid-copy-sub">
                        {ocrDone
                          ? "Confirm the details above, then verify"
                          : "Upload a document to proceed"}
                      </span>
                    )}

                    <button
                      className={`cid-btn-primary${panVerified ? " verified" : ""}`}
                      type="button"
                      onClick={verifyPan}
                      disabled={
                        !consentCaptured ||
                        isVerifyingPan ||
                        isUploadingToS3 ||
                        isReadingDocument ||
                        !ocrDone
                      }
                    >
                      {isVerifyingPan ? (
                        <>
                          <SpinnerIcon /> Verifying…
                        </>
                      ) : panVerified ? (
                        <>
                          <RefreshIcon /> Re-verify
                        </>
                      ) : (
                        <>
                          <ShieldIcon /> Verify PAN
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* ── Step 3: CIBIL Score ──────────────────────────────────────── */}
        <div className={`cid-step${!panVerified ? " cid-step--locked" : ""}`}>
          <div className="cid-step-track">
            <div className={`cid-step-node ${cibilFetched ? "complete" : panVerified ? "active" : "idle"}`}>
              {cibilFetched ? <CheckIcon /> : <span>3</span>}
            </div>
          </div>

          <div className="cid-step-panel">
            <div className="cid-panel-head">
              <div>
                <span className="cid-panel-title">CIBIL Score</span>
                <span className="cid-panel-sub">
                  Credit bureau score fetched via PAN after identity verification
                </span>
              </div>

              <span className={`cid-badge ${cibilFetched ? "green" : panVerified ? "amber" : "gray"}`}>
                {cibilFetched ? <CheckIcon /> : <ClockIcon />}
                {cibilFetched ? "Fetched" : panVerified ? "Ready" : "Pending"}
              </span>
            </div>

            {!panVerified && (
              <div className="cid-lock-note">
                Complete PAN verification to fetch CIBIL score
              </div>
            )}

            <div className={`cid-panel-body${!panVerified ? " locked" : ""}`}>
              {cibilFetching && (
                <div className="cid-banner info" style={{ margin: "14px 16px 0" }}>
                  <SpinnerIcon />
                  <span>Fetching credit score from CIBIL bureau…</span>
                </div>
              )}

              {!cibilFetched && !cibilFetching && panVerified && (
                <div className="cid-cibil-fetch-area">
                  <div>
                    <div className="cid-copy-main">Fetch credit score from CIBIL</div>
                    <div className="cid-copy-sub">
                      Uses the verified PAN &nbsp;·&nbsp; <strong>{formData.panNumber}</strong>
                    </div>
                  </div>
                  <button
                    className="cid-btn-primary"
                    type="button"
                    onClick={() => {
                      setCibilFetching(true);
                      window.setTimeout(() => {
                        setCibilFetching(false);
                        setCibilFetched(true);
                      }, 2200);
                    }}
                  >
                    <ShieldIcon /> Fetch Score
                  </button>
                </div>
              )}

              {cibilFetched && !cibilFetching && (
                <div className="cid-cibil-result">
                  {/* Gauge */}
                  <div className="cid-cibil-gauge-wrap">
                    <svg className="cid-cibil-gauge" viewBox="0 0 120 70">
                      {/* Background arc */}
                      <path
                        d="M10 65 A50 50 0 0 1 110 65"
                        fill="none"
                        stroke="#e8edf4"
                        strokeWidth="10"
                        strokeLinecap="round"
                      />
                      {/* Filled arc — 690 out of 900, so ~69% of 180° = 124° */}
                      <path
                        d="M10 65 A50 50 0 0 1 110 65"
                        fill="none"
                        stroke="url(#cibilGradient)"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray="157"
                        strokeDashoffset="49"
                      />
                      <defs>
                        <linearGradient id="cibilGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#f59e0b" />
                          <stop offset="60%" stopColor="#22c55e" />
                          <stop offset="100%" stopColor="#16a34a" />
                        </linearGradient>
                      </defs>
                      {/* Score text */}
                      <text x="60" y="58" textAnchor="middle" className="cid-cibil-score-text">690</text>
                    </svg>
                    <div className="cid-cibil-gauge-labels">
                      <span>300</span>
                      <span>900</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="cid-cibil-detail-col">
                    <div className="cid-cibil-score-badge">
                      <span className="cid-cibil-score-num">690</span>
                      <span className="cid-cibil-score-tag">Good</span>
                    </div>

                    <div className="cid-cibil-meta-grid">
                      <div className="cid-cibil-meta-item">
                        <span className="cid-cibil-meta-label">Bureau</span>
                        <span className="cid-cibil-meta-value">TransUnion CIBIL</span>
                      </div>
                      <div className="cid-cibil-meta-item">
                        <span className="cid-cibil-meta-label">Score Range</span>
                        <span className="cid-cibil-meta-value">300 – 900</span>
                      </div>
                      <div className="cid-cibil-meta-item">
                        <span className="cid-cibil-meta-label">Report Date</span>
                        <span className="cid-cibil-meta-value">{new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                      </div>
                      <div className="cid-cibil-meta-item">
                        <span className="cid-cibil-meta-label">Active Accounts</span>
                        <span className="cid-cibil-meta-value">3</span>
                      </div>
                      <div className="cid-cibil-meta-item">
                        <span className="cid-cibil-meta-label">Overdue Accounts</span>
                        <span className="cid-cibil-meta-value">0</span>
                      </div>
                      <div className="cid-cibil-meta-item">
                        <span className="cid-cibil-meta-label">Enquiries (6m)</span>
                        <span className="cid-cibil-meta-value">2</span>
                      </div>
                    </div>

                    <div className="cid-cibil-verdict">
                      <CheckIcon />
                      Score meets minimum threshold for Home Loan eligibility
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default CustomerIdentityPage;