// Base URL for all API calls.
// Set VITE_API_URL in your .env file to override (e.g. when proxying through a different port).
// When you connect the real backend, this will be the prefix for every fetch call.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
