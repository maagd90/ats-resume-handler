/** Dev-only UI (Prime preview, etc.) — requires explicit env flag, not just NODE_ENV. */
export function showDevTools(): boolean {
  return process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === "true";
}
