//
//
// PUBLIC_INTERFACE
// API client for Notes CRUD with environment-based base URL and proxy fallback.
//
// getBaseUrl uses REACT_APP_API_BASE if provided; otherwise it returns an empty string,
// so requests go to relative paths like `/notes`, which CRA proxies to package.json "proxy".
const getBaseUrl = () => {
  // If REACT_APP_API_BASE is set, use it; otherwise use relative paths and rely on CRA proxy.
  const envBase = process.env.REACT_APP_API_BASE;
  if (envBase && envBase.trim().length > 0) {
    return envBase.replace(/\/+$/, "");
  }
  return ""; // relative path to use CRA proxy (http://localhost:3001 based on package.json)
};

const BASE = getBaseUrl();

// Helper to handle responses with basic error parsing
async function handleResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  // DELETE may return 204 No Content; text() on 204 resolves to empty string, which is fine.
  const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);
  if (!res.ok) {
    const message =
      (payload && payload.message) ||
      (typeof payload === "string" ? payload : null) ||
      `Request failed with status ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }
  return payload ?? null;
}

// PUBLIC_INTERFACE
export async function getNotes(signal) {
  /** Fetch all notes. Returns array of {id, title, content}. */
  const res = await fetch(`${BASE}/notes`, { signal });
  return handleResponse(res);
}

// PUBLIC_INTERFACE
export async function getNote(id, signal) {
  /** Fetch a single note by id. */
  const res = await fetch(`${BASE}/notes/${encodeURIComponent(id)}`, { signal });
  return handleResponse(res);
}

// PUBLIC_INTERFACE
export async function createNote(data) {
  /** Create a new note with {title, content}. Returns created note. */
  const res = await fetch(`${BASE}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: data.title ?? "", content: data.content ?? "" })
  });
  return handleResponse(res);
}

// PUBLIC_INTERFACE
export async function updateNote(id, data) {
  /** Update an existing note by id with {title, content}. Returns updated note. */
  const res = await fetch(`${BASE}/notes/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: data.title ?? "", content: data.content ?? "" })
  });
  return handleResponse(res);
}

// PUBLIC_INTERFACE
export async function deleteNote(id) {
  /** Delete a note by id. Returns {success:true} or deleted entity based on backend. */
  const res = await fetch(`${BASE}/notes/${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
  return handleResponse(res);
}

export const apiBase = BASE;
