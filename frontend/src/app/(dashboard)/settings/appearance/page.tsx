'use client';

import { useTheme } from '@/lib/theme-provider';
import { THEMES, type ThemeId, type AppearanceMode } from '@/lib/theme-definitions';
import { Icon } from '@/components/ui/Icon';

const PRESET_THEMES: { id: ThemeId; title: string; subtitle: string; swatches: string[] }[] = [
  {
    id: 'desert-studio',
    title: 'Desert Studio',
    subtitle: 'Warm champagne, soft linen and golden amber',
    swatches: ['#FAF6F0', '#D97706', '#C8924A', '#FDE68A'],
  },
  {
    id: 'botanical',
    title: 'Botanical',
    subtitle: 'Sage, ivory and forest green',
    swatches: ['#EAF0E5', '#507E63', '#8BAE91', '#C7D9A5'],
  },
  {
    id: 'cloudscape',
    title: 'Cloudscape',
    subtitle: 'Soft sky blue, white and cobalt',
    swatches: ['#EAF1F8', '#527DAF', '#76B6CD', '#EBCB83'],
  },
  {
    id: 'terracotta',
    title: 'Terracotta',
    subtitle: 'Crisp architectural stone and burnt copper',
    swatches: ['#F4F3F1', '#C2410C', '#EA580C', '#FB923C'],
  },
];

export default function AppearanceSettingsPage() {
  const { preferences, setTheme, setMode, updatePreferences, resetDefaults, resolvedMode } = useTheme();

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs">
            <span className="text-[var(--color-text-muted)] font-mono uppercase tracking-wider">Workspace Styling</span>
            <span className="text-[var(--color-border)]">/</span>
            <span className="text-[var(--color-text)] font-semibold">Appearance Studio</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
            Atmospheric Themes & Geometry
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Curate your abstract floating workspace, background intensity, and bespoke palette accents.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={resetDefaults}
            className="btn btn-secondary text-xs"
          >
            <Icon name="refresh" size={13} />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* 1. Theme Presets (4 Master Cards) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-bold text-[var(--color-text)]">Abstract Artwork Presets</h2>
          <p className="text-xs text-[var(--color-text-muted)]">
            Hover to live preview any theme; click to apply permanently across your entire workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRESET_THEMES.map((preset) => {
            const isSelected = preferences.theme === preset.id;
            const themeDef = THEMES[preset.id];
            const currentModeColors = themeDef[resolvedMode];
            const previewSvg = `/themes/${preset.id}/${resolvedMode}.svg`;

            return (
              <div
                key={preset.id}
                onClick={() => setTheme(preset.id)}
                className={`relative overflow-hidden rounded-2xl border cursor-pointer transition-all duration-200 p-5 ${
                  isSelected
                    ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)] shadow-lg'
                    : 'border-[var(--color-border)] hover:border-[var(--color-primary)] shadow-xs'
                }`}
                style={{ backgroundColor: currentModeColors.surface }}
              >
                {/* SVG Visual Background Preview Thumbnail */}
                <div
                  className="w-full h-32 rounded-xl mb-4 border border-black/10 overflow-hidden relative bg-cover bg-center transition-all duration-300"
                  style={{ backgroundImage: `url("${previewSvg}")` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end p-3">
                    <span className="text-[11px] font-bold text-white tracking-wide uppercase px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-xs">
                      {preset.title}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
                      <span>{preset.title}</span>
                      {isSelected && (
                        <span className="size-2 rounded-full bg-[var(--color-primary)]" />
                      )}
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{preset.subtitle}</p>
                  </div>

                  {/* Swatches */}
                  <div className="flex items-center gap-1.5 p-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)]">
                    {preset.swatches.map((color, idx) => (
                      <span
                        key={idx}
                        className="size-4 rounded-full border border-black/10 shadow-2xs"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Appearance Mode Segmented Control */}
      <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-[var(--color-text)]">Appearance Mode</h2>
          <p className="text-xs text-[var(--color-text-muted)]">
            Switching mode preserves your selected abstract artwork identity.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 max-w-md">
          {(['light', 'dark', 'system'] as AppearanceMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setMode(mode)}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                preferences.mode === mode
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-xs'
                  : 'bg-[var(--color-surface-elevated)] border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-canvas-secondary)]'
              }`}
            >
              <Icon name={mode === 'light' ? 'sun' : mode === 'dark' ? 'moon' : 'sliders'} size={14} />
              <span className="capitalize">{mode}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Background Artwork & Geometry Customization */}
      <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-6 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-[var(--color-text)]">Canvas & Surface Geometry Controls</h2>
          <p className="text-xs text-[var(--color-text-muted)]">
            These sliders control the physical geometry, shadow depth, and background art opacity of your workspace.
          </p>
        </div>

        {/* Real-time Interactive Geometry Preview Sandbox */}
        <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-canvas)] relative overflow-hidden transition-all">
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              backgroundImage: `url("/themes/${preferences.theme}/${resolvedMode}.svg")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: preferences.backgroundIntensity / 100,
            }}
          />

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Live Morphing Sample Card */}
            <div
              className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] max-w-sm w-full transition-all duration-200"
              style={{
                borderRadius: `${preferences.cardRadius}px`,
                boxShadow: `0 ${Math.round(preferences.shadowIntensity / 4)}px ${Math.round(preferences.shadowIntensity / 2)}px -2px rgba(0, 0, 0, ${
                  resolvedMode === 'dark' ? 0.5 * (preferences.shadowIntensity / 100) : 0.15 * (preferences.shadowIntensity / 100)
                })`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="size-2 rounded-full bg-[var(--color-primary)]" />
                <span className="text-[10px] font-mono font-bold uppercase text-[var(--color-text-muted)]">
                  Live Preview Sandbox
                </span>
              </div>
              <h4 className="text-xs font-bold text-[var(--color-text)]">
                Sample Interactive Surface
              </h4>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
                Corners: <span className="font-mono font-semibold text-[var(--color-text)]">{preferences.cardRadius}px</span> · 
                Shadow: <span className="font-mono font-semibold text-[var(--color-text)]">{preferences.shadowIntensity}%</span> · 
                Canvas Art: <span className="font-mono font-semibold text-[var(--color-text)]">{preferences.backgroundIntensity}%</span>
              </p>
            </div>

            <div className="text-right text-[11px] font-mono text-[var(--color-text-muted)] hidden sm:block">
              <span>Dynamic CSS Tokens</span>
              <div className="text-[10px] opacity-75 mt-0.5">--card-radius · --shadow-multiplier · --background-art-opacity</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Background Intensity Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[var(--color-text)]">Artwork Intensity (Canvas Opacity)</span>
              <span className="font-mono text-[var(--color-text-muted)]">{preferences.backgroundIntensity}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={preferences.backgroundIntensity}
              onChange={(e) => updatePreferences({ backgroundIntensity: Number(e.target.value) })}
              className="w-full accent-[var(--color-primary)] cursor-pointer"
            />
            <p className="text-[10.5px] text-[var(--color-text-muted)]">
              Controls the opacity of the fixed SVG abstract artwork canvas behind your workspace.
            </p>
          </div>

          {/* Card Corner Radius */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[var(--color-text)]">Panel & Card Curvature (Border Radius)</span>
              <span className="font-mono text-[var(--color-text-muted)]">{preferences.cardRadius}px</span>
            </div>
            <input
              type="range"
              min="12"
              max="28"
              value={preferences.cardRadius}
              onChange={(e) => updatePreferences({ cardRadius: Number(e.target.value) })}
              className="w-full accent-[var(--color-primary)] cursor-pointer"
            />
            <p className="text-[10.5px] text-[var(--color-text-muted)]">
              Adjusts the corner roundness of all workspace panels, cards, and dialogue frames from sharp (12px) to soft (28px).
            </p>
          </div>

          {/* Shadow Elevation Depth */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[var(--color-text)]">Floating Shadow Elevation (Depth)</span>
              <span className="font-mono text-[var(--color-text-muted)]">{preferences.shadowIntensity}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={preferences.shadowIntensity}
              onChange={(e) => updatePreferences({ shadowIntensity: Number(e.target.value) })}
              className="w-full accent-[var(--color-primary)] cursor-pointer"
            />
            <p className="text-[10.5px] text-[var(--color-text-muted)]">
              Scales the 3D depth and drop shadows of the floating sidebar, topbar, and elevated cards.
            </p>
          </div>

          {/* Topographic Contours Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] self-start">
            <div>
              <div className="text-xs font-semibold text-[var(--color-text)]">Topographic Contour Lines</div>
              <div className="text-[11px] text-[var(--color-text-muted)]">Toggle fine organic Bézier lines in artwork canvas</div>
            </div>
            <input
              type="checkbox"
              checked={preferences.showContours}
              onChange={(e) => updatePreferences({ showContours: e.target.checked })}
              className="size-4 rounded accent-[var(--color-primary)] cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

