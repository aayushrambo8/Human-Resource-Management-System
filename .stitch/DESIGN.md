# Semantic Design System: Human Resource Management System (BIT HRMS)
**Generated via Google Stitch Skill (`taste-design` & `design-md`)**

---

## 1. Executive Visual Atmosphere

- **Atmospheric Archetype:** **Architectural Academic Monolith** (Clean Sandstone Canvas, Ivory Floating Islands, Warm Amber Accents).
- **Density Index:** **6/10** (Balanced Enterprise Workspace — generous white space, legible breathing room, high data legibility).
- **Variance Index:** **5/10** (Offset Asymmetry — sticky left-navigation rail, modular multi-width dashboard grids, floating telemetry cards).
- **Motion Index:** **5/10** (Fluid Spring Micro-Interactions — tactile button pushes, subtle glow halos on active timers, smooth accordions).

---

## 2. Color Calibration & The 60-30-10 Rule

| Role | Color Name | Hex Code | Usage |
|---|---|---|---|
| **60% Dominant** | Champagne Sandstone Canvas | `#FAF6F0` (Light) / `#0F172A` (Dark) | The global matte foundation backdrop that prevents eye strain. |
| **30% Structural** | Warm Ivory Surface | `#FFFDF9` (Light) / `#1E293B` (Dark) | Floating card islands, table surfaces, topbar navigation, and sidebar rail. |
| **10% Singular Accent** | Burnished Amber / Ochre | `#D97706` (Hover: `#B45309`) | Primary action buttons (`+ Onboard New Employee`, `Clock In`), active nav item, status focus. |
| **Signal / Verification** | Emerald Mint | `#10B981` (Soft BG: `#ECFDF5`) | Positive punch events (`CHECK IN`), biometric OK status, verified telemetry tags. |
| **Signal / Alert** | Burnt Terracotta | `#EA580C` (Soft BG: `#FFF7ED`) | Action-required approval queues, overtime warning, pending reviews. |

> [!NOTE]
> **Anti-Pattern Guardrail**: The generic "AI Purple/Blue Neon" glow is strictly banned. Shadows are softly tinted with amber-slate (`rgba(180, 83, 9, 0.04)` to `rgba(15, 23, 42, 0.08)`) instead of artificial cold black.

---

## 3. Typographic Architecture & Golden Ratio Modular Hierarchy

The system establishes an authoritative institutional voice using Google Serif alongside high-impact tabular typography:

- **Primary Body & Prose Stack:** `Lora`, `Merriweather`, `Georgia`, serif
- **High-Emphasis & Numeric Stack:** `Impact`, `Arial Black`, sans-serif (for stopwatch timers, big KPI figures, status badges)
- **Technical & Terminal Stack:** `ui-monospace`, `SFMono-Regular`, `Consolas`, monospace (for employee codes, device checkpoints, ISO dates)

### Golden Ratio Scale ($\phi \approx 1.618$):
- **Hero / Stopwatch Timer:** `68px` (`font-impact`, tabular figures, tracking-tight)
- **Major Page Titles:** `42px` (`font-serif`, font-bold, leading-tight)
- **Personnel Names & Metric Values:** `26px` - `34px` (`font-serif` for names, `font-impact` for numbers)
- **Subheads & Card Titles:** `20px` (`font-serif`, font-semibold)
- **Body & Table Text:** `16px` (`font-serif`, relaxed leading)
- **Descriptive Meta & Helpers:** `13px` (`font-serif`, text-muted)
- **Badges, Checkpoints & Micro Tags:** `10px` (`font-mono` / `font-impact` uppercase, letter-spaced)

---

## 4. UI/UX Analysis of the 13 Captured Screens & Key Enhancements

### Screen 01: `/login` (Split-Screen Showcase)
- **Current Observation:** High-impact institutional showcase (75% image coverage of BIT Mesra/Patna, official emblem, quick demo credentials).
- **Stitch UX Enhancement:**
  1. Add subtle entrance stagger (`opacity: 0, y: 12 -> opacity: 1, y: 0`) on the demo role pill buttons.
  2. Implement keyboard shortcut indicators (`Tab` to jump straight to demo credentials).

### Screen 02: `/` (Workforce Intelligence & Operations)
- **Current Observation:** 4 KPI linear metric tiles, today's biometric table stream, and active daily attendance stopwatch with live progress bar.
- **Stitch UX Enhancement:**
  1. **Zeigarnik Effect**: The 8-hour shift goal progress bar now fills smoothly with dynamic milestone tooltips (`50% Half-Day Passed`, `88% Shift Nearing Completion`).
  2. **Von Restorff Effect**: The `Daily Attendance Stopwatch` card features an ambient pulsing border ring when clocked in, drawing immediate attention to the user's primary ongoing task.

### Screen 03: `/employee` (Employee Workspace & Hub)
- **Current Observation:** Spacious hero profile card, 75% Profile Readiness Progress track with checkpoint badges, PTO balances, and swipe log.
- **Stitch UX Enhancement:**
  1. Make the `Emergency Contact (+25%)` pending checkpoint clickable, directly opening the emergency contact modal to complete the 100% profile milestone.
  2. Add visual micro-progress indicators inside the leave quota balance cards.

### Screens 04 & 05: `/employees` & `/employees/[id]` (Directory & Profile Dossier)
- **Current Observation:** Completely deslopped. No more cramped layout; spacious 2-column dossier with initial avatar badge, verified contact cards, and department assignments.
- **Stitch UX Enhancement:**
  1. Add quick-action filter pills (`Faculty`, `Staff`, `Officers`) above the enterprise table for instant department sorting without typing.
  2. In the employee dossier, add a direct "Download ID Card / Credentials" button.

### Screen 07: `/attendance` (Attendance Ledger)
- **Current Observation:** Daily grouped timesheets with day headers (`Today`, `Yesterday`), punctuality score, and checkpoint tags.
- **Stitch UX Enhancement:**
  1. Add sticky day-summary headers that remain pinned when scrolling through extensive swipe logs.
  2. Add inline color-coded punch difference indicators (e.g., `+12m early arrival`).

### Screen 08: `/leave` (Leave & Time Off Governance)
- **Current Observation:** Clear pending requests table with inline `Approve` and `Reject` buttons.
- **Stitch UX Enhancement:**
  1. Add optimistic UI micro-confetti feedback upon clicking `Approve` (Peak-End Rule).
  2. Provide a calendar heat-map preview showing team member overlaps before granting leave.

### Screen 12: `/settings/appearance` (Appearance Studio)
- **Current Observation:** 6 differentiated atmospheric presets (Desert Studio, Botanical, Cloudscape, Terracotta) with interactive live canvas geometry sandbox.
- **Stitch UX Enhancement:**
  1. Add a 1-click "Share Theme Token" export button to output CSS variables directly for external design systems.
