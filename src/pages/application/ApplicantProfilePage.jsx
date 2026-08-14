import { useMemo, useRef, useState } from "react";
import "./ApplicantProfilePage.css";
import { saveUploadedDocument } from "../../utils/documentStore";

/* ── Icons ───────────────────────────────────────────────────────────── */
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.7">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const UploadIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="M17 8l-5-5-5 5" /><path d="M12 3v12" />
  </svg>
);
const UserIcon = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const FileIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
    <path d="M14 2v6h6" /><path d="M8 13h8" /><path d="M8 17h5" />
  </svg>
);
const PencilIcon = () => (
  <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </svg>
);
const CropIcon = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M6 2v14h14" /><path d="M2 6h14v14" />
  </svg>
);
const ScanIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M4 7V5a1 1 0 0 1 1-1h2" /><path d="M17 4h2a1 1 0 0 1 1 1v2" />
    <path d="M20 17v2a1 1 0 0 1-1 1h-2" /><path d="M7 20H5a1 1 0 0 1-1-1v-2" />
    <path d="M7 12h10" />
  </svg>
);
const SpinnerIcon = () => (
  <svg className="ap-spin-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

/* ── Mock data ───────────────────────────────────────────────────────── */
const defaultProfile = {
  firstName: "Shivanjali", middleName: "Sadanand", lastName: "Gaikwad",
  gender: "Female", dateOfBirth: "1996-01-11", maritalStatus: "Single",
  fatherName: "Sadanand Gaikwad", motherName: "",
  spouseName: "", nationality: "Indian",
  residentialStatus: "Resident Indian",
};

const emptyAddress = {
  line1: "", line2: "", landmark: "", city: "",
  district: "", state: "", pincode: "", country: "India",
};

const voterIdAddress = {
  line1: "D-303, Fortune Estates Scorpio", line2: "Hadasar",
  landmark: "", city: "Pune",
  district: "Pune", state: "Maharashtra", pincode: "411028", country: "India",
};

const mockAddressByProof = {
  Aadhaar: {
    line1: "Flat 402, Shree Heights", line2: "Andheri Kurla Road",
    landmark: "Near Metro Station", city: "Mumbai",
    district: "Mumbai Suburban", state: "Maharashtra", pincode: "400059", country: "India",
  },
  "Driving License": {
    line1: "B-1204, Lake View Residency", line2: "Powai Main Road",
    landmark: "Opposite Hiranandani Gardens", city: "Mumbai",
    district: "Mumbai Suburban", state: "Maharashtra", pincode: "400076", country: "India",
  },
  "Voter ID": voterIdAddress,
  Passport: {
    line1: "301, Orchid Enclave", line2: "Linking Road",
    landmark: "Near National College", city: "Mumbai",
    district: "Mumbai Suburban", state: "Maharashtra", pincode: "400050", country: "India",
  },
};

/* ── Crop Modal ──────────────────────────────────────────────────────── */
// Passport size ratio: 35mm × 45mm → 7:9
const FRAME_W = 210;
const FRAME_H = 270;

function CropModal({ imageSrc, onSave, onCancel }) {
  const canvasRef = useRef(null);
  const imgRef    = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [pos,        setPos]        = useState({ x: 0, y: 0 });
  const [startDrag,  setStartDrag]  = useState({ x: 0, y: 0 });
  const [scale,      setScale]      = useState(1);

  const clamp = (p, s) => {
    const img = imgRef.current;
    if (!img) return p;
    return {
      x: Math.min(0, Math.max(FRAME_W - img.naturalWidth  * s, p.x)),
      y: Math.min(0, Math.max(FRAME_H - img.naturalHeight * s, p.y)),
    };
  };

  const onImgLoad = () => {
    const img = imgRef.current;
    if (!img) return;
    const fit = Math.max(FRAME_W / img.naturalWidth, FRAME_H / img.naturalHeight);
    const s = Math.max(fit, 1);
    setScale(s);
    setPos(clamp({ x: (FRAME_W - img.naturalWidth * s) / 2, y: (FRAME_H - img.naturalHeight * s) / 2 }, s));
  };

  const zoom = (newScale, pivotX = FRAME_W / 2, pivotY = FRAME_H / 2) => {
    const s = Math.min(Math.max(newScale, 0.5), 5);
    const r = s / scale;
    setScale(s);
    setPos(clamp({ x: pivotX - (pivotX - pos.x) * r, y: pivotY - (pivotY - pos.y) * r }, s));
  };

  const onMouseDown  = (e) => { e.preventDefault(); setIsDragging(true); setStartDrag({ x: e.clientX - pos.x, y: e.clientY - pos.y }); };
  const onMouseMove  = (e) => { if (!isDragging) return; setPos(clamp({ x: e.clientX - startDrag.x, y: e.clientY - startDrag.y }, scale)); };
  const onMouseUp    = ()  => setIsDragging(false);
  const onTouchStart = (e) => { const t = e.touches[0]; setIsDragging(true); setStartDrag({ x: t.clientX - pos.x, y: t.clientY - pos.y }); };
  const onTouchMove  = (e) => { if (!isDragging) return; const t = e.touches[0]; setPos(clamp({ x: t.clientX - startDrag.x, y: t.clientY - startDrag.y }, scale)); };
  const onTouchEnd   = ()  => setIsDragging(false);
  const onWheel      = (e) => { e.preventDefault(); zoom(scale * (e.deltaY > 0 ? 0.92 : 1.09)); };

  const handleSave = () => {
    const canvas = canvasRef.current;
    const img    = imgRef.current;
    if (!canvas || !img) return;
    // Output at 350×450 px (passport 7:9 ratio, high-res)
    const OUT_W = 350;
    const OUT_H = 450;
    canvas.width  = OUT_W;
    canvas.height = OUT_H;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, -pos.x / scale, -pos.y / scale, FRAME_W / scale, FRAME_H / scale, 0, 0, OUT_W, OUT_H);
    canvas.toBlob((blob) => { if (blob) onSave(URL.createObjectURL(blob)); }, "image/jpeg", 0.92);
  };

  return (
    <div className="ap-crop-backdrop" onClick={onCancel}>
      <div className="ap-crop-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="ap-crop-header">
          <span className="ap-crop-title">Crop Photo</span>
          <span className="ap-crop-hint">Drag to reposition · scroll to zoom</span>
        </div>
        <div
          className="ap-crop-frame"
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
          onMouseDown={onMouseDown} onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}    onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
          onWheel={onWheel}
        >
          <img
            ref={imgRef} src={imageSrc} alt="" className="ap-crop-img"
            style={{ transform: `translate(${pos.x}px,${pos.y}px) scale(${scale})`, transformOrigin: "0 0" }}
            onLoad={onImgLoad} draggable={false}
          />
        </div>
        <div className="ap-crop-zoom-row">
          <span>Zoom</span>
          <input
            type="range" min="0.5" max="4" step="0.02" value={scale}
            className="ap-crop-range"
            onChange={(e) => zoom(+e.target.value)}
          />
        </div>
        <div className="ap-crop-actions">
          <button className="ap-btn-ghost" type="button" onClick={onCancel}>Cancel</button>
          <button className="ap-btn-primary" type="button" onClick={handleSave}>
            <CheckIcon /> Save Photo
          </button>
        </div>
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
}

/* ── Field components ────────────────────────────────────────────────── */
function FieldRow({ label, value, editing, placeholder, type = "text", onChange, wide, children }) {
  return (
    <div className={`ap-field${wide ? " wide" : ""}`}>
      <span className="ap-field-label">{label}</span>
      {editing ? (
        children || (
          <input
            className="ap-input" type={type}
            value={value || ""} placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        )
      ) : (
        <div className="ap-field-readonly">
          {value || <span className="ap-field-empty">—</span>}
        </div>
      )}
    </div>
  );
}

function SelectField({ label, value, editing, onChange, options, wide }) {
  return (
    <div className={`ap-field${wide ? " wide" : ""}`}>
      <span className="ap-field-label">{label}</span>
      {editing ? (
        <select className="ap-input ap-select" value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => (
            <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
          ))}
        </select>
      ) : (
        <div className="ap-field-readonly">{value || <span className="ap-field-empty">—</span>}</div>
      )}
    </div>
  );
}

/* ── Address group ───────────────────────────────────────────────────── */
function AddressGroup({ title, badge, address, onChange, locked }) {
  const [editing, setEditing] = useState(false);
  const canEdit = !locked;
  const upd     = (key, val) => onChange({ ...address, [key]: val });

  return (
    <div className="ap-addr-group">
      <div className="ap-addr-group-head">
        <div className="ap-addr-group-meta">
          <span className="ap-addr-group-title">{title}</span>
          {badge && <span className="ap-badge-pill">{badge}</span>}
        </div>
        {canEdit && (
          <button className="ap-edit-btn" type="button" onClick={() => setEditing((v) => !v)}>
            {editing ? <><CheckIcon /> Done</> : <><PencilIcon /> Edit</>}
          </button>
        )}
      </div>
      <div className="ap-field-grid-2">
        <FieldRow label="Line 1"   value={address.line1}    editing={editing && canEdit} wide placeholder="House / flat / building" onChange={(v) => upd("line1",    v)} />
        <FieldRow label="Line 2"   value={address.line2}    editing={editing && canEdit} wide placeholder="Street / area"            onChange={(v) => upd("line2",    v)} />
        <FieldRow label="Landmark" value={address.landmark} editing={editing && canEdit} placeholder="Nearby landmark"               onChange={(v) => upd("landmark", v)} />
        <FieldRow label="City"     value={address.city}     editing={editing && canEdit} placeholder="City"                          onChange={(v) => upd("city",     v)} />
        <FieldRow label="District" value={address.district} editing={editing && canEdit} placeholder="District"                      onChange={(v) => upd("district", v)} />
        <FieldRow label="State"    value={address.state}    editing={editing && canEdit} placeholder="State"                         onChange={(v) => upd("state",    v)} />
        <FieldRow label="PIN Code" value={address.pincode}  editing={editing && canEdit} placeholder="PIN code"                      onChange={(v) => upd("pincode",  v)} />
        <FieldRow label="Country"  value={address.country}  editing={editing && canEdit} placeholder="Country"                       onChange={(v) => upd("country",  v)} />
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────── */
function ApplicantProfilePage({ isCoApplicant = false }) {
  // Photo
  const photoInputRef     = useRef(null);
  const [photoPreview,    setPhotoPreview]    = useState(isCoApplicant ? "" : "/images/profile.jpg");
  const [photoCropSrc,    setPhotoCropSrc]    = useState("");
  const [photoName,       setPhotoName]       = useState(isCoApplicant ? "" : "Profile.jpg");
  const [showCropModal,   setShowCropModal]   = useState(false);

  // Personal details
  const [profile,         setProfile]         = useState(isCoApplicant ? {
    firstName: "", middleName: "", lastName: "",
    gender: "", dateOfBirth: "", maritalStatus: "",
    fatherName: "", motherName: "",
    spouseName: "", nationality: "Indian",
    residentialStatus: "Resident Indian",
  } : defaultProfile);
  const [isEditingProfile,setIsEditingProfile] = useState(false);

  // Address proof
  const [addressProofType,    setAddressProofType]    = useState("Voter ID");
  const [addressProofName,    setAddressProofName]    = useState(isCoApplicant ? "" : "Voter Id_1550.pdf");
  const [addressProofPreview, setAddressProofPreview] = useState(isCoApplicant ? "" : "/docs/Voter Id_1550.pdf");
  const [addressProofIsPdf,   setAddressProofIsPdf]   = useState(!isCoApplicant);
  const [isOcrScanning,       setIsOcrScanning]       = useState(false);
  const [ocrDone,             setOcrDone]             = useState(!isCoApplicant);
  const [ocrExtracted,        setOcrExtracted]        = useState(isCoApplicant ? null : voterIdAddress);

  // Addresses
  const [permanentAddress,  setPermanentAddress]  = useState(isCoApplicant ? emptyAddress : voterIdAddress);
  const [residentialAddress, setResidentialAddress] = useState(isCoApplicant ? emptyAddress : voterIdAddress);
  const [sameAsPermanent,    setSameAsPermanent]    = useState(!isCoApplicant);
  const [preferredAddress,   setPreferredAddress]   = useState("Residential");

  const communicationAddress = useMemo(() => {
    if (preferredAddress === "Permanent") return permanentAddress;
    return sameAsPermanent ? permanentAddress : residentialAddress;
  }, [preferredAddress, permanentAddress, residentialAddress, sameAsPermanent]);

  /* ── Photo handlers ── */
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoName(file.name);
    setPhotoCropSrc(URL.createObjectURL(file));
    setShowCropModal(true);
    if (e.target) e.target.value = "";
  };

  const handleCropSave = (croppedUrl) => {
    setPhotoPreview(croppedUrl);
    setShowCropModal(false);
    saveUploadedDocument({
      applicant: "Primary Applicant", type: "Photograph", subtype: "Applicant Photo",
      source: "Applicant Profile", fileName: photoName, fileType: "Image",
      previewUrl: croppedUrl, ocrStatus: "Not Applicable", verificationStatus: "Captured",
    });
  };

  /* ── Profile handlers ── */
  const updateProfile = (key, value) => setProfile((prev) => ({ ...prev, [key]: value }));

  /* ── Address proof upload → auto OCR ── */
  const handleAddressProofUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImg = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const previewUrl = (isImg || isPdf) ? URL.createObjectURL(file) : "";
    setAddressProofName(file.name);
    setAddressProofPreview(previewUrl);
    setAddressProofIsPdf(isPdf);
    setOcrDone(false);
    setOcrExtracted(null);
    if (e.target) e.target.value = "";

    // Auto-start OCR
    window.setTimeout(() => {
      setIsOcrScanning(true);
      window.setTimeout(() => {
        const extracted = mockAddressByProof[addressProofType] || mockAddressByProof.Aadhaar;
        setPermanentAddress(extracted);
        if (sameAsPermanent) setResidentialAddress(extracted);
        saveUploadedDocument({
          applicant: "Primary Applicant", type: "Address Proof", subtype: addressProofType,
          source: "Applicant Profile", fileName: file.name,
          fileType: isImg ? "Image" : "PDF / Document",
          previewUrl, ocrStatus: "Completed", verificationStatus: "Pending Review",
        });
        setIsOcrScanning(false);
        setOcrDone(true);
        setOcrExtracted(extracted);
      }, 2800);
    }, 500);
  };

  /* ── Same-as-permanent ── */
  const handleSameAsPermanent = (checked) => {
    setSameAsPermanent(checked);
    setResidentialAddress(checked ? permanentAddress : emptyAddress);
  };

  const handlePermanentChange = (next) => {
    setPermanentAddress(next);
    if (sameAsPermanent) setResidentialAddress(next);
  };

  /* ── Render ── */
  return (
    <div className="ap-page">

      {/* ── Section: Photograph ──────────────────────────────────────── */}
      <div className="ap-section">
        <div className="ap-section-head">
          <div>
            <span className="ap-section-title">Photograph</span>
            <span className="ap-section-sub">Attach a recent passport-style photo of the applicant</span>
          </div>
          {photoPreview && <span className="ap-badge green"><CheckIcon /> Captured</span>}
        </div>

        <div className="ap-photo-row">
          <div className="ap-photo-avatar">
            {photoPreview
              ? <img src={photoPreview} alt="Applicant" className="ap-photo-img" />
              : <div className="ap-photo-placeholder"><UserIcon /></div>
            }
          </div>
          <div className="ap-photo-info">
            {photoPreview ? (
              <span className="ap-photo-filename">{photoName}</span>
            ) : (
              <>
                <span className="ap-copy-main">Upload applicant photograph</span>
                <span className="ap-copy-sub">JPG or PNG · front-facing · plain background recommended</span>
              </>
            )}
            <div className="ap-photo-actions">
              <label className="ap-btn-secondary">
                <UploadIcon /> {photoPreview ? "Replace" : "Choose Photo"}
                <input ref={photoInputRef} type="file" accept="image/*" hidden onChange={handlePhotoSelect} />
              </label>
              {photoPreview && (
                <button className="ap-btn-ghost" type="button" onClick={() => setShowCropModal(true)}>
                  <CropIcon /> Crop & Adjust
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="ap-divider" />

      {/* ── Section: Personal Details ─────────────────────────────────── */}
      <div className="ap-section">
        <div className="ap-section-head">
          <div>
            <span className="ap-section-title">Personal Details</span>
            <span className="ap-section-sub">Basic applicant information, family details and demographics</span>
          </div>
          <button className="ap-edit-btn" type="button" onClick={() => setIsEditingProfile((v) => !v)}>
            {isEditingProfile ? <><CheckIcon /> Done</> : <><PencilIcon /> Edit</>}
          </button>
        </div>

        <div className="ap-field-grid-3">
          <FieldRow     label="First Name"        value={profile.firstName}        editing={isEditingProfile} placeholder="First name"   onChange={(v) => updateProfile("firstName",        v)} />
          <FieldRow     label="Middle Name"        value={profile.middleName}       editing={isEditingProfile} placeholder="Middle name"  onChange={(v) => updateProfile("middleName",       v)} />
          <FieldRow     label="Last Name"          value={profile.lastName}         editing={isEditingProfile} placeholder="Last name"    onChange={(v) => updateProfile("lastName",         v)} />
          <SelectField  label="Gender"             value={profile.gender}           editing={isEditingProfile} onChange={(v) => updateProfile("gender", v)}
            options={["", "Male", "Female", "Other"].map(o => ({ value: o, label: o || "Select gender" }))} />
          <FieldRow     label="Date of Birth"      value={profile.dateOfBirth}      editing={isEditingProfile} type="date"               onChange={(v) => updateProfile("dateOfBirth",      v)} />
          <SelectField  label="Marital Status"     value={profile.maritalStatus}    editing={isEditingProfile} onChange={(v) => updateProfile("maritalStatus", v)}
            options={["", "Single", "Married", "Divorced", "Widowed"].map(o => ({ value: o, label: o || "Select status" }))} />
          <FieldRow     label="Father's Name"      value={profile.fatherName}       editing={isEditingProfile} placeholder="Father's full name"  onChange={(v) => updateProfile("fatherName",      v)} />
          <FieldRow     label="Mother's Name"      value={profile.motherName}       editing={isEditingProfile} placeholder="Mother's full name"  onChange={(v) => updateProfile("motherName",      v)} />
          <FieldRow     label="Spouse Name"        value={profile.spouseName}       editing={isEditingProfile} placeholder="Spouse name"        onChange={(v) => updateProfile("spouseName",       v)} />
          <FieldRow     label="Nationality"        value={profile.nationality}      editing={isEditingProfile} placeholder="Nationality"        onChange={(v) => updateProfile("nationality",      v)} />
          <SelectField  label="Residential Status" value={profile.residentialStatus} editing={isEditingProfile} onChange={(v) => updateProfile("residentialStatus", v)}
            options={["Resident Indian", "Non Resident Indian"].map(o => ({ value: o, label: o }))} />
        </div>
      </div>

      <div className="ap-divider" />

      {/* ── Section: Address Proof ────────────────────────────────────── */}
      <div className="ap-section">
        <div className="ap-section-head">
          <div>
            <span className="ap-section-title">Address Proof</span>
            <span className="ap-section-sub">Upload a document to automatically populate the permanent address</span>
          </div>
          {ocrDone && <span className="ap-badge green"><CheckIcon /> Extracted</span>}
        </div>

        {/* OCR result banner */}
        {ocrDone && !isOcrScanning && ocrExtracted && (
          <div className="ap-banner info">
            <ScanIcon />
            <div className="ap-banner-body">
              <strong>Address extracted from {addressProofType}</strong>
              <p>
                {ocrExtracted.line1}
                {ocrExtracted.city    ? `, ${ocrExtracted.city}`    : ""}
                {ocrExtracted.state   ? `, ${ocrExtracted.state}`   : ""}
                {ocrExtracted.pincode ? ` — ${ocrExtracted.pincode}`: ""}
              </p>
            </div>
          </div>
        )}

        <div className="ap-proof-layout">
          {/* Controls */}
          <div className="ap-proof-controls">
            <div className="ap-field">
              <span className="ap-field-label">Document type</span>
              <select
                className="ap-input ap-select"
                value={addressProofType}
                onChange={(e) => { setAddressProofType(e.target.value); setOcrDone(false); setOcrExtracted(null); }}
              >
                <option>Aadhaar</option>
                <option>Driving License</option>
                <option>Voter ID</option>
                <option>Passport</option>
              </select>
            </div>

            <label className="ap-btn-secondary upload-label">
              <UploadIcon /> Upload {addressProofType}
              <input type="file" accept="image/*,.pdf" hidden onChange={handleAddressProofUpload} />
            </label>

            {addressProofName && (
              <div className="ap-file-badge">
                <CheckIcon /> {addressProofName}
              </div>
            )}

            <span className="ap-helper-text">
              Address fields are automatically populated from the uploaded document
            </span>
          </div>

          {/* Preview */}
          <div className="ap-proof-preview">
            {isOcrScanning && (
              <div className="ap-ocr-overlay">
                <div className="ap-scan-beam" />
                <div className="ap-scan-status"><SpinnerIcon /> Reading document</div>
              </div>
            )}
            {addressProofPreview ? (
              addressProofIsPdf ? (
                <iframe
                  src={addressProofPreview}
                  title="Address proof"
                  className="ap-proof-iframe"
                />
              ) : (
                <img src={addressProofPreview} alt="Address proof" className="ap-proof-img" />
              )
            ) : (
              <div className="ap-proof-empty">
                <FileIcon />
                <span>Preview appears here</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="ap-divider" />

      {/* ── Section: Addresses ───────────────────────────────────────── */}
      <div className="ap-section">
        <div className="ap-section-head">
          <div>
            <span className="ap-section-title">Addresses</span>
            <span className="ap-section-sub">Permanent and residential address details</span>
          </div>
        </div>

        <AddressGroup
          title="Permanent Address"
          badge={ocrDone ? `Captured from ${addressProofType}` : undefined}
          address={permanentAddress}
          onChange={handlePermanentChange}
        />

        <label className="ap-same-toggle">
          <input
            type="checkbox"
            checked={sameAsPermanent}
            onChange={(e) => handleSameAsPermanent(e.target.checked)}
          />
          <span>Residential address is same as permanent address</span>
        </label>

        <AddressGroup
          title="Residential Address"
          badge={sameAsPermanent ? "Same as permanent" : undefined}
          address={sameAsPermanent ? permanentAddress : residentialAddress}
          onChange={setResidentialAddress}
          locked={sameAsPermanent}
        />
      </div>

      <div className="ap-divider" />

      {/* ── Section: Communication ────────────────────────────────────── */}
      <div className="ap-section">
        <div className="ap-section-head">
          <div>
            <span className="ap-section-title">Communication Address</span>
            <span className="ap-section-sub">Select which address to use for correspondence</span>
          </div>
        </div>

        <div className="ap-comm-toggle">
          {["Residential", "Permanent"].map((type) => (
            <button
              key={type}
              type="button"
              className={`ap-comm-option${preferredAddress === type ? " active" : ""}`}
              onClick={() => setPreferredAddress(type)}
            >
              <span className="ap-comm-dot" />
              {type} Address
            </button>
          ))}
        </div>

        {communicationAddress.line1 && (
          <div className="ap-comm-address-preview">
            <span className="ap-field-label">Selected address</span>
            <span className="ap-comm-address-text">
              {communicationAddress.line1}
              {communicationAddress.city    ? `, ${communicationAddress.city}`    : ""}
              {communicationAddress.state   ? `, ${communicationAddress.state}`   : ""}
              {communicationAddress.pincode ? ` — ${communicationAddress.pincode}`: ""}
            </span>
          </div>
        )}
      </div>

      {/* ── Crop Modal ── */}
      {showCropModal && photoCropSrc && (
        <CropModal
          imageSrc={photoCropSrc}
          onSave={handleCropSave}
          onCancel={() => setShowCropModal(false)}
        />
      )}
    </div>
  );
}

export default ApplicantProfilePage;