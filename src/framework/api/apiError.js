/**
 * NORMALIZED REQUEST ERROR: apiClient throws this when an API/network operation fails.
 * Extends JavaScript Error with status, code and optional requestId for consistent handling.
 * Hooks currently display the message; code/status can support richer central handling later.
 */
export class ApiError extends Error {
  constructor(message, { status = 0, code = "NETWORK_ERROR", requestId } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}
