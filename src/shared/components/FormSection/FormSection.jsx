/**
 * FORM SECTION: CreateLeadForm uses this for customer details and enquiry source.
 * number, title and description describe the section; children contains its fields/content.
 * It is reusable because the caller supplies all business wording and form controls.
 */
export default function FormSection({ number, title, description, children }) {
  return (
    <div className="form-section">
      <div className="form-section-heading">
        <span>{number}</span>
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
