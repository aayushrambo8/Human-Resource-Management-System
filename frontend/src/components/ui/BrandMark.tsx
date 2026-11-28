import Image from 'next/image';
import { DEFAULT_BRANDING } from '@/lib/branding';

/**
 * Institution mark: renders the configured logo image when available and
 * falls back to the styled monogram otherwise. Decorative — the adjacent visible
 * wordmark carries the human-readable brand label, and the surrounding link
 * provides the full accessible name.
 */
export function BrandMark() {
  if (DEFAULT_BRANDING.logoUrl) {
    return (
      <Image
        src={DEFAULT_BRANDING.logoUrl}
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
      {DEFAULT_BRANDING.markLetter}
    </span>
  );
}
