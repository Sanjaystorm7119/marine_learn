const BASE = "http://127.0.0.1:8000/teams";

function authHeaders() {
  const token = localStorage.getItem("token");
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

async function handleResponse(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(body.detail || "Request failed");
  }
  return res.json();
}

/** @param {"all"|"upcoming"|"past"} filter */
export async function listMeetings(filter = "all") {
  const res = await fetch(`${BASE}/meetings?filter=${filter}`, { headers: authHeaders() });
  return handleResponse(res);
}

/** @param {object} payload */
export async function createMeeting(payload) {
  const res = await fetch(`${BASE}/meetings`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

/** @param {number} id */
export async function cancelMeeting(id) {
  const res = await fetch(`${BASE}/meetings/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse(res);
}
