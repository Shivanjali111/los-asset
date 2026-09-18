/**
 * BUTTON PRIMITIVE: shared by the header, sidebar, table, drawer and lead form.
 * children is the visible label/content; startIcon optionally places an icon before it.
 * loading disables interaction and exposes a busy state; the caller supplies any loading label.
 * Default type="button" prevents accidental form submission. Forms explicitly use type="submit".
 * ...props forwards onClick, className, aria-label and other native button attributes.
 */
export default function Button({
  type = "button",
  loading = false,
  disabled = false,
  startIcon,
  children,
  ...props
}) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {startIcon}
      {children}
    </button>
  );
}
