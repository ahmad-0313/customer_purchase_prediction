/**
 * ApiError is thrown by every function in endpoints.js.
 *
 * status === 0  → network failure / server unreachable (fetch threw or no response)
 * status === 400 → validation error; body contains field-level messages
 * status === 404 → not found; body has { detail: "..." }
 *
 * When you write the real HTTP client later, throw this same class so the UI
 * never needs to change.
 */
export class ApiError extends Error {
  /**
   * @param {number} status  HTTP status code, or 0 for network failure
   * @param {any}    body    Parsed JSON response body (or a plain object for status 0)
   */
  constructor(status, body) {
    super(`ApiError ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}
