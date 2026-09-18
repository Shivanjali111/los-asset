/**
 * CONTROLLED LEAD FORM: Dashboard places this inside the shared Drawer.
 * values/error/submitting come from useCreateLead; onChange/onSubmit/onCancel are its callbacks.
 * Input and layout primitives render the fields. The form itself never calls an API.
 * brand provides the tenant product name; content provides configured labels.
 * The fieldset disables all fields during submission; an error leaves entered values available.
 */
import AppIcon from "../../../shared/icons/AppIcon";
import Button from "../../../shared/components/Button/Button";
import FieldGrid from "../../../shared/components/FieldGrid/FieldGrid";
import FormSection from "../../../shared/components/FormSection/FormSection";
import Input from "../../../shared/components/Input/Input";

export default function CreateLeadForm({
  values,
  onChange,
  onSubmit,
  onCancel,
  submitting,
  error,
  brand,
  content,
}) {
  return (
    <form
      className="create-lead-form"
      onSubmit={onSubmit}
      aria-busy={submitting}
    >
      {/* Native fieldset disabling applies to every nested field while the request is pending. */}
      <fieldset disabled={submitting} className="ui-form-fieldset">
        <div className="drawer-product-card">
          <div className="drawer-product-icon" aria-hidden="true">
            <span>
              <AppIcon name="gold-loan" size={20} />
            </span>
            <small>916</small>
          </div>
          <div className="drawer-product-copy">
            <span>Selected product</span>
            <strong>{brand.productName}</strong>
            <p>{content.productDescription}</p>
          </div>
          <span className="drawer-stage-pill">
            <i aria-hidden="true" />
            New Request
          </span>
        </div>
        <FormSection
          number="01"
          title="Customer details"
          description="Capture the minimum information required to register the enquiry."
        >
          <FieldGrid>
            <Input
              label="First Name"
              name="firstName"
              value={values.firstName}
              onChange={onChange}
              placeholder="Enter first name"
              autoComplete="given-name"
              required
            />
            <Input
              label="Last Name"
              name="lastName"
              value={values.lastName}
              onChange={onChange}
              placeholder="Enter last name"
              autoComplete="family-name"
              required
            />
          </FieldGrid>
          <FieldGrid>
            <Input
              label="Mobile Number"
              name="mobile"
              value={values.mobile}
              onChange={onChange}
              type="tel"
              inputMode="numeric"
              prefix="+91"
              placeholder="10-digit mobile number"
              pattern="[6-9][0-9]{9}"
              maxLength={10}
              autoComplete="tel-national"
              required
            />
            <Input
              label="Email Address"
              name="email"
              value={values.email}
              onChange={onChange}
              type="email"
              placeholder="customer@example.com"
              autoComplete="email"
            />
          </FieldGrid>
        </FormSection>
        <FormSection
          number="02"
          title="Enquiry source"
          description="Source is fixed for branch-initiated gold loans."
        >
          <div className="source-choice-grid fixed-source-grid">
            <div className="source-choice selected locked-source">
              <span className="source-choice-icon" aria-hidden="true">
                <AppIcon name="branch" size={18} />
              </span>
              <span>
                <strong>{values.source}</strong>
                <small>Automatically assigned for this journey</small>
              </span>
              <i aria-hidden="true">
                <AppIcon name="lock" size={14} />
              </i>
            </div>
          </div>
        </FormSection>
        <div className="drawer-info-card">
          <div className="drawer-info-heading">
            <span aria-hidden="true">
              <AppIcon name="check" size={17} />
            </span>
            <div>
              <strong>After the request is created</strong>
              <p>Continue directly to customer verification and appraisal.</p>
            </div>
          </div>
          <div className="drawer-next-steps">
            <span>
              <b>1</b>Verify Customer
            </span>
            <i aria-hidden="true" />
            <span>
              <b>2</b>Appraise Gold
            </span>
            <i aria-hidden="true" />
            <span>
              <b>3</b>Sanction &amp; Disburse
            </span>
          </div>
        </div>
        {error && (
          <div className="drawer-error-message" role="alert">
            {error}
          </div>
        )}
        <div className="drawer-actions">
          <Button
            className="secondary-action-button"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="header-action-button create-action"
            loading={submitting}
          >
            <span className="header-action-icon">
              <AppIcon name="plus" size={16} />
            </span>
            {submitting ? "Starting Gold Loan..." : content.title}
          </Button>
        </div>
      </fieldset>
    </form>
  );
}
