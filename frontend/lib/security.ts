/** Client-side URL validation — blocks javascript: and other dangerous schemes. */

export function safeHref(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }
    return null;
  } catch {
    return null;
  }
}

const STRIPE_CHECKOUT_PREFIXES = [
  "https://checkout.stripe.com/",
  "https://billing.stripe.com/",
];

export function safeStripeCheckoutUrl(url: string | null | undefined): string | null {
  const safe = safeHref(url);
  if (!safe) return null;
  if (STRIPE_CHECKOUT_PREFIXES.some((prefix) => safe.startsWith(prefix))) {
    return safe;
  }
  return null;
}
