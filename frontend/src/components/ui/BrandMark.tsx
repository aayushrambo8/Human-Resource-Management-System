import Image from 'next/image';
import { BRAND, BRAND_LOGO } from '@/lib/branding';

/**
 * Institution mark: renders the personal logo image when one is configured and
 * falls back to the styled monogram otherwise. Decorative — the adjacent visible
 * wordmark carries the human-readable brand label, and the surrounding link
 * provides the full accessible name.
 */
export function BrandMark() {
  if (BRAND_LOGO) {
    return (
      <Image
        src={BRAND_LOGO}
        alt=""
        width={36}
        height={36}
        aria-hidden="true"
        priority
        className="brand-mark-img"
      />
    );
  }

  return (
    <span className="brand-mark" aria-hidden="true">
      {BRAND.mark}
    </span>
  );
}
