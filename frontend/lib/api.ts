export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

import { clearAccessToken, getAccessToken, setAccessToken } from "./auth";

export { clearAccessToken, getAccessToken, setAccessToken };

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(options?.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!(options?.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers, credentials: "include" });
  if (res.status === 401) {
    clearAccessToken();
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
  }
  if (!res.ok) {
    let detail = await res.text();
    try {
      const parsed = JSON.parse(detail);
      detail = parsed.detail || detail;
    } catch {
      /* plain text */
    }
    throw new Error(detail || `Request failed: ${path}`);
  }
  return res.json();
}

export async function register(email: string, password: string, name?: string) {
  return request<{ access_token: string; user_id: string; email: string }>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
}

export async function login(email: string, password: string) {
  return request<{ access_token: string; user_id: string; email: string }>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchMe() {
  return request<{ user_id: string; email: string; tier: string; is_prime: boolean }>("/api/v1/auth/me", {
    cache: "no-store",
  });
}

export async function fetchProfile() {
  return request("/api/v1/profile", { cache: "no-store" });
}

export async function updateProfile(data: Record<string, unknown>) {
  return request("/api/v1/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function fetchTemplateSettings() {
  return request("/api/v1/optimizer/template", { cache: "no-store" });
}

export async function updateTemplateSettings(settings: Record<string, unknown>) {
  return request("/api/v1/optimizer/template", {
    method: "PUT",
    body: JSON.stringify(settings),
  });
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

export async function analyzeLinkedInFile(file: File, linkedinText = "") {
  const form = new FormData();
  form.append("file", file);
  if (linkedinText.trim()) form.append("linkedin_text", linkedinText);
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

export async function runOptimizer(linkedinText: string) {
  const form = new FormData();
  form.append("linkedin_text", linkedinText);
  return request("/api/v1/optimizer/run", { method: "POST", body: form });
}

export async function fetchQuota() {
  return request("/api/v1/optimizer/quota", { cache: "no-store" });
}

export async function fetchAiPipeline() {
  return request("/api/v1/ai/pipeline", { cache: "no-store" });
}

export async function fetchLatestProposal() {
  return request("/api/v1/proposals/latest", { cache: "no-store" });
}

export async function fetchMembership() {
  return request("/api/v1/membership", { cache: "no-store" });
}

export async function devUpgradePrime() {
  return request("/api/v1/membership/upgrade-dev", { method: "POST" });
}

export async function fetchBillingPlans() {
  return request<{ plans: BillingPlan[]; stripe_configured: boolean; free_tier: { optimizations_per_month: number } }>(
    "/api/v1/billing/plans",
    { cache: "no-store" }
  );
}

export async function createCheckout(planId: string) {
  return request<{ checkout_url: string }>(`/api/v1/billing/checkout?plan_id=${encodeURIComponent(planId)}`, {
    method: "POST",
  });
}

export type BillingPlan = {
  id: string;
  months: number;
  price_usd: number;
  monthly_equivalent: number;
  label: string;
  description: string;
  ai_included: boolean;
};

export function getResumeDownloadUrl(proposalId: string, asciiSafe = false) {
  const params = asciiSafe ? "?ascii_safe=true" : "";
  return `/api/v1/proposals/${proposalId}/download/resume${params}`;
}

export function getLinkedInPackDownloadUrl(proposalId: string, asciiSafe = false) {
  const params = asciiSafe ? "?ascii_safe=true" : "";
  return `/api/v1/proposals/${proposalId}/download/linkedin${params}`;
}

export async function downloadAuthenticated(path: string, filename: string) {
  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { credentials: "include", headers });
  if (!res.ok) {
    throw new Error("Download failed");
  }
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
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
