/**
 * DISPLAY BADGE: ProcessingRegister supplies the status text and a CSS variant.
 * children is the label; variant selects styling; className allows another badge layout.
 * This component does not define valid loan statuses or change workflow state.
 */
export default function StatusBadge({
  children,
  variant = "",
  className = "status-pill",
}) {
  return <span className={`${className} ${variant}`}>{children}</span>;
}
