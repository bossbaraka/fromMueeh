"use client";

import * as React from "react";
import Script from "next/script";

/**
 * Cloudflare Turnstile — اختياري بالكامل.
 * إن لم يُضبط NEXT_PUBLIC_TURNSTILE_SITE_KEY لا يُحمَّل أي سكربت خارجي ولا يتغير شيء للمستخدم.
 */
export const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: { sitekey: string; callback: (token: string) => void; theme?: string; language?: string },
      ) => void;
    };
  }
}

export function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (!ready || !turnstileSiteKey || !ref.current || !window.turnstile) return;
    window.turnstile.render(ref.current, {
      sitekey: turnstileSiteKey,
      callback: onToken,
      theme: "light",
      language: "ar",
    });
  }, [ready, onToken]);

  if (!turnstileSiteKey) return null;

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="lazyOnload"
        onLoad={() => setReady(true)}
      />
      <div ref={ref} className="min-h-[65px]" aria-label="التحقق الأمني" />
    </>
  );
}
