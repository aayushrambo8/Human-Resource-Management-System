'use client';

import { useState, useEffect, useCallback } from 'react';

export interface BrandingConfig {
  name: string;
  shortName: string;
  markLetter: string;
  division: string;
  tagline: string;
  supportEmail: string;
  copyright: string;
  version: string;
  logoUrl: string;
  loginHeroUrl: string;
  theme: {
    primaryAccent: string;
    primaryAccentHover: string;
    emeraldGlow: string;
  };
}

export const DEFAULT_BRANDING: BrandingConfig = {
  name: 'Birla Institute of Technology',
  shortName: 'BIT Patna',
  markLetter: 'BITP',
  division: 'HR Department',
  tagline: 'Enterprise Human Resource Governance & Biometric Operations',
  supportEmail: 'hrpatna@bitmesra.ac.in',
  copyright: '© 2026 Birla Institute of Technology. All rights reserved.',
  version: 'v1.0-enterprise',
  logoUrl: '/images/Birla_Institute_of_Technology_Mesra.png',
  loginHeroUrl: '/images/bitfront.webp',
  theme: {
    primaryAccent: '#0f172a',
    primaryAccentHover: '#1e293b',
    emeraldGlow: '#10b981',
  },
};

const STORAGE_KEY = 'hrms_branding_custom';
const BRANDING_EVENT = 'hrms:branding-changed';

/**
 * Returns currently stored branding or default fallback.
 * Safe for SSR and client runtime.
 */
export function getStoredBranding(): BrandingConfig {
  if (typeof window === 'undefined') {
    return DEFAULT_BRANDING;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_BRANDING;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_BRANDING,
      ...parsed,
      tagline: parsed.tagline || DEFAULT_BRANDING.tagline,
      theme: { ...DEFAULT_BRANDING.theme, ...(parsed.theme || {}) },
    };
  } catch {
    return DEFAULT_BRANDING;
  }
}

/**
 * Persists updated branding options and broadcasts event to all listeners.
 */
export function saveBranding(updated: Partial<BrandingConfig>): BrandingConfig {
  const current = getStoredBranding();
  const next: BrandingConfig = {
    ...current,
    ...updated,
    theme: {
      ...current.theme,
      ...(updated.theme || {}),
    },
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent(BRANDING_EVENT, { detail: next }));
    } catch {
      // ignore storage failure
    }
  }

  return next;
}

/**
 * Resets branding back to factory defaults.
 */
export function resetBrandingToDefault(): BrandingConfig {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent(BRANDING_EVENT, { detail: DEFAULT_BRANDING }));
    } catch {
      // ignore
    }
  }
  return DEFAULT_BRANDING;
}

/**
 * React hook for consuming and updating branding dynamically with reactive sync.
 */
export function useBranding() {
  const [branding, setBranding] = useState<BrandingConfig>(() => getStoredBranding());
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);

    const onBrandingChanged = (event: Event) => {
      const customEvent = event as CustomEvent<BrandingConfig>;
      if (customEvent.detail) {
        setBranding(customEvent.detail);
      } else {
        setBranding(getStoredBranding());
      }
    };

    window.addEventListener(BRANDING_EVENT, onBrandingChanged);
    window.addEventListener('storage', onBrandingChanged);

    return () => {
      window.removeEventListener(BRANDING_EVENT, onBrandingChanged);
      window.removeEventListener('storage', onBrandingChanged);
    };
  }, []);

  const update = useCallback((next: Partial<BrandingConfig>) => {
    const saved = saveBranding(next);
    setBranding(saved);
  }, []);

  const reset = useCallback(() => {
    const res = resetBrandingToDefault();
    setBranding(res);
  }, []);

  return {
    branding,
    updateBranding: update,
    resetBranding: reset,
    isHydrated,
  };
}

/**
 * Backwards compatible export for static usage
 */
export const BRANDING = DEFAULT_BRANDING;
