import { useEffect, useMemo, useRef, useState } from "react";
import "./DocumentationDisbursementTab.css";

const DEFAULT_LEAD_API_BASE =
  "https://700pag34e9.execute-api.ap-south-1.amazonaws.com/prod/leads";

const REQUIRED_DOCUMENTS = [
  {
    id: "kfsPassCard",
    name: "Key Facts Statement & Pass Card",
    shortName: "KFS & Pass Card",
    description: "Pricing, repayment, charges and loan account reference.",
    url: "/docs/Key fact statement and passcard sample.pdf",
  },
  {
    id: "jewelleryDetails",
    name: "Jewellery Details",
    shortName: "Jewellery Details",
    description: "Item-wise appraisal, purity, net weight and valuation.",
    url: "/docs/Jewellery details Sample.pdf",
  },
  {
    id: "loanApplication",
    name: "Loan Application Document",
    shortName: "Loan Application",
    description: "Customer, facility, branch and declaration details.",
    url: "/docs/Loan application document Sample.pdf",
  },
  {
    id: "sanctionLetter",
    name: "Sanction Document",
    shortName: "Sanction Letter",
    description: "Approved amount, tenure, conditions and authority.",
    url: "/docs/Loan sanctioning document Sample.pdf",
  },
];

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

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDateTime = (value) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const normalizePersona = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const createReference = (prefix) =>
  `${prefix}-${new Date().getFullYear()}-${String(Date.now()).slice(-7)}`;

const createActivityEvent = (event, actor) => ({
  id: `ACT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  type: event.type || "workflow_action",
  title: event.title || "Documentation and disbursement updated",
  description: event.description || "",
  stage: "Documentation & Disbursement",
  section: event.section || "Documentation & Disbursement",
  fromStatus: event.fromStatus || "",
  toStatus: event.toStatus || "",
  actor,
  comments: event.comments || "",
  createdAt: new Date().toISOString(),
  metadata: event.metadata || {},
});

const Icon = ({ name, size = 20 }) => {
  const paths = {
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></>,
    check: <path d="m5 12 4 4L19 6" />,
    pen: <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></>,
    upload: <><path d="M12 16V4M7 9l5-5 5 5"/><path d="M5 20h14"/></>,
    send: <><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></>,
    bank: <><path d="m3 10 9-6 9 6"/><path d="M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18"/></>,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
  };
  return (
    <svg
      aria-hidden="true"
      className="dd-icon"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      {paths[name]}
    </svg>
  );
};

const getDemoContext = (leadDetails, lead) => {
  const facility = leadDetails.facilityBranchLoanDetails || {};
  const product = facility.productFacilityAndScheme || {};
  const exposure = facility.exposure || {};
  const identity = leadDetails.customerIdentity || {};
  const borrower = identity.borrowerInformation || identity.borrower || {};
  const appraisal = leadDetails.applicationDetail?.appraisal || {};
  const checker = leadDetails.applicationDetail?.checkerDecision || {};

  const repaymentText = String(
    product.repaymentType || product.facilityType || product.loanType || "Term Loan"
  );
  const isOD = /overdraft|\bod\b/i.test(repaymentText);

  return {
    applicationNumber:
      lead?.applicationNumber || lead?.application_number || "GL-2026-439306",
    customerName:
      borrower.fullName ||
      [borrower.firstName, borrower.lastName].filter(Boolean).join(" ") ||
      lead?.customerName ||
      lead?.name ||
      "Shivanjali Gaikwad",
    loanAmount:
      checker.sanctionedAmount ||
      checker.approvedAmount ||
      exposure.requestedLoanAmount ||
      485000,
    accountNumber:
      product.disbursementAccountNumber ||
      product.repaymentAccountNumber ||
      facility.accountNumber ||
      "XXXXXX4821",
    facilityType: isOD ? "OD" : "TL",
    facilityLabel: isOD ? "Overdraft Limit" : "Term Loan",
    jewelleryCount:
      appraisal.ornaments?.length || leadDetails.jewelleryDetails?.ornaments?.length || 2,
  };
};

const createDefaultWorkflow = () => ({
  status: "DOCUMENT_GENERATION_PENDING",
  documents: REQUIRED_DOCUMENTS.reduce(
    (result, document) => ({
      ...result,
      [document.id]: { status: "pending" },
    }),
    {}
  ),
  execution: {
    method: "",
    status: "not_started",
    consentConfirmed: false,
    manualDocument: null,
    esignDocuments: [],
  },
  preDisbursement: {
    accountVerified: false,
    originalsVerified: false,
    lienMarked: false,
    checkerDeclaration: false,
  },
  disbursement: { status: "not_started" },
});

export default function DocumentationDisbursementTab({
  leadId,
  lead,
  setLead,
  loggedInUserEmail = "",
  persona = "Viewer",
  isLocked = false,
  leadApiBase = DEFAULT_LEAD_API_BASE,
}) {
  const [saveState, setSaveState] = useState("idle");
  const [saveError, setSaveError] = useState("");
  const [activeDocument, setActiveDocument] = useState(null);
  const [showDisbursementConfirm, setShowDisbursementConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState("");
  const [selectedDisbursementAccount, setSelectedDisbursementAccount] = useState("");
  const fileInputRef = useRef(null);
  const esignFileInputRef = useRef(null);

  const leadDetails = useMemo(
    () => parseLeadDetails(lead?.leadDetails ?? lead?.lead_details),
    [lead?.leadDetails, lead?.lead_details]
  );
  const savedWorkflow =
    leadDetails.applicationDetail?.documentationDisbursement || {};
  const savedEsignDecision =
    leadDetails.applicationDetail?.makerFinalisation?.eSignRequired ??
    leadDetails.applicationDetail?.details?.eligibilityRecommendation?.eSignRequired;
  const eSignRequired = savedEsignDecision !== false;
  const [workflow, setWorkflow] = useState(() => ({
    ...createDefaultWorkflow(),
    ...savedWorkflow,
    documents: {
      ...createDefaultWorkflow().documents,
      ...(savedWorkflow.documents || {}),
    },
    execution: {
      ...createDefaultWorkflow().execution,
      ...(savedWorkflow.execution || {}),
    },
    preDisbursement: {
      ...createDefaultWorkflow().preDisbursement,
      ...(savedWorkflow.preDisbursement || {}),
    },
    disbursement: {
      ...createDefaultWorkflow().disbursement,
      ...(savedWorkflow.disbursement || {}),
    },
  }));

  useEffect(() => {
    const defaults = createDefaultWorkflow();
    setWorkflow({
      ...defaults,
      ...savedWorkflow,
      documents: { ...defaults.documents, ...(savedWorkflow.documents || {}) },
      execution: { ...defaults.execution, ...(savedWorkflow.execution || {}) },
      preDisbursement: {
        ...defaults.preDisbursement,
        ...(savedWorkflow.preDisbursement || {}),
      },
      disbursement: {
        ...defaults.disbursement,
        ...(savedWorkflow.disbursement || {}),
      },
    });
  }, [savedWorkflow.lastUpdatedAt]);

  useEffect(
    () => () => {
      if (uploadPreviewUrl) URL.revokeObjectURL(uploadPreviewUrl);
    },
    [uploadPreviewUrl]
  );

  const context = useMemo(
    () => getDemoContext(leadDetails, lead),
    [leadDetails, lead]
  );
  const normalizedPersona = normalizePersona(persona);
  const isChecker = normalizedPersona.includes("checker");
  const canManageDocuments =
    !isLocked &&
    (normalizedPersona.includes("maker") ||
      normalizedPersona.includes("checker") ||
      normalizedPersona.includes("branch"));

  const documentsGenerated = REQUIRED_DOCUMENTS.every(
    ({ id }) => workflow.documents?.[id]?.status === "generated"
  );
  const executionComplete = workflow.execution?.status === "completed";
  const checklistComplete = Object.values(workflow.preDisbursement || {}).every(Boolean);
  const alreadyDisbursed = workflow.disbursement?.status === "completed";
  const readyForDisbursement =
    documentsGenerated;

  const persistWorkflow = async (nextWorkflow, activityEvent = null) => {
    const leadIdentity = leadId || lead?.id || lead?.leadnumber;
    if (!leadIdentity) {
      setSaveState("error");
      setSaveError("Lead ID is unavailable.");
      return { success: false };
    }

    const now = new Date().toISOString();
    const workflowToSave = { ...nextWorkflow, lastUpdatedAt: now };
    setWorkflow(workflowToSave);

    const currentDetails = parseLeadDetails(
      lead?.leadDetails ?? lead?.lead_details
    );
    const currentApplicationDetail = currentDetails.applicationDetail || {};
    const currentActivity = currentApplicationDetail.activity || {};
    let nextActivity = currentActivity;

    if (activityEvent) {
      const event = createActivityEvent(activityEvent, {
        name: lead?.loggedInUserName || "",
        email: loggedInUserEmail,
        role: persona,
      });
      nextActivity = {
        ...currentActivity,
        events: [...(currentActivity.events || []), event],
        lastUpdatedAt: event.createdAt,
      };
    }

    const nextApplicationDetail = {
      ...currentApplicationDetail,
      documentationDisbursement: workflowToSave,
      activity: nextActivity,
    };
    const nextLeadDetails = {
      ...currentDetails,
      applicationDetail: nextApplicationDetail,
    };

    setLead?.((previousLead) => ({
      ...previousLead,
      leadDetails: nextLeadDetails,
      lead_details: nextLeadDetails,
    }));
    setSaveState("saving");
    setSaveError("");

    try {
      const response = await fetch(
        `${leadApiBase}/${encodeURIComponent(leadIdentity)}/details`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leadId: leadIdentity,
          leadDetailsPatch: nextLeadDetails,
          }),
        }
      );
      if (!response.ok) {
        throw new Error(
          `Unable to save Documentation & Disbursement (${response.status}).`
        );
      }
      setSaveState("saved");
      return { success: true, data: workflowToSave };
    } catch (error) {
      setSaveState("error");
      setSaveError(error.message || "Unable to save the workflow.");
      return { success: false, error };
    }
  };

  const generateDocument = async (documentId) => {
    if (!canManageDocuments || isProcessing) return;
    setIsProcessing(true);
    await new Promise((resolve) => window.setTimeout(resolve, 700));
    const document = REQUIRED_DOCUMENTS.find(({ id }) => id === documentId);
    const generatedAt = new Date().toISOString();
    const nextDocuments = {
      ...workflow.documents,
      [documentId]: {
        status: "generated",
        generatedAt,
        generatedBy: loggedInUserEmail || persona,
        documentReference: createReference("DOC"),
        documentUrl: document.url,
      },
    };
    const allGenerated = REQUIRED_DOCUMENTS.every(
      ({ id }) => nextDocuments[id]?.status === "generated"
    );
    await persistWorkflow(
      {
        ...workflow,
        documents: nextDocuments,
        status: allGenerated ? "EXECUTION_PENDING" : "DOCUMENT_GENERATION_IN_PROGRESS",
      },
      {
        type: "document_generated",
        title: `${document.name} generated`,
        section: "Document Generation",
        toStatus: "Generated",
      }
    );
    setIsProcessing(false);
  };

  const generateAllDocuments = async () => {
    if (!canManageDocuments || isProcessing) return;
    setIsProcessing(true);
    await new Promise((resolve) => window.setTimeout(resolve, 1100));
    const generatedAt = new Date().toISOString();
    const nextDocuments = REQUIRED_DOCUMENTS.reduce(
      (result, document) => ({
        ...result,
        [document.id]: workflow.documents?.[document.id]?.status === "generated"
          ? workflow.documents[document.id]
          : {
              status: "generated",
              generatedAt,
              generatedBy: loggedInUserEmail || persona,
              documentReference: createReference("DOC"),
              documentUrl: document.url,
            },
      }),
      {}
    );
    await persistWorkflow(
      { ...workflow, documents: nextDocuments, status: "EXECUTION_PENDING" },
      {
        type: "document_pack_generated",
        title: "Mandatory document pack generated",
        section: "Document Generation",
        toStatus: "Generated",
        metadata: { documentCount: REQUIRED_DOCUMENTS.length },
      }
    );
    setIsProcessing(false);
  };

  const setExecutionMethod = async (method) => {
    if (!canManageDocuments || !documentsGenerated) return;
    const nextExecution = {
      ...workflow.execution,
      method,
      status: "not_started",
      consentConfirmed: false,
      manualDocument: method === "manual" ? workflow.execution.manualDocument : null,
      neslReference: method === "esign" ? workflow.execution.neslReference : "",
    };
    await persistWorkflow({ ...workflow, execution: nextExecution });
  };

  const sendEsignRequest = async () => {
    if (!workflow.execution.consentConfirmed || isProcessing) return;
    setIsProcessing(true);
    await new Promise((resolve) => window.setTimeout(resolve, 900));
    const now = new Date().toISOString();
    const nextExecution = {
      ...workflow.execution,
      method: "esign",
      status: "request_sent",
      requestSentAt: now,
      neslReference: createReference("NESL"),
      deliveryChannels: ["SMS", "Email"],
    };
    await persistWorkflow(
      { ...workflow, execution: nextExecution, status: "ESIGN_IN_PROGRESS" },
      {
        type: "esign_request_sent",
        title: "NeSL e-sign request sent",
        section: "Document Execution",
        toStatus: "Awaiting customer signature",
      }
    );
    // Demo journey: the customer completes the received request automatically.
    window.setTimeout(() => {
      markEsignComplete();
    }, 5000);
    setIsProcessing(false);
  };

  const markEsignComplete = async () => {
    const now = new Date().toISOString();
    await persistWorkflow(
      {
        ...workflow,
        execution: {
          ...workflow.execution,
          status: "completed",
          completedAt: now,
          signedDocumentReference: createReference("SIGNED"),
        },
        status: "PRE_DISBURSEMENT_CHECKS_PENDING",
      },
      {
        type: "esign_completed",
        title: "Customer e-sign completed",
        section: "Document Execution",
        toStatus: "Executed",
      }
    );
  };

  const handleEsignFileUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    const oversized = files.find((f) => f.size > 10 * 1024 * 1024);
    const invalid = files.find((f) => !allowedTypes.includes(f.type));
    if (invalid) {
      setSaveState("error");
      setSaveError("Only PDF, JPG or PNG files are allowed.");
      return;
    }
    if (oversized) {
      setSaveState("error");
      setSaveError("Each file must be 10 MB or smaller.");
      return;
    }
    const now = new Date().toISOString();
    const newDocs = files.map((f) => ({
      name: f.name,
      type: f.type,
      size: f.size,
      uploadedAt: now,
      reference: createReference("ESIGN-DOC"),
      url: "/doc.pdf",
    }));
    const nextEsignDocuments = [
      ...(workflow.execution.esignDocuments || []),
      ...newDocs,
    ];
    await persistWorkflow(
      {
        ...workflow,
        execution: {
          ...workflow.execution,
          esignDocuments: nextEsignDocuments,
        },
      },
      newDocs.length === 1
        ? {
            type: "esign_document_uploaded",
            title: `Supporting document uploaded: ${newDocs[0].name}`,
            section: "Document Execution",
            metadata: { fileName: newDocs[0].name },
          }
        : {
            type: "esign_documents_uploaded",
            title: `${newDocs.length} supporting documents uploaded`,
            section: "Document Execution",
            metadata: { fileCount: newDocs.length },
          }
    );
  };

  const removeEsignDocument = async (indexToRemove) => {
    const nextEsignDocuments = (workflow.execution.esignDocuments || []).filter(
      (_, i) => i !== indexToRemove
    );
    await persistWorkflow({
      ...workflow,
      execution: { ...workflow.execution, esignDocuments: nextEsignDocuments },
    });
  };

  const handleManualUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setSaveState("error");
      setSaveError("Upload a PDF, JPG or PNG file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setSaveState("error");
      setSaveError("The signed document must be 10 MB or smaller.");
      return;
    }
    if (uploadPreviewUrl) URL.revokeObjectURL(uploadPreviewUrl);
    setUploadPreviewUrl(URL.createObjectURL(file));
    const now = new Date().toISOString();
    const nextExecution = {
      ...workflow.execution,
      method: "manual",
      status: "completed",
      completedAt: now,
      manualDocument: {
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: now,
        reference: createReference("UPLOAD"),
        uploaded: true,
        url: "/doc.pdf",
      },
    };
    await persistWorkflow(
      {
        ...workflow,
        execution: nextExecution,
        status: "PRE_DISBURSEMENT_CHECKS_PENDING",
      },
      {
        type: "manual_document_uploaded",
        title: "Manually signed stamp paper uploaded",
        section: "Document Execution",
        toStatus: "Executed",
        metadata: { fileName: file.name },
      }
    );
  };

  const toggleChecklist = async (field) => {
    if (!isChecker || isLocked || alreadyDisbursed) return;
    const nextChecklist = {
      ...workflow.preDisbursement,
      [field]: !workflow.preDisbursement[field],
    };
    await persistWorkflow({
      ...workflow,
      preDisbursement: nextChecklist,
      status: Object.values(nextChecklist).every(Boolean)
        ? "READY_FOR_DISBURSEMENT"
        : "PRE_DISBURSEMENT_CHECKS_PENDING",
    });
  };

  const completeDisbursement = async () => {
    if (!readyForDisbursement || alreadyDisbursed || isProcessing) return;
    setIsProcessing(true);
    const initiatedAt = new Date().toISOString();
    await persistWorkflow({
      ...workflow,
      status: "DISBURSEMENT_IN_PROGRESS",
      disbursement: { status: "processing", initiatedAt },
    });
    await new Promise((resolve) => window.setTimeout(resolve, 1400));
    const completedAt = new Date().toISOString();
    const transactionReference = createReference(
      context.facilityType === "OD" ? "CBS-OD" : "CBS-TL"
    );
    await persistWorkflow(
      {
        ...workflow,
        status: "DISBURSED",
        completedAt,
        disbursement: {
          status: "completed",
          initiatedAt,
          completedAt,
          transactionReference,
          facilityType: context.facilityType,
          amount: context.loanAmount,
          destinationAccount: selectedDisbursementAccount || context.accountNumber,
          cbsStatus:
            context.facilityType === "OD" ? "LIMIT_CREATED" : "AMOUNT_CREDITED",
          processedBy: loggedInUserEmail || persona,
        },
      },
      {
        type: "loan_disbursed",
        title:
          context.facilityType === "OD"
            ? "OD limit created in CBS"
            : "Loan amount disbursed",
        section: "Final Disbursement",
        fromStatus: "Ready for Disbursement",
        toStatus: "Disbursed",
        metadata: { transactionReference, amount: context.loanAmount },
      }
    );
    setIsProcessing(false);
    setShowDisbursementConfirm(false);
  };

  if (isLocked) {
    return (
      <section className="documentation-tab is-locked" aria-labelledby="documentation-tab-title">
        <div className="documentation-tab__locked-icon"><Icon name="shield" size={28} /></div>
        <h2 id="documentation-tab-title">Documentation &amp; Disbursement</h2>
        <p>This workspace becomes available after the checker sanctions the application.</p>
        <span>Awaiting checker sanction</span>
      </section>
    );
  }

  return (
    <section className="documentation-tab" aria-labelledby="documentation-tab-title">



      <div className="documentation-tab__section-heading">
        <div>
          <div><h3>Loan document pack</h3><p>Generated from the saved application, appraisal and sanction details.</p></div>
        </div>
        {canManageDocuments && !documentsGenerated && (
          <button className="documentation-tab__button secondary" disabled={isProcessing} onClick={generateAllDocuments} type="button">
            <Icon name="file" />{isProcessing ? "Generating…" : "Generate all"}
          </button>
        )}
      </div>

      <div className="documentation-tab__documents">
        {REQUIRED_DOCUMENTS.map((document) => {
          const item = workflow.documents?.[document.id] || {};
          const generated = item.status === "generated";
          return (
            <article className={`documentation-tab__document${generated ? " is-complete" : ""}`} key={document.id}>
              <div className="documentation-tab__document-icon"><Icon name={generated ? "check" : "file"} /></div>
              <div className="documentation-tab__document-copy">
                <h4>{document.name}</h4><p>{document.description}</p>
                {generated && <small>Generated {formatDateTime(item.generatedAt)}</small>}
              </div>
              <div className="documentation-tab__document-actions">
                {generated ? (
                  <a className="documentation-tab__text-button" href={item.documentUrl || document.url || "/doc.pdf"} rel="noreferrer" target="_blank"><Icon name="eye" />View</a>
                ) : (
                  <button className="documentation-tab__text-button" disabled={!canManageDocuments || isProcessing} onClick={() => generateDocument(document.id)} type="button">Generate</button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className={`documentation-tab__workflow-section${!documentsGenerated ? " is-disabled" : ""}`}>
        <div className="documentation-tab__section-heading"><div><h3>{eSignRequired ? "Customer eSign" : "Signed document upload"}</h3><p>{eSignRequired ? "Send and track the customer’s eSign request." : "Upload the customer-signed physical document."}</p></div>{executionComplete && <span className="documentation-tab__complete-label"><Icon name="check" />Completed</span>}</div>

        <fieldset className="documentation-tab__execution" disabled={!canManageDocuments || !documentsGenerated || executionComplete}>
          <legend className="sr-only">Select document execution method</legend>
          <label className={workflow.execution.method === "esign" ? "selected" : ""}>
            <input checked={workflow.execution.method === "esign"} name="executionMethod" onChange={() => setExecutionMethod("esign")} type="radio" />
            <span className="documentation-tab__choice-icon"><Icon name="send" /></span>
            <span><strong>Yes, send for e-sign</strong><small>Send through NeSL to the registered mobile and email.</small></span>
          </label>
          <label className={workflow.execution.method === "manual" ? "selected" : ""}>
            <input checked={workflow.execution.method === "manual"} name="executionMethod" onChange={() => setExecutionMethod("manual")} type="radio" />
            <span className="documentation-tab__choice-icon"><Icon name="upload" /></span>
            <span><strong>No, collect manual signature</strong><small>Upload the signed and stamped document as PDF, JPG or PNG.</small></span>
          </label>
        </fieldset>

        {eSignRequired && (
          <div className="documentation-tab__execution-panel">
            <input
              accept=".pdf,.jpg,.jpeg,.png"
              className="sr-only"
              multiple
              onChange={handleEsignFileUpload}
              ref={esignFileInputRef}
              type="file"
            />
            {workflow.execution.status === "not_started" && (
              <>
                <label className="documentation-tab__consent">
                  <input
                    checked={workflow.execution.consentConfirmed}
                    onChange={(event) =>
                      setWorkflow((current) => ({
                        ...current,
                        execution: {
                          ...current.execution,
                          consentConfirmed: event.target.checked,
                        },
                      }))
                    }
                    type="checkbox"
                  />
                  <span>I confirm the customer has consented to receive the e-sign link.</span>
                </label>
                <button
                  className="documentation-tab__button"
                  disabled={!workflow.execution.consentConfirmed || isProcessing}
                  onClick={sendEsignRequest}
                  type="button"
                >
                  <Icon name="send" />
                  {isProcessing ? "Sending…" : "Send e-sign request"}
                </button>
              </>
            )}
            {workflow.execution.status === "request_sent" && (
              <div className="documentation-tab__esign-status">
                <div>
                  <span className="pulse" />
                  <div>
                    <strong>Awaiting customer signature</strong>
                    <p>Link shared by SMS and email · {workflow.execution.neslReference}</p>
                  </div>
                </div>
                <button className="documentation-tab__button secondary" onClick={markEsignComplete} type="button">
                  Simulate customer signed
                </button>
              </div>
            )}
            {executionComplete && (
              <p className="documentation-tab__success">
                <Icon name="check" />
                E-sign completed on {formatDateTime(workflow.execution.completedAt)} · {workflow.execution.signedDocumentReference}
              </p>
            )}

            <div className="documentation-tab__esign-uploads">
              <div className="documentation-tab__esign-uploads-header">
                <span className="documentation-tab__esign-uploads-label">
                  Supporting documents
                  {(workflow.execution.esignDocuments || []).length > 0 && (
                    <span className="documentation-tab__esign-uploads-count">
                      {(workflow.execution.esignDocuments || []).length}
                    </span>
                  )}
                </span>
                <button
                  className="documentation-tab__button secondary"
                  disabled={!canManageDocuments}
                  onClick={() => esignFileInputRef.current?.click()}
                  type="button"
                >
                  <Icon name="upload" size={16} />
                  Upload files
                </button>
              </div>

              {(workflow.execution.esignDocuments || []).length === 0 ? (
                <button
                  className="documentation-tab__upload documentation-tab__upload--compact"
                  disabled={!canManageDocuments}
                  onClick={() => esignFileInputRef.current?.click()}
                  type="button"
                >
                  <Icon name="upload" size={20} />
                  <strong>Attach supporting documents</strong>
                  <span>PDF, JPG or PNG · Max 10 MB each · Multiple allowed</span>
                </button>
              ) : (
                <ul className="documentation-tab__esign-file-list" role="list">
                  {(workflow.execution.esignDocuments || []).map((doc, index) => (
                    <li className="documentation-tab__esign-file-item" key={`${doc.reference}-${index}`}>
                      <span className="documentation-tab__esign-file-icon">
                        <Icon name="file" size={16} />
                      </span>
                      <span className="documentation-tab__esign-file-info">
                        <strong>{doc.name}</strong>
                        <small>Uploaded {formatDateTime(doc.uploadedAt)}</small>
                      </span>
                      <div className="documentation-tab__esign-file-actions">
                        <a
                          className="documentation-tab__text-button"
                          href={doc.url || "/doc.pdf"}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <Icon name="eye" size={14} />
                          View
                        </a>
                        {canManageDocuments && (
                          <button
                            aria-label={`Remove ${doc.name}`}
                            className="documentation-tab__text-button documentation-tab__text-button--danger"
                            onClick={() => removeEsignDocument(index)}
                            type="button"
                          >
                            <Icon name="close" size={14} />
                            Remove
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {!eSignRequired && (
          <div className="documentation-tab__execution-panel">
            <input accept=".pdf,.jpg,.jpeg,.png" className="sr-only" onChange={handleManualUpload} ref={fileInputRef} type="file" />
            {workflow.execution.manualDocument ? (
              <div className="documentation-tab__uploaded-file">
                <div><Icon name="file" /><span><strong>{workflow.execution.manualDocument.name}</strong><small>Document marked as uploaded · {formatDateTime(workflow.execution.manualDocument.uploadedAt)}</small></span></div>
                <div><a className="documentation-tab__text-button" href={workflow.execution.manualDocument.url || "/doc.pdf"} rel="noreferrer" target="_blank">View</a><button className="documentation-tab__text-button" disabled={!canManageDocuments} onClick={() => fileInputRef.current?.click()} type="button">Replace</button></div>
              </div>
            ) : (
              <button className="documentation-tab__upload" disabled={!canManageDocuments} onClick={() => fileInputRef.current?.click()} type="button"><Icon name="upload" size={24} /><strong>Upload signed stamp paper</strong><span>PDF, JPG or PNG · Maximum 10 MB</span></button>
            )}
          </div>
        )}
      </div>

      {false && <div className={`documentation-tab__workflow-section${!executionComplete ? " is-disabled" : ""}`}>
        <div className="documentation-tab__section-heading">
          <div><span className="documentation-tab__step">03</span><div><h3>Pre-disbursement verification</h3><p>Final controls must be confirmed by the Branch Checker.</p></div></div>
          {!isChecker && <span className="documentation-tab__role-note">Checker action</span>}
        </div>
        <div className="documentation-tab__checklist">
          {[
            ["accountVerified", `Credit account ${context.accountNumber} verified`],
            ["originalsVerified", "Executed documents and originals verified"],
            ["lienMarked", `${context.jewelleryCount} jewellery packets sealed and lien marked`],
            ["checkerDeclaration", "Sanction conditions and disbursement controls satisfied"],
          ].map(([field, label]) => (
            <label key={field} className={workflow.preDisbursement[field] ? "checked" : ""}>
              <input checked={Boolean(workflow.preDisbursement[field])} disabled={!executionComplete || !isChecker || alreadyDisbursed} onChange={() => toggleChecklist(field)} type="checkbox" />
              <span className="documentation-tab__custom-check"><Icon name="check" size={15} /></span>
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>}

      {!alreadyDisbursed && (
        <div className="documentation-tab__workflow-section documentation-tab__account-select-section">
          <div className="documentation-tab__section-heading">
            <div>
              <h3>Disbursement account</h3>
              <p>Select the account to which the sanctioned amount will be credited.</p>
            </div>
          </div>
          <div className="documentation-tab__account-select-row">
            <label className="documentation-tab__account-label" htmlFor="disbursement-account-select">
              Credit account
            </label>
            <select
              className="documentation-tab__account-dropdown"
              disabled={alreadyDisbursed || isProcessing}
              id="disbursement-account-select"
              onChange={(e) => setSelectedDisbursementAccount(e.target.value)}
              value={selectedDisbursementAccount}
            >
              <option value="">— Select account —</option>
              <option value={context.accountNumber}>
                {context.accountNumber} — Savings Account (Primary)
              </option>
            </select>
          </div>
        </div>
      )}

      <div className={`documentation-tab__disbursement${alreadyDisbursed ? " is-complete" : ""}`}>
        <div className="documentation-tab__disbursement-icon">
          <Icon name={alreadyDisbursed ? "check" : "bank"} size={26} />
        </div>
        
        <div className="documentation-tab__disbursement-copy">
          <h3>{alreadyDisbursed ? "Disbursement completed" : "Final CBS disbursement"}</h3>
          
          {/* Detailed disbursement parameters directly in context */}
          <div className="documentation-tab__disbursement-details">
            <span><strong>Sanctioned:</strong> {formatCurrency(context.loanAmount)}</span>
            <span className="dot">•</span>
            <span><strong>Facility:</strong> {context.facilityLabel}</span>
            <span className="dot">•</span>
            <span><strong>Account:</strong> {selectedDisbursementAccount || context.accountNumber}</span>
          </div>

          {alreadyDisbursed ? (
            <p>
              {context.facilityType === "OD"
                ? "OD limit created in CBS"
                : `${formatCurrency(context.loanAmount)} credited to ${workflow.disbursement.destinationAccount}`}{" "}
              · {workflow.disbursement.transactionReference} · {formatDateTime(workflow.disbursement.completedAt)}
            </p>
          ) : (
            <p>
              {context.facilityType === "OD"
                ? `Create an OD limit of ${formatCurrency(context.loanAmount)} in CBS.`
                : `Ready to initiate final transfer to the selected credit account.`}
            </p>
          )}
        </div>

        {!alreadyDisbursed && (
          <button
            className="documentation-tab__button danger"
            disabled={!readyForDisbursement || isProcessing || !selectedDisbursementAccount}
            onClick={() => setShowDisbursementConfirm(true)}
            type="button"
          >
            <Icon name="bank" />
            Disburse loan
          </button>
        )}
      </div>

      <footer className="documentation-tab__footer">
        <p aria-live="polite" className={`documentation-tab__save ${saveState}`}>
          {saveState === "saving" && "Saving changes…"}
          {saveState === "saved" && "All changes saved"}
          {saveState === "error" && saveError}
          {saveState === "idle" && (workflow.lastUpdatedAt ? `Last saved ${formatDateTime(workflow.lastUpdatedAt)}` : "Changes are saved to the application")}
        </p>
      </footer>

      {activeDocument && (
        <div className="documentation-tab__modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setActiveDocument(null)} role="presentation">
          <div aria-labelledby="document-preview-title" aria-modal="true" className="documentation-tab__modal" role="dialog">
            <div className="documentation-tab__modal-header"><div><span>Generated document</span><h3 id="document-preview-title">{activeDocument.name}</h3></div><button aria-label="Close preview" onClick={() => setActiveDocument(null)} type="button"><Icon name="close" /></button></div>
            <div className="documentation-tab__paper">
              <div className="documentation-tab__paper-brand"><strong>YES BANK</strong><span>Gold Loan</span></div>
              <h4>{activeDocument.name}</h4>
              <dl><div><dt>Application number</dt><dd>{context.applicationNumber}</dd></div><div><dt>Customer</dt><dd>{context.customerName}</dd></div><div><dt>Facility</dt><dd>{context.facilityLabel}</dd></div><div><dt>Sanctioned amount</dt><dd>{formatCurrency(context.loanAmount)}</dd></div><div><dt>Document reference</dt><dd>{activeDocument.documentReference}</dd></div></dl>
              <p>This system-generated preview is populated from the saved application, appraisal and checker sanction data.</p>
            </div>
          </div>
        </div>
      )}

      {showDisbursementConfirm && (
        <div className="documentation-tab__modal-backdrop" role="presentation">
          <div aria-labelledby="disbursement-confirm-title" aria-modal="true" className="documentation-tab__modal compact" role="alertdialog">
            <div className="documentation-tab__confirm-icon"><Icon name="bank" size={28} /></div>
            <h3 id="disbursement-confirm-title">Confirm final disbursement</h3>
            <p>{context.facilityType === "OD" ? `This will create an OD limit of ${formatCurrency(context.loanAmount)} in CBS.` : `${formatCurrency(context.loanAmount)} will be credited to ${selectedDisbursementAccount || context.accountNumber}.`} This action will complete the application.</p>
            <div className="documentation-tab__modal-actions"><button className="documentation-tab__button ghost" disabled={isProcessing} onClick={() => setShowDisbursementConfirm(false)} type="button">Cancel</button><button className="documentation-tab__button danger" disabled={isProcessing} onClick={completeDisbursement} type="button">{isProcessing ? "Processing in CBS…" : "Confirm disbursement"}</button></div>
          </div>
        </div>
      )}
    </section>
  );
}