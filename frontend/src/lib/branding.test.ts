import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_BRANDING, getStoredBranding, saveBranding, resetBrandingToDefault } from '@/lib/branding';

describe('Branding Configuration Model', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns default branding when no custom configuration is saved', () => {
    const branding = getStoredBranding();
    expect(branding.name).toBe('Birla Institute of Technology');
    expect(branding.logoUrl).toBe('/images/Birla_Institute_of_Technology_Mesra.png');
    expect(branding.loginHeroUrl).toBe('/images/bitfront.webp');
  });

  it('persists and retrieves customized branding values', () => {
    saveBranding({
      name: 'Custom University Institute',
      logoUrl: '/images/custom-logo.png',
      loginHeroUrl: '/images/custom-hero.webp',
    });

    const updated = getStoredBranding();
    expect(updated.name).toBe('Custom University Institute');
    expect(updated.logoUrl).toBe('/images/custom-logo.png');
    expect(updated.loginHeroUrl).toBe('/images/custom-hero.webp');
    expect(updated.shortName).toBe(DEFAULT_BRANDING.shortName);
  });

  it('resets branding to factory defaults', () => {
    saveBranding({ name: 'Modified College' });
    expect(getStoredBranding().name).toBe('Modified College');

    resetBrandingToDefault();
    expect(getStoredBranding().name).toBe(DEFAULT_BRANDING.name);
  });
});

