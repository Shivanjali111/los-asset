/**
 * ACCESSIBLE SIDE DIALOG: Dashboard mounts this only while create.open is true.
 * title/eyebrow/description provide the header; children contains CreateLeadForm.
 * onClose asks the parent to remove the drawer. busy blocks dismissal while a save is pending.
 * Refs point to the DOM panel and latest callback without triggering a React render.
 * The mount effect manages keyboard focus and background interaction; its cleanup restores both.
 * This implementation expects the drawer backdrop to be a direct child of AppShell.
 */
import { useEffect, useId, useRef } from "react";
import Button from "../Button/Button";
import AppIcon from "../../icons/AppIcon";

export default function Drawer({
  title,
  eyebrow,
  description,
  busy = false,
  onClose,
  children,
}) {
  const panel = useRef(null);
  const titleId = useId();
  // Keep the current busy flag/callback available to the one-time keyboard listener.
  const latest = useRef({ busy, onClose });
  useEffect(() => {
    latest.current = { busy, onClose };
  }, [busy, onClose]);
  useEffect(() => {
    // Remember the opener and temporarily make sibling screen regions non-interactive.
    const previouslyFocused = document.activeElement;
    const background = [
      ...panel.current.parentElement.parentElement.children,
    ].filter((node) => node !== panel.current.parentElement);
    const previousInert = background.map((node) => node.inert);
    background.forEach((node) => {
      node.inert = true;
    });
    panel.current.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !latest.current.busy) {
        event.preventDefault();
        latest.current.onClose();
      }
      if (event.key !== "Tab") return;
      // Wrap Tab/Shift+Tab within visible enabled controls instead of letting focus escape.
      const focusable = [
        ...panel.current.querySelectorAll(
          'button, input, select, textarea, a[href], [tabindex="0"]',
        ),
      ].filter(
        (node) => !node.matches(":disabled") && node.getClientRects().length,
      );
      const first = focusable[0],
        last = focusable.at(-1);
      if (!first) {
        event.preventDefault();
        panel.current.focus();
        return;
      }
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === panel.current)
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          document.activeElement === panel.current)
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    // Effect cleanup runs on unmount (and during React development checks).
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      background.forEach((node, index) => {
        node.inert = previousInert[index];
      });
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, []);
  return (
    <div
      className="drawer-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <aside
        className="create-lead-drawer"
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-busy={busy || undefined}
      >
        <div className="drawer-header">
          <div>
            {eyebrow && <span className="drawer-eyebrow">{eyebrow}</span>}
            <h2 id={titleId}>{title}</h2>
            <p>{description}</p>
          </div>
          <Button
            className="drawer-close-button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close dialog"
          >
            <AppIcon name="close" />
          </Button>
        </div>
        {children}
      </aside>
    </div>
  );
}
