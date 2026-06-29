/** Routes that render without the authenticated app shell sidebar. */
export const AUTHLESS_EXACT = ["/", "/login", "/templates"];

export const PUBLIC_MARKETING = [
  "/pricing",
  "/privacy",
  "/terms",
  "/refund",
  "/faq",
  "/contact",
  "/about",
  "/help",
];

export function isAuthlessRoute(pathname: string): boolean {
  if (AUTHLESS_EXACT.includes(pathname)) return true;
  return PUBLIC_MARKETING.includes(pathname);
}
