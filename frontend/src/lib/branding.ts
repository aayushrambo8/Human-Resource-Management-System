/**
 * Central brand configuration for the HRMS frontend.
 *
 * Product names, the wordmark, tagline and logo path live here so the login
 * screen, app shell, metadata and marketing copy stay consistent. Personalise
 * the institution by editing these constants, or point `BRAND_LOGO` at your own
 * logo image (served from `frontend/public/`, e.g. `/brand/my-logo.svg`).
 */

export const BRAND = {
  /** Monogram used for the fallback mark when no custom logo is set. */
  mark: 'N',
  /** Short wordmark (mark + product). */
  name: 'Northstar',
  /** Full institutional name. */
  institution: 'Northstar Institute',
  /** Product name. */
  product: 'HRMS',
  /** One-line tagline. */
  tagline: 'Self-hosted people operations',
} as const;

/** Path to the logo image (served from `frontend/public`). Falls back to the
 * monogram mark when no custom image is available. Override per deployment with
 * the `NEXT_PUBLIC_BRAND_LOGO` environment variable. */
export const BRAND_LOGO: string = process.env.NEXT_PUBLIC_BRAND_LOGO?.trim() || '/brand/logo.svg';

/** Default document title. */
export const BRAND_TITLE: string = `${BRAND.institution} ${BRAND.product}`;
