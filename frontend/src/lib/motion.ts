'use client';

export { motion, AnimatePresence, m } from 'motion/react';

/**
 * Standard accessible animation presets for the HRMS platform.
 * These provide subtle, enterprise-grade physics without excessive motion.
 */
export const transitions = {
  spring: { type: 'spring', stiffness: 380, damping: 28 },
  gentle: { type: 'spring', stiffness: 260, damping: 20 },
  quick: { duration: 0.15, ease: 'easeOut' },
  fade: { duration: 0.2, ease: 'easeInOut' },
};

export const variants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  fadeSlideUp: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 8 },
  },
  popover: {
    initial: { opacity: 0, y: -8, scale: 0.96 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -6, scale: 0.97 },
  },
  modal: {
    initial: { opacity: 0, scale: 0.95, y: 14 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.96, y: 10 },
  },
  drawerLeft: {
    initial: { x: '-100%', opacity: 0.5 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
  },
};
