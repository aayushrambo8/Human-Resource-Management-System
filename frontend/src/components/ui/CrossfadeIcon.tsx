'use client';

import { AnimatePresence, motion, variants } from '@/lib/motion';
import { Icon, type IconName } from './Icon';

interface CrossfadeIconProps {
  name: IconName;
  size?: number;
  className?: string;
}

/**
 * Smoothly cross-fades between icon states using scale + subtle blur
 * instead of a jarring hard swap.
 */
export function CrossfadeIcon({ name, size = 16, className = '' }: CrossfadeIconProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={name}
        variants={variants.iconCrossfade}
        initial="initial"
        animate="animate"
        exit="exit"
        className="inline-flex items-center justify-center"
      >
        <Icon name={name} size={size} className={className} />
      </motion.span>
    </AnimatePresence>
  );
}
