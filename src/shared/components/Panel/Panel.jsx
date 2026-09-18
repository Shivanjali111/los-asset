/**
 * PANEL PRIMITIVE: wraps each dashboard insight with a consistent heading and content area.
 * DashboardInsights supplies business-specific titles, descriptions and chart/timeline children.
 * actions is an optional heading-side slot (for example the reporting-period badge).
 * useId gives each instance a unique heading ID for accessible section labeling.
 */
import { useId } from "react";

export default function Panel({
  eyebrow,
  title,
  description,
  actions,
  className = "",
  headerClassName = "panel-header",
  children,
}) {
  const headingId = useId();
  return (
    <section
      className={`insight-panel ${className}`}
      aria-labelledby={headingId}
    >
      <div className={headerClassName}>
        <div>
          {eyebrow && <span className="section-eyebrow">{eyebrow}</span>}
          <h2 id={headingId}>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
