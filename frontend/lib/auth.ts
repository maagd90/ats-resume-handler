/**
 * Hybrid auth: httpOnly cookie (primary) + sessionStorage bearer (cross-origin dev fallback).
 * Tokens never touch localStorage to reduce XSS persistence window.
 */

const SESSION_HINT = "passats_authed";
const TOKEN_KEY = "passats_session_token";

export function markAuthenticated() {
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(SESSION_HINT, "1");
  }
}

export function getAccessToken(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string) {
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(SESSION_HINT, "1");
  }
}

export function clearAccessToken() {
  const token = getAccessToken();
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(SESSION_HINT);
  }
  if (typeof window === "undefined") return;
  void fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export function isLoggedIn(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  return sessionStorage.getItem(SESSION_HINT) === "1";
}
