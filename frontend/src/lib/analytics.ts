'use client';

export type ConsentDecision = 'accepted' | 'rejected' | null;

const CONSENT_STORAGE_KEY = 'hrms_cookie_consent';
const CONSENT_EVENT = 'hrms:cookie-consent-changed';

export function getCookieConsent(): ConsentDecision {
  if (typeof window === 'undefined') return null;
  try {
    const val = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (val === 'accepted' || val === 'rejected') return val;
    return null;
  } catch {
    return null;
  }
}

export function setCookieConsent(decision: 'accepted' | 'rejected'): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, decision);
    document.cookie = `${CONSENT_STORAGE_KEY}=${decision}; Path=/; Max-Age=31536000; SameSite=Lax${
      window.location.protocol === 'https:' ? '; Secure' : ''
    }`;
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: decision }));
  } catch {
    // ignore storage errors
  }
}

export function onConsentChange(cb: (decision: ConsentDecision) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: Event) => {
    const detail = (e as CustomEvent<ConsentDecision>).detail;
    cb(detail ?? getCookieConsent());
  };
  window.addEventListener(CONSENT_EVENT, handler);
  return () => window.removeEventListener(CONSENT_EVENT, handler);
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let gaLoaded = false;

export function initAnalyticsIfConsented(): void {
  if (typeof window === 'undefined') return;
  if (getCookieConsent() !== 'accepted') return;

  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!measurementId || gaLoaded) return;

  gaLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, { anonymize_ip: true });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);
}

export function trackPageView(path: string): void {
  if (typeof window === 'undefined') return;
  if (getCookieConsent() !== 'accepted') return;

  initAnalyticsIfConsented();
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (measurementId && typeof window.gtag === 'function') {
    window.gtag('config', measurementId, { page_path: path });
  }
}

export function trackEvent(name: string, params?: Record<string, string | number | boolean>): void {
  if (typeof window === 'undefined') return;
  if (getCookieConsent() !== 'accepted') return;

  if (typeof window.gtag === 'function') {
    window.gtag('event', name, params);
  }
}
