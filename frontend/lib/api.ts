export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${path}`);
  }
  return res.json();
}

export async function fetchProfile() {
  return request("/api/v1/profile", { cache: "no-store" });
}

export async function uploadResume(file: File) {
  const form = new FormData();
  form.append("file", file);
  return request("/api/v1/resume/upload", { method: "POST", body: form });
}

export async function reviewResume() {
  return request("/api/v1/resume/review", { method: "POST" });
}

export async function optimizeResume() {
  return request("/api/v1/resume/optimize", { method: "POST" });
}

export async function analyzeLinkedIn(linkedinText: string) {
  const form = new FormData();
  form.append("linkedin_text", linkedinText);
  return request("/api/v1/linkedin/analyze", { method: "POST", body: form });
}

export async function searchJobs(query?: string, location?: string) {
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (location) params.set("location", location);
  return request(`/api/v1/jobs/search?${params.toString()}`, { cache: "no-store" });
}

export async function scoreJob(description: string) {
  const form = new FormData();
  form.append("description", description);
  return request("/api/v1/jobs/score", { method: "POST", body: form });
}

export async function fetchCriteria() {
  return request("/api/v1/criteria", { cache: "no-store" });
}

export async function updateCriteria(data: Record<string, unknown>) {
  return request("/api/v1/criteria", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function fetchAgentStatus() {
  return request("/api/v1/agent/status", { cache: "no-store" });
}

export async function startAgent() {
  return request("/api/v1/agent/start", { method: "POST" });
}

export async function stopAgent() {
  return request("/api/v1/agent/stop", { method: "POST" });
}

export async function runAgentNow() {
  return request("/api/v1/agent/run-now", { method: "POST" });
}

export async function fetchApplications(status?: string) {
  const params = status ? `?status=${status}` : "";
  return request(`/api/v1/applications${params}`, { cache: "no-store" });
}

export async function approveApplication(id: string) {
  return request(`/api/v1/applications/${id}/approve`, { method: "POST" });
}

export async function skipApplication(id: string) {
  return request(`/api/v1/applications/${id}/skip`, { method: "POST" });
}

export async function retryApplication(id: string) {
  return request(`/api/v1/applications/${id}/retry`, { method: "POST" });
}
