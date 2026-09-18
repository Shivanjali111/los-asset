/**
 * ASYNC REQUEST LIFECYCLE: reused by dashboard, lead-register and user-display hooks.
 * load is a stable function returning a Promise; it may accept an AbortSignal to cancel HTTP work.
 * useEffect runs the request after rendering; useState publishes the result back to the caller.
 * Cleanup prevents an old request from updating a component that unmounted or requested newer data.
 * retry changes a counter to rerun the effect. This is not a shared query cache or polling system.
 */
import { useCallback, useEffect, useState } from "react";

export default function useAsyncResource(load) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  useEffect(() => {
    // One controller belongs to this request attempt; cleanup cancels that specific attempt.
    const controller = new AbortController();
    let current = true;
    // Begin in a microtask so changing the resource resets its state outside
    // the synchronous Effect body and StrictMode cleanup can cancel it.
    Promise.resolve().then(async () => {
      if (!current) return;
      setState((previous) => ({ ...previous, loading: true, error: "" }));
      try {
        const data = await load({ signal: controller.signal });
        if (current) setState({ data, loading: false, error: "" });
      } catch (error) {
        if (current)
          setState({
            data: null,
            loading: false,
            error: error.message || "Unable to load data.",
          });
      }
    });
    // Ignore late results even when a mock/custom loader does not use the abort signal.
    return () => {
      current = false;
      controller.abort();
    };
  }, [load, attempt]);
  // useCallback keeps the retry function stable; changing attempt triggers the effect again.
  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  return { ...state, retry };
}
