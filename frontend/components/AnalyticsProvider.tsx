/** Optional analytics — no-op when NEXT_PUBLIC_ANALYTICS_ID is unset. */
"use client";

import { useEffect } from "react";

export default function AnalyticsProvider() {
  useEffect(() => {
    const id = process.env.NEXT_PUBLIC_ANALYTICS_ID;
    if (!id) return;
    // Plausible-style: load only when configured; replace script src with your provider
    const script = document.createElement("script");
    script.defer = true;
    script.dataset.domain = id;
    script.src = "https://plausible.io/js/script.js";
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);

  return null;
}
