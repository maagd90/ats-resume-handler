export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchProfile() {
  const res = await fetch(`${API_URL}/api/v1/profile`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

export async function uploadResume(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}/api/v1/resume/upload`, { method: "POST", body: form });
  if (!res.ok) throw new Error("Failed to upload resume");
  return res.json();
}

export async function reviewResume() {
  const res = await fetch(`${API_URL}/api/v1/resume/review`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to review resume");
  return res.json();
}

export async function optimizeResume() {
  const res = await fetch(`${API_URL}/api/v1/resume/optimize`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to optimize resume");
  return res.json();
}

export async function analyzeLinkedIn(linkedinText: string) {
  const form = new FormData();
  form.append("linkedin_text", linkedinText);
  const res = await fetch(`${API_URL}/api/v1/linkedin/analyze`, { method: "POST", body: form });
  if (!res.ok) throw new Error("Failed to analyze LinkedIn profile");
  return res.json();
}

export async function searchJobs(query?: string, location?: string) {
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (location) params.set("location", location);
  const res = await fetch(`${API_URL}/api/v1/jobs/search?${params.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to search jobs");
  return res.json();
}

export async function scoreJob(description: string) {
  const form = new FormData();
  form.append("description", description);
  const res = await fetch(`${API_URL}/api/v1/jobs/score`, { method: "POST", body: form });
  if (!res.ok) throw new Error("Failed to score job");
  return res.json();
}
