/**
 * LEAD TABLE COMPOSITION: Dashboard supplies selectedView, rows, request state and callbacks.
 * This feature defines loan-specific columns and uses the generic DataTable to render them.
 * Changing the selector calls onViewChange -> Dashboard updates state -> useLeadRegister selects rows.
 * Clicking a reference calls onOpenLead(id); Dashboard owns navigation to onboarding.
 * onExport is optional; the button stays disabled until an export implementation is supplied.
 */
import { useId } from "react";
import Button from "../../../shared/components/Button/Button";
import DataTable from "../../../shared/components/DataTable/DataTable";
import StatusBadge from "../../../shared/components/StatusBadge/StatusBadge";
import AppIcon from "../../../shared/icons/AppIcon";
import { leadConfig } from "../models/leadConfig";

export default function ProcessingRegister({
  selectedView,
  onViewChange,
  rows,
  loading,
  error,
  onRetry,
  onOpenLead,
  onExport,
}) {
  const viewId = useId();
  // These definitions connect generic table cells to lead fields and parent-owned actions.
  const columns = [
    {
      id: "id",
      label: "Reference",
      render: (lead) => (
        <Button
          className="lead-link-button"
          onClick={() => onOpenLead(lead.id)}
        >
          {lead.id}
        </Button>
      ),
    },
    {
      id: "customer",
      label: "Customer",
      render: (lead) => (
        <div className="customer-cell">
          <span>
            {lead.firstName?.charAt(0)}
            {lead.lastName?.charAt(0)}
          </span>
          <div>
            <strong>
              {lead.firstName} {lead.lastName}
            </strong>
            <p>{lead.mobile}</p>
          </div>
        </div>
      ),
    },
    {
      id: "type",
      label: "Loan Type",
      render: (lead) => (
        <StatusBadge className="gold-product-chip">
          <i aria-hidden="true">
            <AppIcon name="gold-loan" size={14} />
          </i>
          {lead.loanType || leadConfig.defaultType}
        </StatusBadge>
      ),
    },
    {
      id: "status",
      label: "Status",
      render: (lead) => (
        <StatusBadge
          variant={String(lead.status || leadConfig.defaultStatus)
            .toLowerCase()
            .replaceAll(" ", "-")}
        >
          {lead.status || leadConfig.defaultStatus}
        </StatusBadge>
      ),
    },
    { id: "owner", label: "Handled By" },
    { id: "createdDate", label: "Started" },
  ];
  return (
    <section
      className="lead-panel compact-lead-panel"
      aria-label="Processing register"
    >
      <div className="lead-panel-header">
        <div>
          <span className="section-eyebrow">Today's Processing Register</span>
          <h2>{selectedView}</h2>
          <p>
            {selectedView === leadConfig.views[0]
              ? "Fresh and renewal cases initiated at the branch today."
              : "Gold loan cases based on the selected operational view."}
          </p>
        </div>
        <div className="table-actions">
          <div className="list-view-control">
            <label htmlFor={viewId}>List View</label>
            <select
              id={viewId}
              value={selectedView}
              onChange={(event) => onViewChange(event.target.value)}
            >
              {leadConfig.views.map((view) => (
                <option key={view}>{view}</option>
              ))}
            </select>
          </div>
          <Button
            className="small-action-button"
            onClick={onExport}
            disabled={!onExport}
            title={onExport ? "Export records" : "Export is not yet available"}
          >
            <span>
              <AppIcon name="download" size={15} />
            </span>
            Export
          </Button>
        </div>
      </div>
      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={onRetry}
        label={selectedView}
        emptyMessage="No gold loan cases found for this view."
      />
    </section>
  );
}
