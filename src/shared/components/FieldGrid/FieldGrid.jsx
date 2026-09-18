/**
 * FORM LAYOUT: CreateLeadForm nests Input components inside this wrapper.
 * children contains those fields; CSS arranges two columns and stacks them on small screens.
 * It controls layout only, not field values or validation.
 */
export default function FieldGrid({ children }) {
  return <div className="form-grid two-column">{children}</div>;
}
