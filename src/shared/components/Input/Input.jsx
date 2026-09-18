/**
 * LABELED INPUT: CreateLeadForm passes name, value, onChange and validation attributes.
 * This is a controlled input: its displayed value comes from the parent's form state.
 * Typing calls onChange; useCreateLead updates that state and React renders the new value.
 * useId connects the label to this specific input; prefix adds text such as a country code.
 * Browser constraints help input feedback, but backend validation is still required.
 */
import { useId } from "react";

export default function Input({ label, prefix, required = false, ...props }) {
  const id = useId();
  const control = <input {...props} id={id} required={required} />;
  return (
    <div className="field-group">
      <label htmlFor={id}>
        {label}
        {required ? (
          <>
            {" "}
            <b aria-hidden="true">*</b>
          </>
        ) : (
          <span className="optional-label">Optional</span>
        )}
      </label>
      {prefix ? (
        <div className="lead-input-with-prefix">
          <span>{prefix}</span>
          {control}
        </div>
      ) : (
        control
      )}
    </div>
  );
}
