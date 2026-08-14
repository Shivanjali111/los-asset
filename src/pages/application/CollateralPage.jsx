import { useState } from "react";
import "./CollateralPage.css";

/* ── Icons ───────────────────────────────────────────────────────────── */
const PencilIcon = () => (
  <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4">
    <path d="M12 5v14" /><path d="M5 12h14" />
  </svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.4">
    <path d="M18 6 6 18" /><path d="M6 6l12 12" />
  </svg>
);

/* ── Property type value map (API → component) ───────────────────────── */
const PROPERTY_TYPE_MAP = {
  "Apartment":          "Flat / Apartment",
  "Flat":               "Flat / Apartment",
  "Flat / Apartment":   "Flat / Apartment",
  "House":              "Independent House",
  "Independent House":  "Independent House",
  "Villa":              "Villa",
  "Row House":          "Row House",
  "Shop":               "Shop",
  "Office":             "Office",
  "Plot":               "Plot",
  "Warehouse":          "Warehouse",
};

/* ── Seed collateral from leadDetails ────────────────────────────────── */
const buildCollateralFromLead = (leadDetails = null) => {
  const defaultCollateral = {
    propertyIdentified:    "Yes",
    collateralType:        "Residential Property",
    propertyType:          "",
    propertyUsage:         "Self Occupied",
    propertyStage:         "Under Construction",
    occupancyStatus:       "Builder Possession",
    propertyOwnershipType: "Owned",
    projectName:           "",
    builderName:           "",
    towerBlock:            "",
    unitNumber:            "",
    floorNumber:           "",
    totalFloors:           "",
    carpetArea:            "",
    builtUpArea:           "",
    areaUnit:              "",
    propertyAgeYears:      "",
    agreementValue:        "",
    estimatedMarketValue:  "",
    valuationAmount:       "",
    existingMortgage:      "",
    mortgageBankName:      "",
    outstandingLoanAmount: "",
  };
  const defaultAddress = { line1: "", line2: "", landmark: "", city: "", district: "Pune", state: "Maharashtra", pincode: "", country: "India" };

  if (!leadDetails?.collateralDetails) {
    return { collateral: defaultCollateral, address: defaultAddress };
  }

  const cd = leadDetails.collateralDetails;
  return {
    collateral: {
      ...defaultCollateral,
      propertyType:  PROPERTY_TYPE_MAP[cd.propertyType] || cd.propertyType || "",
      propertyStage: cd.propertyStage   || "Under Construction",
      builderName:   cd.builderName     || "",
      projectName:   cd.propertyAddress || "",
    },
    address: defaultAddress,
  };
};

const initialOwners = [];

const collateralTypeOptions  = ["Residential Property", "Commercial Property", "Plot / Land", "Industrial Property"];
const propertyTypeOptions    = ["Flat / Apartment", "Independent House", "Villa", "Row House", "Shop", "Office", "Plot", "Warehouse"];
const propertyUsageOptions   = ["Self Occupied", "Rented", "Vacant", "Under Construction", "Business Use"];
const propertyStageOptions   = ["Ready to Move", "Under Construction", "Resale", "New Booking"];
const occupancyStatusOptions = ["Occupied by Applicant", "Occupied by Tenant", "Vacant", "Builder Possession", "Seller Possession"];
const ownershipTypeOptions   = ["Owned", "Jointly Owned", "Ancestral", "Leasehold", "Under Transfer"];
const areaUnitOptions        = ["Sq. Ft.", "Sq. Meter", "Acre", "Guntha"];

/* ── Field components ───────────────────────────────────────────────── */
function FieldRow({ label, value, onChange, editing, type = "text", placeholder }) {
  return (
    <div className="cp-field">
      <span className="cp-field-label">{label}</span>
      {editing ? (
        <input
          className="cp-input"
          type={type}
          value={value || ""}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <div className={`cp-field-ro${!value ? " empty" : ""}`}>{value || "—"}</div>
      )}
    </div>
  );
}

function SelectField({ label, value, onChange, editing, options }) {
  return (
    <div className="cp-field">
      <span className="cp-field-label">{label}</span>
      {editing ? (
        <select className="cp-input cp-select" value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <div className={`cp-field-ro${!value ? " empty" : ""}`}>{value || "—"}</div>
      )}
    </div>
  );
}

function CurrencyField({ label, value, onChange, editing }) {
  const formatted = value ? `₹ ${Number(value).toLocaleString("en-IN")}` : "—";
  return (
    <div className="cp-field">
      <span className="cp-field-label">{label}</span>
      {editing ? (
        <div className="cp-currency-wrap">
          <span>₹</span>
          <input
            className="cp-currency-inner"
            type="number"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      ) : (
        <div className={`cp-field-ro${!value ? " empty" : ""}`}>{formatted}</div>
      )}
    </div>
  );
}

function SectionHead({ title, sub, editing, onEdit, action }) {
  return (
    <div className="cp-section-head">
      <div>
        <span className="cp-section-title">{title}</span>
        {sub && <span className="cp-section-sub">{sub}</span>}
      </div>
      {action || (
        <button className="cp-edit-btn" type="button" onClick={onEdit}>
          <PencilIcon /> {editing ? "Done" : "Edit"}
        </button>
      )}
    </div>
  );
}

/* ── Component ───────────────────────────────────────────────────────── */
function CollateralPage({ lead }) {
  const { collateral: seedCollateral, address: seedAddress } = buildCollateralFromLead(lead?.leadDetails ?? null);
  const [collateral, setCollateral] = useState(seedCollateral);
  const [address,    setAddress]    = useState(seedAddress);
  const [owners,     setOwners]     = useState(initialOwners);
  const [editing,    setEditing]    = useState({ basic: false, unit: false, addr: false, valuation: false });

  const upd      = (key, val) => setCollateral((p) => ({ ...p, [key]: val }));
  const updAddr  = (key, val) => setAddress((p) => ({ ...p, [key]: val }));
  const updOwner = (id, key, val) => setOwners((p) => p.map((o) => o.id === id ? { ...o, [key]: val } : o));
  const toggle   = (s) => setEditing((p) => ({ ...p, [s]: !p[s] }));

  const addOwner = () => setOwners((p) => [...p, { id: `OWN-${Date.now()}`, name: "", role: "Property Owner", ownershipShare: "", pan: "" }]);
  const removeOwner = (id) => setOwners((p) => p.filter((o) => o.id !== id));

  return (
    <div className="cp-page">

      {/* ── Page bar ────────────────────────────────────────────────── */}
      <div className="cp-page-bar">
        <span className="cp-page-title">Collateral Details</span>
        <span className="cp-page-sub">Property information, ownership and valuation for this application</span>
      </div>

      {/* ── Layout ──────────────────────────────────────────────────── */}
      <div className="cp-layout">
        <div className="cp-main">

          {/* ── Basic Information ── */}
          <div className="cp-section">
            <SectionHead
              title="Basic Information"
              sub="Property type, usage and classification"
              editing={editing.basic}
              onEdit={() => toggle("basic")}
            />
            <div className="cp-field-grid-3">
              <SelectField label="Property Identified"  value={collateral.propertyIdentified}    onChange={(v) => upd("propertyIdentified", v)}    editing={editing.basic} options={["Yes", "No"]} />
              <SelectField label="Collateral Type"      value={collateral.collateralType}         onChange={(v) => upd("collateralType", v)}         editing={editing.basic} options={collateralTypeOptions} />
              <SelectField label="Property Type"        value={collateral.propertyType}           onChange={(v) => upd("propertyType", v)}           editing={editing.basic} options={propertyTypeOptions} />
              <SelectField label="Property Usage"       value={collateral.propertyUsage}          onChange={(v) => upd("propertyUsage", v)}          editing={editing.basic} options={propertyUsageOptions} />
              <SelectField label="Property Stage"       value={collateral.propertyStage}          onChange={(v) => upd("propertyStage", v)}          editing={editing.basic} options={propertyStageOptions} />
              <SelectField label="Occupancy Status"     value={collateral.occupancyStatus}        onChange={(v) => upd("occupancyStatus", v)}        editing={editing.basic} options={occupancyStatusOptions} />
              <SelectField label="Ownership Type"       value={collateral.propertyOwnershipType}  onChange={(v) => upd("propertyOwnershipType", v)}  editing={editing.basic} options={ownershipTypeOptions} />
            </div>
          </div>

          <div className="cp-divider" />

          {/* ── Unit Details ── */}
          <div className="cp-section">
            <SectionHead
              title="Unit Details"
              sub="Project name, floor, area and age"
              editing={editing.unit}
              onEdit={() => toggle("unit")}
            />
            <div className="cp-field-grid-3">
              <FieldRow label="Project / Property Name" value={collateral.projectName}    onChange={(v) => upd("projectName", v)}    editing={editing.unit} placeholder="Project name" />
              <FieldRow label="Builder Name"            value={collateral.builderName}    onChange={(v) => upd("builderName", v)}    editing={editing.unit} placeholder="Builder / seller name" />
              <FieldRow label="Tower / Block"           value={collateral.towerBlock}     onChange={(v) => upd("towerBlock", v)}     editing={editing.unit} placeholder="Tower / block" />
              <FieldRow label="Unit Number"             value={collateral.unitNumber}     onChange={(v) => upd("unitNumber", v)}     editing={editing.unit} placeholder="Flat / unit number" />
              <FieldRow label="Floor Number"            value={collateral.floorNumber}    onChange={(v) => upd("floorNumber", v)}    editing={editing.unit} placeholder="Floor" type="number" />
              <FieldRow label="Total Floors"            value={collateral.totalFloors}    onChange={(v) => upd("totalFloors", v)}    editing={editing.unit} placeholder="Total floors" type="number" />
              <FieldRow label="Carpet Area"             value={collateral.carpetArea}     onChange={(v) => upd("carpetArea", v)}     editing={editing.unit} placeholder="Carpet area" type="number" />
              <FieldRow label="Built-up Area"           value={collateral.builtUpArea}    onChange={(v) => upd("builtUpArea", v)}    editing={editing.unit} placeholder="Built-up area" type="number" />
              <SelectField label="Area Unit"            value={collateral.areaUnit}       onChange={(v) => upd("areaUnit", v)}       editing={editing.unit} options={areaUnitOptions} />
              <FieldRow label="Property Age (years)"    value={collateral.propertyAgeYears} onChange={(v) => upd("propertyAgeYears", v)} editing={editing.unit} placeholder="Age in years" type="number" />
            </div>
          </div>

          <div className="cp-divider" />

          {/* ── Property Address ── */}
          <div className="cp-section">
            <SectionHead
              title="Property Address"
              sub="Exact location for technical and legal verification"
              editing={editing.addr}
              onEdit={() => toggle("addr")}
            />
            <div className="cp-field-grid-2">
              <FieldRow label="Address Line 1" value={address.line1}    onChange={(v) => updAddr("line1", v)}    editing={editing.addr} placeholder="Flat / house / building" />
              <FieldRow label="Address Line 2" value={address.line2}    onChange={(v) => updAddr("line2", v)}    editing={editing.addr} placeholder="Street / area" />
              <FieldRow label="Landmark"       value={address.landmark} onChange={(v) => updAddr("landmark", v)} editing={editing.addr} placeholder="Nearby landmark" />
              <FieldRow label="City"           value={address.city}     onChange={(v) => updAddr("city", v)}     editing={editing.addr} placeholder="City" />
              <FieldRow label="District"       value={address.district} onChange={(v) => updAddr("district", v)} editing={editing.addr} placeholder="District" />
              <FieldRow label="State"          value={address.state}    onChange={(v) => updAddr("state", v)}    editing={editing.addr} placeholder="State" />
              <FieldRow label="PIN Code"       value={address.pincode}  onChange={(v) => updAddr("pincode", v)}  editing={editing.addr} placeholder="PIN code" />
              <FieldRow label="Country"        value={address.country}  onChange={(v) => updAddr("country", v)}  editing={editing.addr} placeholder="Country" />
            </div>
          </div>

          <div className="cp-divider" />

          {/* ── Property Owners ── */}
          <div className="cp-section">
            <SectionHead
              title="Property Owners"
              sub="Ownership share and identification"
              action={
                <button className="cp-edit-btn" type="button" onClick={addOwner}>
                  <PlusIcon /> Add Owner
                </button>
              }
            />
            <div className="cp-owner-list">
              {owners.map((owner) => {
                const initials = owner.name
                  ? owner.name.split(" ").map((n) => n[0]).slice(0, 2).join("")
                  : "OW";
                return (
                  <div className="cp-owner-row" key={owner.id}>
                    <div className="cp-owner-av">{initials}</div>
                    <div className="cp-owner-fields">
                      <div className="cp-field-grid-4">
                        <div className="cp-field">
                          <span className="cp-field-label">Owner Name</span>
                          <input className="cp-input" value={owner.name} placeholder="Owner name" onChange={(e) => updOwner(owner.id, "name", e.target.value)} />
                        </div>
                        <div className="cp-field">
                          <span className="cp-field-label">Role</span>
                          <input className="cp-input" value={owner.role} placeholder="Role" onChange={(e) => updOwner(owner.id, "role", e.target.value)} />
                        </div>
                        <div className="cp-field">
                          <span className="cp-field-label">Share %</span>
                          <input className="cp-input" type="number" value={owner.ownershipShare} placeholder="Share %" onChange={(e) => updOwner(owner.id, "ownershipShare", e.target.value)} />
                        </div>
                        <div className="cp-field">
                          <span className="cp-field-label">PAN</span>
                          <input className="cp-input" value={owner.pan} placeholder="PAN" onChange={(e) => updOwner(owner.id, "pan", e.target.value.toUpperCase())} />
                        </div>
                      </div>
                    </div>
                    {owners.length > 1 && (
                      <button className="cp-remove-btn" type="button" onClick={() => removeOwner(owner.id)}>
                        <XIcon />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="cp-divider" />

          {/* ── Valuation & Mortgage ── */}
          <div className="cp-section">
            <SectionHead
              title="Valuation & Mortgage"
              sub="Property value and existing loan details"
              editing={editing.valuation}
              onEdit={() => toggle("valuation")}
            />
            <div className="cp-field-grid-3">
              <CurrencyField label="Agreement Value"        value={collateral.agreementValue}       onChange={(v) => upd("agreementValue", v)}       editing={editing.valuation} />
              <CurrencyField label="Estimated Market Value" value={collateral.estimatedMarketValue} onChange={(v) => upd("estimatedMarketValue", v)} editing={editing.valuation} />
              <CurrencyField label="Valuation Amount"       value={collateral.valuationAmount}      onChange={(v) => upd("valuationAmount", v)}      editing={editing.valuation} />
              <SelectField   label="Existing Mortgage"      value={collateral.existingMortgage}     onChange={(v) => upd("existingMortgage", v)}     editing={editing.valuation} options={["No", "Yes"]} />
              {collateral.existingMortgage === "Yes" && (
                <>
                  <FieldRow      label="Mortgage Bank Name"       value={collateral.mortgageBankName}     onChange={(v) => upd("mortgageBankName", v)}     editing={editing.valuation} placeholder="Bank / FI name" />
                  <CurrencyField label="Outstanding Loan Amount"  value={collateral.outstandingLoanAmount} onChange={(v) => upd("outstandingLoanAmount", v)} editing={editing.valuation} />
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default CollateralPage;