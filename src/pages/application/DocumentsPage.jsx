//_______________This Code was generated using GenAI tool: Codify, Please check for accuracy_______________//
import { useEffect, useMemo, useState } from "react";
import "./DocumentsPage.css";
import {
  DOCUMENT_UPLOAD_EVENT,
  getUploadedDocuments,
  saveUploadedDocument,
} from "../../utils/documentStore";

/* ── Icons ───────────────────────────────────────────────────────────── */
const FileIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
    <path d="M14 2v6h6" />
    <path d="M8 13h8" />
    <path d="M8 17h5" />
  </svg>
);

const UploadIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="M17 8l-5-5-5 5" />
    <path d="M12 3v12" />
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.1">
    <path d="M21 12a9 9 0 0 1-15.5 6.3" />
    <path d="M3 12A9 9 0 0 1 18.5 5.7" />
    <path d="M18 2v4h4" />
    <path d="M6 22v-4H2" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4">
    <path d="M18 6 6 18" />
    <path d="M6 6l12 12" />
  </svg>
);

/* ── Data ────────────────────────────────────────────────────────────── */
const BASE_CHECKLIST_BEFORE_ADDRESS = [
  { type: "Identity Proof", subtype: "PAN Card", mandatory: true, ocrStatus: "Pending", verificationStatus: "Pending" },
  { type: "Photograph", subtype: "Applicant Photo", mandatory: true, ocrStatus: "Not Applicable", verificationStatus: "Pending" },
];

const BASE_CHECKLIST_AFTER_ADDRESS = [
  { type: "Income Proof", subtype: "Salary Slip - Latest Month", mandatory: true, ocrStatus: "Pending", verificationStatus: "Pending" },
  { type: "Income Proof", subtype: "Bank Statement - 6 Months", mandatory: true, ocrStatus: "Pending", verificationStatus: "Pending" },
  { type: "Income Proof", subtype: "Form 16", mandatory: false, ocrStatus: "Pending", verificationStatus: "Pending" },
  { type: "Application Document", subtype: "Generated Application Form", mandatory: true, ocrStatus: "Not Applicable", verificationStatus: "Pending" },
  { type: "Application Document", subtype: "Signed Application Form", mandatory: true, ocrStatus: "Not Applicable", verificationStatus: "Pending" },
];

/* ── Demo seed: mirrors the pre-loaded state in CustomerIdentityPage &
   ApplicantProfilePage. These act as fallbacks — any real localStorage
   upload with the same documentKey takes priority. ─────────────────── */
const DEMO_SEED_DOCS = [
  {
    applicant:          "Primary Applicant",
    applicantName:      "Shivanjali Gaikwad",
    applicantRole:      "Primary Applicant",
    type:               "Identity Proof",
    subtype:            "PAN Card",
    documentKey:        "Primary Applicant__Identity Proof__PAN Card",
    source:             "Customer Identity",
    fileName:           "PanCard.jpg",
    fileType:           "Image",
    previewUrl:         "/images/PanCard.jpg",
    ocrStatus:          "Completed",
    verificationStatus: "Verified",
    status:             "Uploaded",
    uploadedBy:         "Sales User",
    uploadedOn:         "16 Jun, 03:25 PM",
  },
  {
    applicant:          "Primary Applicant",
    applicantName:      "Shivanjali Gaikwad",
    applicantRole:      "Primary Applicant",
    type:               "Address Proof",
    subtype:            "Voter ID",
    documentKey:        "Primary Applicant__Address Proof__Voter ID",
    source:             "Applicant Profile",
    fileName:           "Voter Id_1550.pdf",
    fileType:           "PDF / Document",
    previewUrl:         "/docs/Voter Id_1550.pdf",
    ocrStatus:          "Completed",
    verificationStatus: "Pending Review",
    status:             "Uploaded",
    uploadedBy:         "Sales User",
    uploadedOn:         "16 Jun, 03:30 PM",
  },
];

function getBaseChecklist(applicantKey) {
  const uploads = getUploadedDocuments();

  /* Merge: real localStorage uploads override the demo seeds */
  const allUploads = [
    ...uploads,
    ...DEMO_SEED_DOCS.filter(
      (seed) => !uploads.some((u) => u.documentKey === seed.documentKey)
    ),
  ];

  const addressUpload = allUploads.find(
    (u) => u.type === "Address Proof" &&
           (u.applicant === applicantKey ||
            u.documentKey?.startsWith(applicantKey + "__Address Proof__"))
  );
  const addressSubtype = addressUpload?.subtype || "Voter ID";

  return [
    ...BASE_CHECKLIST_BEFORE_ADDRESS,
    { type: "Address Proof", subtype: addressSubtype, mandatory: true, ocrStatus: "Pending", verificationStatus: "Pending" },
    ...BASE_CHECKLIST_AFTER_ADDRESS,
  ];
}

const primaryOnlyChecklist = [
  { type: "Property Document", subtype: "Property Title / Chain Document", mandatory: false, ocrStatus: "Pending", verificationStatus: "Pending" },
  { type: "Property Document", subtype: "Agreement to Sale", mandatory: false, ocrStatus: "Pending", verificationStatus: "Pending" },
];

const filterOptions = ["All", "Pending", "Uploaded", "Verified", "Mandatory"];

/* ── Helpers ─────────────────────────────────────────────────────────── */
function getChecklistForApplicant(applicant) {
  const base = getBaseChecklist(applicant.key);
  const checklist =
    applicant.key === "Primary Applicant"
      ? [...base, ...primaryOnlyChecklist]
      : base;

  return checklist.map((item, index) => ({
    ...item,
    id: `${applicant.key}-${item.type}-${item.subtype}-${index}`,
    applicantKey: applicant.key,
    applicantName: applicant.name,
    applicantRole: applicant.role,
    documentKey: `${applicant.key}__${item.type}__${item.subtype}`,
    status: "Pending",
    source: "",
    uploadedBy: "",
    uploadedOn: "",
    fileName: "",
    fileType: "",
    previewUrl: "",
  }));
}

function buildDocumentsFromChecklist(applicants) {
  const localUploads = getUploadedDocuments();

  /* Real localStorage uploads take priority; demo seeds fill the rest */
  const allUploads = [
    ...localUploads,
    ...DEMO_SEED_DOCS.filter(
      (seed) => !localUploads.some((u) => u.documentKey === seed.documentKey)
    ),
  ];

  return applicants.flatMap((applicant) => {
    const checklist = getChecklistForApplicant(applicant);

    return checklist.map((ci) => {
      const up = allUploads.find((u) => u.documentKey === ci.documentKey);

      if (!up) return ci;

      return {
        ...ci,
        ...up,
        applicantKey: ci.applicantKey,
        applicantName: ci.applicantName,
        applicantRole: ci.applicantRole,
        documentKey: ci.documentKey,
        status: up.status || "Uploaded",
        source: up.source || "Internal Upload",
      };
    });
  });
}

function getStatusClass(status) {
  if (status === "Uploaded") return "uploaded";
  if (status === "Verified") return "verified";
  if (status === "Rejected") return "rejected";
  return "pending";
}

/* ── Component ───────────────────────────────────────────────────────── */
function DocumentsPage({ lead }) {
  const [documents, setDocuments] = useState(() =>
    buildDocumentsFromChecklist([{ key: "Primary Applicant", name: "Primary Applicant", role: "Primary Applicant" }])
  );
  const [selectedApplicantKey, setSelectedApplicantKey] = useState("Primary Applicant");
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [previewDoc, setPreviewDoc] = useState(null);

  const applicants = useMemo(() => {
    const strPrimaryName = lead
      ? `${lead.firstName || ""} ${lead.lastName || ""}`.trim() || "Primary Applicant"
      : "Primary Applicant";
    const lstApplicants = [{ key: "Primary Applicant", name: strPrimaryName, role: "Primary Applicant" }];
    const objCoApp = lead?.leadDetails?.coApplicantDetails;
    if (objCoApp && objCoApp.firstName) {
      const strCoName = `${objCoApp.firstName} ${objCoApp.lastName || ""}`.trim();
      lstApplicants.push({
        key: `Co-Applicant__${strCoName}`,
        name: strCoName,
        role: `Co-Applicant · ${objCoApp.relationship || ""}`.trimEnd().replace(/·\s*$/, ""),
      });
    }
    return lstApplicants;
  }, [lead]);

  const refreshDocuments = () => setDocuments(buildDocumentsFromChecklist(applicants));

  useEffect(() => {
    refreshDocuments();

    window.addEventListener(DOCUMENT_UPLOAD_EVENT, refreshDocuments);
    window.addEventListener("storage", refreshDocuments);

    return () => {
      window.removeEventListener(DOCUMENT_UPLOAD_EVENT, refreshDocuments);
      window.removeEventListener("storage", refreshDocuments);
    };
  }, [applicants]);

  const applicantStats = useMemo(
    () =>
      applicants.map((ap) => {
        const docs = documents.filter((d) => d.applicantKey === ap.key);
        const uploaded = docs.filter((d) => d.status === "Uploaded").length;
        const mandatory = docs.filter((d) => d.mandatory).length;
        const mandatoryUploaded = docs.filter((d) => d.mandatory && d.status === "Uploaded").length;

        return {
          ...ap,
          total: docs.length,
          uploaded,
          mandatory,
          mandatoryUploaded,
        };
      }),
    [applicants, documents]
  );

  const applicantDocuments = useMemo(
    () => documents.filter((d) => d.applicantKey === selectedApplicantKey),
    [documents, selectedApplicantKey]
  );

  const filteredDocuments = useMemo(
    () =>
      applicantDocuments.filter((doc) => {
        const matchesFilter =
          activeFilter === "All" ||
          (activeFilter === "Mandatory" && doc.mandatory) ||
          doc.status === activeFilter ||
          doc.verificationStatus === activeFilter;

        const s = searchText.trim().toLowerCase();

        const matchesSearch =
          !s ||
          doc.type.toLowerCase().includes(s) ||
          doc.subtype.toLowerCase().includes(s) ||
          String(doc.source || "").toLowerCase().includes(s);

        return matchesFilter && matchesSearch;
      }),
    [applicantDocuments, activeFilter, searchText]
  );

  const stats = useMemo(() => {
    const uploaded = applicantDocuments.filter((d) => d.status === "Uploaded").length;
    const pending = applicantDocuments.filter((d) => d.status === "Pending").length;
    const mandatory = applicantDocuments.filter((d) => d.mandatory).length;
    const mandatoryUploaded = applicantDocuments.filter((d) => d.mandatory && d.status === "Uploaded").length;

    return {
      total: applicantDocuments.length,
      uploaded,
      pending,
      mandatory,
      mandatoryUploaded,
      completion: applicantDocuments.length
        ? Math.round((uploaded / applicantDocuments.length) * 100)
        : 0,
    };
  }, [applicantDocuments]);

  const groupedDocuments = useMemo(
    () =>
      filteredDocuments.reduce((acc, doc) => {
        if (!acc[doc.type]) acc[doc.type] = [];
        acc[doc.type].push(doc);
        return acc;
      }, {}),
    [filteredDocuments]
  );

  const handleUpload = (event, doc) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const previewUrl = isImage ? URL.createObjectURL(file) : "";

    saveUploadedDocument({
      applicant: doc.applicantKey,
      applicantName: doc.applicantName,
      applicantRole: doc.applicantRole,
      type: doc.type,
      subtype: doc.subtype,
      source: "Internal Upload",
      fileName: file.name,
      fileType: isImage ? "Image" : "PDF / Document",
      previewUrl,
      ocrStatus:
        doc.type === "Identity Proof" || doc.type === "Address Proof"
          ? "Captured"
          : doc.ocrStatus === "Not Applicable"
            ? "Not Applicable"
            : "Pending Review",
      verificationStatus: doc.type === "Photograph" ? "Captured" : "Pending Review",
    });

    refreshDocuments();
  };

  const handleMarkVerified = (id) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              verificationStatus: "Verified",
            }
          : d
      )
    );
  };

  return (
    <div className="dp-page">

      {/* ── Applicant tab bar ────────────────────────────────────────── */}
      <nav className="dp-tab-bar">
        {applicantStats.map((ap) => {
          const initials = ap.name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("");

          const isActive = selectedApplicantKey === ap.key;
          const allDone = ap.mandatoryUploaded === ap.mandatory && ap.mandatory > 0;

          return (
            <button
              key={ap.key}
              type="button"
              className={`dp-tab${isActive ? " active" : ""}`}
              onClick={() => {
                setSelectedApplicantKey(ap.key);
                setActiveFilter("All");
                setSearchText("");
              }}
            >
              <span className={`dp-tab-av${allDone ? " done" : ""}`}>
                {initials}
              </span>

              <span className="dp-tab-info">
                <span className="dp-tab-name">{ap.name}</span>
                <span className="dp-tab-meta">
                  {ap.role} · {ap.uploaded}/{ap.total} docs
                </span>
              </span>

              <span className={`dp-tab-badge${allDone ? " done" : ap.uploaded > 0 ? " partial" : ""}`}>
                {ap.mandatoryUploaded}/{ap.mandatory}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div className="dp-toolbar">
        <div className="dp-filters">
          {filterOptions.map((f) => (
            <button
              key={f}
              type="button"
              className={`dp-filter-btn${activeFilter === f ? " active" : ""}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <input
          className="dp-search"
          value={searchText}
          placeholder="Search documents…"
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {/* ── Stats strip ──────────────────────────────────────────────── */}
      <div className="dp-stats-strip">
        <div className="dp-stat">
          <strong>{stats.total}</strong>
          <span>Total</span>
        </div>

        <div className="dp-stat green">
          <strong>{stats.uploaded}</strong>
          <span>Uploaded</span>
        </div>

        <div className="dp-stat amber">
          <strong>{stats.pending}</strong>
          <span>Pending</span>
        </div>

        <div className="dp-stat">
          <strong>{stats.mandatoryUploaded}/{stats.mandatory}</strong>
          <span>Mandatory</span>
        </div>

        <div className="dp-stat-progress">
          <div className="dp-progress-track">
            <div className="dp-progress-fill" style={{ width: `${stats.completion}%` }} />
          </div>
          <span>{stats.completion}%</span>
        </div>
      </div>

      {/* ── Document layout ───────────────────────────────────────────── */}
      <div className="dp-layout">
        <main className="dp-main">
          {Object.keys(groupedDocuments).length === 0 ? (
            <div className="dp-empty">No documents match the current filter.</div>
          ) : (
            Object.entries(groupedDocuments).map(([type, docs]) => (
              <section className="dp-group" key={type}>
                <div className="dp-group-head">
                  <span className="dp-group-title">{type}</span>
                  <span className="dp-group-count">
                    {docs.filter((d) => d.status === "Uploaded").length}/{docs.length} uploaded
                  </span>
                </div>

                <div className="dp-doc-list">
                  {docs.map((doc) => {
                    const isUploaded = doc.status === "Uploaded";
                    const isVerified = doc.verificationStatus === "Verified";
                    const sc = getStatusClass(doc.status);

                    return (
                      <div className={`dp-doc-row ${sc}`} key={doc.id}>

                        {/* Info */}
                        <div className="dp-row-info">
                          <div className="dp-row-title-line">
                            <span className="dp-row-name">{doc.subtype}</span>
                            {doc.mandatory && <span className="dp-req-badge">Required</span>}
                          </div>

                          {isUploaded ? (
                            <span className="dp-row-filemeta">
                              {doc.fileName} · {doc.source || "Internal Upload"}
                            </span>
                          ) : (
                            <span className="dp-row-pending">Not yet uploaded</span>
                          )}
                        </div>

                        {/* Status chips */}
                        <div className="dp-row-chips">
                          <span className={`dp-chip ${sc}`}>{doc.status}</span>

                          {doc.verificationStatus !== "Pending" && (
                            <span className={`dp-chip${isVerified ? " verified" : ""}`}>
                              {doc.verificationStatus}
                            </span>
                          )}

                          {doc.ocrStatus !== "Pending" && doc.ocrStatus !== "Not Applicable" && (
                            <span className="dp-chip ocr">{doc.ocrStatus}</span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="dp-row-actions">
                          {isUploaded && (
                            <button
                              type="button"
                              className="dp-icon-btn"
                              title="View"
                              onClick={() => setPreviewDoc(doc)}
                            >
                              <EyeIcon />
                            </button>
                          )}

                          {isUploaded && !isVerified && (
                            <button
                              type="button"
                              className="dp-icon-btn verify"
                              title="Mark verified"
                              onClick={() => handleMarkVerified(doc.id)}
                            >
                              <CheckIcon />
                            </button>
                          )}

                          <label className={`dp-upload-btn${isUploaded ? " reupload" : ""}`}>
                            {isUploaded ? <RefreshIcon /> : <UploadIcon />}
                            <span>{isUploaded ? "Re-upload" : "Upload"}</span>
                            <input
                              type="file"
                              accept="image/*,.pdf,.doc,.docx"
                              onChange={(e) => handleUpload(e, doc)}
                            />
                          </label>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </main>
      </div>

      {/* ── Preview modal ─────────────────────────────────────────────── */}
      {previewDoc && (
        <div
          className="dp-preview-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewDoc(null);
          }}
        >
          <div className="dp-preview-modal">
            <header className="dp-preview-hdr">
              <div>
                <span className="dp-preview-title">{previewDoc.subtype}</span>
                <span className="dp-preview-sub">{previewDoc.fileName}</span>
              </div>

              <button
                type="button"
                className="dp-preview-close"
                onClick={() => setPreviewDoc(null)}
              >
                <XIcon />
              </button>
            </header>

            <div className="dp-preview-body">
              {previewDoc.previewUrl ? (
                previewDoc.fileType === "PDF / Document" ||
                previewDoc.fileName?.toLowerCase().endsWith(".pdf") ? (
                  <iframe
                    src={previewDoc.previewUrl}
                    title={previewDoc.subtype}
                    className="dp-preview-pdf"
                  />
                ) : (
                  <img src={previewDoc.previewUrl} alt={previewDoc.subtype} />
                )
              ) : (
                <div className="dp-preview-empty">
                  <FileIcon />
                  <strong>{previewDoc.fileName}</strong>
                  <p>
                    Preview is available for image and PDF files only.
                  </p>
                </div>
              )}
            </div>

            <footer className="dp-preview-ftr">
              <div>
                <span>Applicant</span>
                <strong>{previewDoc.applicantName}</strong>
              </div>

              <div>
                <span>Source</span>
                <strong>{previewDoc.source || "Internal Upload"}</strong>
              </div>

              <div>
                <span>Uploaded by</span>
                <strong>{previewDoc.uploadedBy || "—"}</strong>
              </div>
            </footer>
          </div>
        </div>
      )}

    </div>
  );
}

export default DocumentsPage;
//__________________________GenAI: Generated code ends here______________________________//
