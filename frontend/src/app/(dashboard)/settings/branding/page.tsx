'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useBranding, DEFAULT_BRANDING, type BrandingConfig } from '@/lib/branding';
import { Icon } from '@/components/ui/Icon';

const PRESET_LOGOS = [
  { label: 'BIT Mesra Official Seal', path: '/images/Birla_Institute_of_Technology_Mesra.png' },
  { label: 'Convenience Alias (logo.png)', path: '/images/logo.png' },
];

const PRESET_HERO_IMAGES = [
  { label: 'BIT Patna Campus Front (WebP)', path: '/images/bitfront.webp' },
  { label: 'BIT Front Original Filename', path: '/images/BIT Front.webp' },
  { label: 'Desert Studio Topographic Art', path: '/themes/desert-studio/dark.svg' },
  { label: 'Botanical Topographic Art', path: '/themes/botanical/dark.svg' },
  { label: 'Cloudscape Topographic Art', path: '/themes/cloudscape/dark.svg' },
];

export default function BrandingSettingsPage() {
  const { branding, updateBranding, resetBranding } = useBranding();
  const [formData, setFormData] = useState<BrandingConfig>(branding);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleFieldChange = (field: keyof BrandingConfig, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBranding(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleReset = () => {
    resetBranding();
    setFormData(DEFAULT_BRANDING);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs">
            <span className="text-[var(--color-text-muted)] font-mono uppercase tracking-wider">Administration</span>
            <span className="text-[var(--color-border)]">/</span>
            <span className="text-[var(--color-text)] font-semibold">Branding & Assets</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
            Organization Identity & Assets Studio
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Customize the organization logo, login page 75% coverage hero image, institutional titles, and contact information.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-secondary text-xs"
          >
            <Icon name="refresh" size={13} />
            <span>Reset Defaults</span>
          </button>
          <button
            type="submit"
            form="branding-form"
            className="btn btn-primary text-xs"
          >
            <Icon name="check" size={14} />
            <span>Save Branding</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Icon name="check" size={15} />
            <span>Branding assets updated successfully! Changes are immediately reflected on the login page and dashboard.</span>
          </div>
          <Link
            href="/login"
            className="font-semibold underline hover:opacity-80 ml-2 shrink-0"
            target="_blank"
          >
            Preview Login Page &rarr;
          </Link>
        </div>
      )}

      <form id="branding-form" onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Visual Image Assets */}
        <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--color-border)]">
            <div className="size-8 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center">
              <Icon name="sparkles" size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--color-text)]">Visual Image Assets</h2>
              <p className="text-xs text-[var(--color-text-muted)]">
                Files stored in <code className="px-1.5 py-0.5 rounded bg-[var(--color-surface-elevated)] border border-[var(--color-border)] font-mono text-[11px]">frontend/public/images/</code>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Field 1: Organization Logo */}
            <div className="space-y-3">
              <label htmlFor="logoUrl" className="block text-xs font-semibold text-[var(--color-text)]">
                Organization Official Logo (PNG/SVG)
              </label>

              {/* Logo Preview */}
              <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] flex items-center justify-center min-h-[110px]">
                {formData.logoUrl ? (
                  <img
                    src={formData.logoUrl}
                    alt="Logo Preview"
                    className="max-h-20 w-auto object-contain drop-shadow-md"
                  />
                ) : (
                  <span className="text-xs text-[var(--color-text-muted)]">No logo image selected</span>
                )}
              </div>

              <input
                id="logoUrl"
                type="text"
                value={formData.logoUrl}
                onChange={(e) => handleFieldChange('logoUrl', e.target.value)}
                placeholder="/images/Birla_Institute_of_Technology_Mesra.png"
                className="w-full h-9 px-3 text-xs rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text)] font-mono focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-hidden"
              />

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider block">Quick Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_LOGOS.map((p) => (
                    <button
                      key={p.path}
                      type="button"
                      onClick={() => handleFieldChange('logoUrl', p.path)}
                      className={`text-[10.5px] px-2 py-1 rounded-md border transition-colors cursor-pointer ${
                        formData.logoUrl === p.path
                          ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                          : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Field 2: Login Page Hero (75% Coverage Image) */}
            <div className="space-y-3">
              <label htmlFor="loginHeroUrl" className="block text-xs font-semibold text-[var(--color-text)]">
                Login Page Main Hero Image (75% Coverage Image)
              </label>

              {/* Hero Image Thumbnail Preview */}
              <div
                className="h-[110px] rounded-xl border border-[var(--color-border)] bg-cover bg-center relative overflow-hidden shadow-xs flex items-end p-2.5"
                style={{ backgroundImage: `url('${formData.loginHeroUrl}')` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
                <span className="relative z-10 text-[10.5px] font-mono text-white/90 truncate">
                  75% Left Panel Background Preview
                </span>
              </div>

              <input
                id="loginHeroUrl"
                type="text"
                value={formData.loginHeroUrl}
                onChange={(e) => handleFieldChange('loginHeroUrl', e.target.value)}
                placeholder="/images/bitfront.webp"
                className="w-full h-9 px-3 text-xs rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text)] font-mono focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-hidden"
              />

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider block">Quick Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_HERO_IMAGES.map((p) => (
                    <button
                      key={p.path}
                      type="button"
                      onClick={() => handleFieldChange('loginHeroUrl', p.path)}
                      className={`text-[10.5px] px-2 py-1 rounded-md border transition-colors cursor-pointer ${
                        formData.loginHeroUrl === p.path
                          ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                          : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Institutional Metadata & Texts */}
        <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--color-border)]">
            <div className="size-8 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center">
              <Icon name="building" size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--color-text)]">Institutional Titles & Contact</h2>
              <p className="text-xs text-[var(--color-text-muted)]">
                Organization details displayed in portal headers, footers, and communications
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label htmlFor="name" className="font-semibold text-[var(--color-text)]">
                Organization Full Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="shortName" className="font-semibold text-[var(--color-text)]">
                Short Name / Campus
              </label>
              <input
                id="shortName"
                type="text"
                value={formData.shortName}
                onChange={(e) => handleFieldChange('shortName', e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="markLetter" className="font-semibold text-[var(--color-text)]">
                Mark Letter / Acronym
              </label>
              <input
                id="markLetter"
                type="text"
                value={formData.markLetter}
                onChange={(e) => handleFieldChange('markLetter', e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text)] font-mono focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="division" className="font-semibold text-[var(--color-text)]">
                Division / Department
              </label>
              <input
                id="division"
                type="text"
                value={formData.division}
                onChange={(e) => handleFieldChange('division', e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="tagline" className="font-semibold text-[var(--color-text)]">
                Tagline / Operational Mission
              </label>
              <input
                id="tagline"
                type="text"
                value={formData.tagline}
                onChange={(e) => handleFieldChange('tagline', e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="supportEmail" className="font-semibold text-[var(--color-text)]">
                Official Support Email
              </label>
              <input
                id="supportEmail"
                type="email"
                value={formData.supportEmail}
                onChange={(e) => handleFieldChange('supportEmail', e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text)] font-mono focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="copyright" className="font-semibold text-[var(--color-text)]">
                Copyright Notice
              </label>
              <input
                id="copyright"
                type="text"
                value={formData.copyright}
                onChange={(e) => handleFieldChange('copyright', e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Live Preview Simulation */}
        <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
            <h2 className="text-sm font-bold text-[var(--color-text)]">Interactive Header & Login Preview</h2>
            <Link href="/login" className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1" target="_blank">
              <span>Open live login page</span>
              <Icon name="arrow" size={11} />
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 text-white flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-white p-1 flex items-center justify-center">
                <img src={formData.logoUrl} alt="" className="size-full object-contain" />
              </div>
              <div>
                <div className="text-sm font-bold">{formData.name}</div>
                <div className="text-[10px] text-emerald-400 font-mono uppercase">{formData.division} · {formData.shortName}</div>
              </div>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/10 border border-white/20">
              {formData.markLetter}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-secondary text-xs"
          >
            Reset Defaults
          </button>
          <button
            type="submit"
            className="btn btn-primary text-xs"
          >
            Save All Changes
          </button>
        </div>
      </form>
    </div>
  );
}

