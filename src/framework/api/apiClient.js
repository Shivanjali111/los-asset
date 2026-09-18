/**
 * SHARED HTTP CLIENT: API repositories call get/post; components never call this directly.
 * Flow: build request -> fetch -> parse JSON -> normalize errors -> return response data.
 * Handles cancellation, timeout and cleanup once instead of repeating them in every feature.
 * Callers can supply headers; this migration retains existing endpoint authentication behavior.
 * It does not automatically attach Cognito tokens or retry writes. See dashboard-refactor.md.
 */
import { ApiError } from "./apiError";

async function request(
  url,
  { method = "GET", body, signal, timeoutMs = 20000, headers = {} } = {},
) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  try {
    const response = await fetch(url, {
      method,
      signal: controller.signal,
      headers: {
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...headers,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    // Read once, then parse centrally; callers receive data rather than a raw fetch Response.
    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      throw new ApiError("The server returned an invalid response.", {
        status: response.status,
        code: "INVALID_RESPONSE",
      });
    }
    // Both HTTP failures and an explicit API business-failure flag are treated as errors.
    if (!response.ok || data?.success === false) {
      throw new ApiError(
        data?.error?.message ||
          data?.message ||
          "Unable to complete the request.",
        {
          status: response.status,
          code: data?.error?.code || "API_ERROR",
          requestId: response.headers.get("x-amzn-requestid"),
        },
      );
    }
    return data;
  } catch (error) {
    if (error instanceof ApiError || (signal?.aborted && !timedOut))
      throw error;
    throw new ApiError(
      timedOut
        ? "The request timed out. Please try again."
        : "Unable to reach the server. Please try again.",
      { code: timedOut ? "TIMEOUT_ERROR" : "NETWORK_ERROR" },
    );
  } finally {
    // Always release timers/listeners after success, failure or cancellation.
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
  }
}

// Preserve the deployed endpoints' existing headers in this UI migration.
// Authentication/header policies can be added centrally when API authorizers
// and CORS are migrated. No automatic retries of create mutations.
export const apiClient = {
  get: (url, options) => request(url, options),
  post: (url, body, options) =>
    request(url, { ...options, method: "POST", body }),
};
