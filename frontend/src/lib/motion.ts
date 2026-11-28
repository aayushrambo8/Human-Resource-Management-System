'use client';

export { motion, AnimatePresence, m } from 'motion/react';

/**
 * Accessible, physics-calibrated animation presets for the HRMS platform:
 * - Ease-out for entrances, ~20% shorter exits
 * - 150-250ms dropdowns & popovers starting at scale 0.95
 * - Ease-in-out for on-screen moves
 * - Critically damped (no-bounce) springs for everyday UI; delight springs reserved for celebrations
 */
export const transitions = {
  /** Everyday UI spring — critically damped, zero bounce */
  snappy: { type: 'spring' as const, stiffness: 420, damping: 36, mass: 0.8 },
  /** Reserved only for celebratory moments of delight */
  delight: { type: 'spring' as const, stiffness: 320, damping: 18, mass: 0.9 },
  /** Standard entrance: ease-out, 220ms */
  entrance: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const },
  /** Exit ~20% shorter than entrance: 170ms */
  exit: { duration: 0.17, ease: [0.4, 0, 1, 1] as const },
  /** Dropdowns & popovers: 180ms (within 150-250ms budget) */
  dropdown: { duration: 0.18, ease: [0.22, 1, 0.36, 1] as const },
  /** On-screen position/layout movements: ease-in-out */
  move: { duration: 0.24, ease: 'easeInOut' as const },
  /** Quick micro-interaction */
  quick: { duration: 0.15, ease: 'easeOut' as const },
  /** Crossfade */
  fade: { duration: 0.2, ease: 'easeInOut' as const },
  // Legacy aliases kept for compatibility
  spring: { type: 'spring' as const, stiffness: 420, damping: 36, mass: 0.8 },
  gentle: { type: 'spring' as const, stiffness: 300, damping: 28 },
};

/** Stagger list rows by 30-50ms (default 35ms) */
export function staggerList(stepSeconds = 0.035, delayChildren = 0.02) {
  return {
    animate: {
      transition: {
        staggerChildren: stepSeconds,
        delayChildren,
      },
    },
  };
}

/** Follow-through: container settles first, details stagger in slightly after */
export function staggerDetails(delay = 0.09, step = 0.04) {
  return {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        delayChildren: delay,
        staggerChildren: step,
      },
    },
  };
}

/** Frequency-of-use scaling: high-frequency actions animate faster */
export function durationByFrequency(usageCount: number, baseSeconds = 0.22): number {
  if (usageCount >= 20) return Math.max(0.08, baseSeconds * 0.45);
  if (usageCount >= 5) return Math.max(0.12, baseSeconds * 0.7);
  return baseSeconds;
}

export const variants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: transitions.entrance },
    exit: { opacity: 0, transition: transitions.exit },
  },
  fadeSlideUp: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: transitions.entrance },
    exit: { opacity: 0, y: 6, transition: transitions.exit },
  },
  listRow: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0, transition: transitions.entrance },
    exit: { opacity: 0, y: -4, transition: transitions.exit },
  },
  /** Popovers always start at scale 0.95 (never 0) and exit faster */
  popover: {
    initial: { opacity: 0, y: -6, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1, transition: transitions.dropdown },
    exit: { opacity: 0, y: -4, scale: 0.95, transition: transitions.exit },
  },
  modal: {
    initial: { opacity: 0, scale: 0.95, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0, transition: transitions.entrance },
    exit: { opacity: 0, scale: 0.96, y: 6, transition: transitions.exit },
  },
  /** Crossfade icons with scale & blur */
  iconCrossfade: {
    initial: { opacity: 0, scale: 0.8, filter: 'blur(4px)' },
    animate: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: transitions.quick },
    exit: { opacity: 0, scale: 0.8, filter: 'blur(4px)', transition: { duration: 0.12, ease: 'easeIn' as const } },
  },
  /** Mask reveal (wipe) */
  maskReveal: {
    initial: { clipPath: 'inset(0 100% 0 0)', opacity: 0.6 },
    animate: { clipPath: 'inset(0 0% 0 0)', opacity: 1, transition: transitions.entrance },
    exit: { clipPath: 'inset(0 0 0 100%)', opacity: 0, transition: transitions.exit },
  },
  /** Curved arc motion for tossed/floating elements */
  arcIn: {
    initial: { opacity: 0, x: -12, y: 18, scale: 0.95 },
    animate: {
      opacity: [0, 1, 1],
      x: [-12, -3, 0],
      y: [18, -4, 0],
      scale: [0.95, 1.01, 1],
      transition: { duration: 0.32, ease: 'easeInOut' as const },
    },
    exit: { opacity: 0, y: 10, scale: 0.95, transition: transitions.exit },
  },
  /** Anticipation wind-up before movement */
  anticipation: {
    rest: { y: 0, scale: 1 },
    windup: { y: 2, scale: 0.97, transition: { duration: 0.08, ease: 'easeOut' as const } },
    launch: { y: -3, scale: 1, transition: transitions.entrance },
  },
  drawerLeft: {
    initial: { x: '-100%', opacity: 0.6 },
    animate: { x: 0, opacity: 1, transition: transitions.entrance },
    exit: { x: '-100%', opacity: 0, transition: transitions.exit },
  },
};
