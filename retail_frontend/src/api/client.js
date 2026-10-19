import { API_BASE_URL } from "../config";
import { ApiError } from "./errors";

// One function that every real API call will go through.
export async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;

  let response;
  try {
    response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch (err) {
    // fetch only throws when it cannot reach the server at all
    // (server stopped, wrong address, or the browser blocked it with CORS)
    throw new ApiError(0, { detail: "Cannot reach the server." });
  }

  // Parse the JSON body (some responses may be empty)
  let body = null;
  try {
    body = await response.json();
  } catch {
    // no body
  }

  // fetch does NOT throw for 400 / 404 / 500, so we do it ourselves
  if (!response.ok) {
    throw new ApiError(response.status, body);
  }

  return body;
}