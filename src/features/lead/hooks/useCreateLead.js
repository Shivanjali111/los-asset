/**
 * CREATE-LEAD INTERACTION: called by Dashboard and connected to Drawer/CreateLeadForm.
 * useState stores values that affect rendering: open, values, submitting and error.
 * Flow: show -> change fields -> submit -> leadService.create -> onCreated -> page navigation.
 * onCreated is supplied by Dashboard so this hook does not need to know application routes.
 * pending is a ref used as an immediate repeat-click guard; backend idempotency is a separate concern.
 */
import { useRef, useState } from "react";
import { leadConfig } from "../models/leadConfig";
import { leadService } from "../services/leadService";

export default function useCreateLead(onCreated) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(() => ({ ...leadConfig.defaults }));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  // A ref changes immediately without rerendering; state updates can be batched by React.
  const pending = useRef(false);
  // Opening a new request resets prior inputs and errors.
  function show() {
    setValues({ ...leadConfig.defaults });
    setError("");
    setOpen(true);
  }
  function close() {
    if (!pending.current) {
      setOpen(false);
      setError("");
    }
  }
  async function submit(event) {
    // Stop the browser from submitting/reloading the page; this hook performs the async save.
    event.preventDefault();
    if (pending.current) return;
    pending.current = true;
    setSubmitting(true);
    setError("");
    try {
      const lead = await leadService.create(values);
      setOpen(false);
      // Hand the saved record back to the page; it updates App state and chooses the next route.
      onCreated(lead);
    } catch (failure) {
      setError(failure.message || "Unable to create lead.");
    } finally {
      pending.current = false;
      setSubmitting(false);
    }
  }
  function change(event) {
    // Input name matches a key in values. Copy the object instead of mutating React state.
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
  }
  return { open, values, submitting, error, show, close, submit, change };
}
