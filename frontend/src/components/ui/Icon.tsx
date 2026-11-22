'use client';

import React from 'react';
import { motion, type SVGMotionProps, type Variants } from 'motion/react';
import { useAnimateIconContext, AnimateIcon, IconWrapper } from '@animate-ui/react/icons';
import {
  LayoutDashboard,
  Users,
  User,
  Building2,
  Clock,
  Fingerprint,
  Calendar,
  Settings,
  ChevronRight,
  LogOut,
  ArrowRight,
  Plus,
  Menu,
  X,
  AlertTriangle,
  Briefcase,
  Mail,
  Phone,
  ArrowLeft,
  Activity,
  AlertCircle,
  Info,
  Server,
  Sun,
  Moon,
  Search,
  Filter,
  Download,
  MoreVertical,
  Check,
  CheckCircle2,
  XCircle,
  Bell,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  Sparkles,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Cake,
  Award,
  CircleDot,
  FileText,
  ShieldCheck,
} from 'lucide-react';

export type IconName =
  | 'grid'
  | 'user'
  | 'users'
  | 'building'
  | 'clock'
  | 'fingerprint'
  | 'calendar'
  | 'settings'
  | 'chevron'
  | 'chevron-down'
  | 'logout'
  | 'arrow'
  | 'plus'
  | 'menu'
  | 'close'
  | 'warning'
  | 'briefcase'
  | 'mail'
  | 'phone'
  | 'back'
  | 'activity'
  | 'alert'
  | 'info'
  | 'server'
  | 'sun'
  | 'moon'
  | 'search'
  | 'filter'
  | 'download'
  | 'more'
  | 'check'
  | 'check-circle'
  | 'x-circle'
  | 'bell'
  | 'sliders'
  | 'layers'
  | 'sparkles'
  | 'refresh'
  | 'trending-up'
  | 'trending-down'
  | 'cake'
  | 'award'
  | 'dot'
  | 'file'
  | 'shield';

export interface IconProps extends Omit<SVGMotionProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number | string;
  className?: string;
  strokeWidth?: number;
  animateOnHover?: boolean;
  animateOnTap?: boolean;
  variants?: Variants;
}

const VARIANTS: Record<string, Variants> = {
  rotate360: {
    initial: { rotate: 0 },
    animate: {
      rotate: 360,
      transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
    },
    hover: {
      rotate: 180,
      transition: { duration: 0.45, ease: 'easeOut' },
    },
    tap: { scale: 0.9, rotate: 210 },
  },
  rotate90: {
    initial: { rotate: 0 },
    animate: {
      rotate: 90,
      transition: { duration: 0.35, ease: 'easeOut' },
    },
    hover: {
      rotate: 90,
      transition: { duration: 0.35, ease: 'easeOut' },
    },
    tap: { scale: 0.9, rotate: 110 },
  },
  rotate45: {
    initial: { rotate: 0, scale: 1 },
    animate: {
      rotate: [0, 45, 0],
      scale: [1, 1.15, 1],
      transition: { duration: 0.5, ease: 'easeInOut' },
    },
    hover: {
      rotate: 45,
      scale: 1.1,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    tap: { scale: 0.9, rotate: 60 },
  },
  ring: {
    initial: { rotate: 0, transformOrigin: 'top center' },
    animate: {
      rotate: [0, 15, -12, 8, -4, 0],
      transition: { duration: 0.65, ease: 'easeInOut' },
    },
    hover: {
      rotate: [0, 15, -12, 8, -4, 0],
      transition: { duration: 0.65, ease: 'easeInOut' },
    },
    tap: { scale: 0.92 },
  },
  pulse: {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.18, 1],
      transition: { duration: 0.4, ease: 'easeInOut' },
    },
    hover: {
      scale: 1.12,
      transition: { duration: 0.25, ease: 'easeOut' },
    },
    tap: { scale: 0.9 },
  },
  slideRight: {
    initial: { x: 0 },
    animate: {
      x: [0, 4, 0],
      transition: { duration: 0.35, ease: 'easeInOut' },
    },
    hover: {
      x: 3,
      transition: { duration: 0.2, ease: 'easeOut' },
    },
    tap: { scale: 0.92, x: 1 },
  },
  slideLeft: {
    initial: { x: 0 },
    animate: {
      x: [0, -4, 0],
      transition: { duration: 0.35, ease: 'easeInOut' },
    },
    hover: {
      x: -3,
      transition: { duration: 0.2, ease: 'easeOut' },
    },
    tap: { scale: 0.92, x: -1 },
  },
  slideDown: {
    initial: { y: 0 },
    animate: {
      y: [0, 4, 0],
      transition: { duration: 0.35, ease: 'easeInOut' },
    },
    hover: {
      y: 3,
      transition: { duration: 0.2, ease: 'easeOut' },
    },
    tap: { scale: 0.92, y: 1 },
  },
  slideUpRight: {
    initial: { x: 0, y: 0 },
    animate: {
      x: [0, 2, 0],
      y: [0, -2, 0],
      transition: { duration: 0.35, ease: 'easeInOut' },
    },
    hover: {
      x: 2,
      y: -2,
      transition: { duration: 0.2, ease: 'easeOut' },
    },
    tap: { scale: 0.92 },
  },
  slideDownRight: {
    initial: { x: 0, y: 0 },
    animate: {
      x: [0, 2, 0],
      y: [0, 2, 0],
      transition: { duration: 0.35, ease: 'easeInOut' },
    },
    hover: {
      x: 2,
      y: 2,
      transition: { duration: 0.2, ease: 'easeOut' },
    },
    tap: { scale: 0.92 },
  },
  bounce: {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.25, 1],
      transition: { duration: 0.4, ease: 'easeOut' },
    },
    hover: {
      scale: 1.15,
      transition: { duration: 0.2, ease: 'easeOut' },
    },
    tap: { scale: 0.9 },
  },
  sparkle: {
    initial: { scale: 1, rotate: 0 },
    animate: {
      scale: [1, 1.2, 1],
      rotate: [0, -12, 12, 0],
      transition: { duration: 0.5, ease: 'easeInOut' },
    },
    hover: {
      scale: 1.15,
      rotate: 10,
      transition: { duration: 0.25, ease: 'easeOut' },
    },
    tap: { scale: 0.9, rotate: -5 },
  },
  lift: {
    initial: { scale: 1, y: 0 },
    animate: {
      y: [0, -2, 0],
      scale: [1, 1.06, 1],
      transition: { duration: 0.35, ease: 'easeInOut' },
    },
    hover: {
      y: -1.5,
      scale: 1.08,
      transition: { duration: 0.2, ease: 'easeOut' },
    },
    tap: { scale: 0.92, y: 0 },
  },
};

const VARIANT_NAMES: Record<IconName, keyof typeof VARIANTS> = {
  refresh: 'rotate360',
  settings: 'rotate90',
  plus: 'rotate90',
  sun: 'rotate45',

  bell: 'ring',
  phone: 'ring',
  warning: 'ring',
  alert: 'ring',

  arrow: 'slideRight',
  chevron: 'slideRight',
  logout: 'slideRight',
  back: 'slideLeft',
  'chevron-down': 'slideDown',
  download: 'slideDown',
  'trending-up': 'slideUpRight',
  'trending-down': 'slideDownRight',

  check: 'bounce',
  'check-circle': 'bounce',
  'x-circle': 'bounce',
  close: 'bounce',

  sparkles: 'sparkle',
  award: 'sparkle',
  cake: 'sparkle',

  search: 'pulse',
  activity: 'pulse',
  fingerprint: 'pulse',
  shield: 'pulse',

  grid: 'lift',
  user: 'lift',
  users: 'lift',
  building: 'lift',
  clock: 'lift',
  calendar: 'lift',
  briefcase: 'lift',
  mail: 'lift',
  info: 'lift',
  server: 'lift',
  moon: 'lift',
  filter: 'lift',
  more: 'lift',
  sliders: 'lift',
  layers: 'lift',
  dot: 'lift',
  file: 'lift',
  menu: 'lift',
};

const ICON_COMPONENTS = {
  grid: motion.create(LayoutDashboard),
  user: motion.create(User),
  users: motion.create(Users),
  building: motion.create(Building2),
  clock: motion.create(Clock),
  fingerprint: motion.create(Fingerprint),
  calendar: motion.create(Calendar),
  settings: motion.create(Settings),
  chevron: motion.create(ChevronRight),
  'chevron-down': motion.create(ChevronDown),
  logout: motion.create(LogOut),
  arrow: motion.create(ArrowRight),
  back: motion.create(ArrowLeft),
  plus: motion.create(Plus),
  menu: motion.create(Menu),
  close: motion.create(X),
  warning: motion.create(AlertTriangle),
  briefcase: motion.create(Briefcase),
  mail: motion.create(Mail),
  phone: motion.create(Phone),
  activity: motion.create(Activity),
  alert: motion.create(AlertCircle),
  info: motion.create(Info),
  server: motion.create(Server),
  sun: motion.create(Sun),
  moon: motion.create(Moon),
  search: motion.create(Search),
  filter: motion.create(Filter),
  download: motion.create(Download),
  more: motion.create(MoreVertical),
  check: motion.create(Check),
  'check-circle': motion.create(CheckCircle2),
  'x-circle': motion.create(XCircle),
  bell: motion.create(Bell),
  sliders: motion.create(SlidersHorizontal),
  layers: motion.create(Layers),
  sparkles: motion.create(Sparkles),
  refresh: motion.create(RefreshCw),
  'trending-up': motion.create(TrendingUp),
  'trending-down': motion.create(TrendingDown),
  cake: motion.create(Cake),
  award: motion.create(Award),
  dot: motion.create(CircleDot),
  file: motion.create(FileText),
  shield: motion.create(ShieldCheck),
};

const FallbackIcon = motion.create(CircleDot);

export function Icon({
  name,
  size = 16,
  className = '',
  strokeWidth = 1.75,
  animateOnHover = true,
  animateOnTap = true,
  variants,
  ...rest
}: IconProps) {
  const { controls } = useAnimateIconContext();
  const Component = (ICON_COMPONENTS[name] ?? FallbackIcon) as React.ComponentType<any>;
  const variantKey = VARIANT_NAMES[name] ?? 'lift';
  const effectiveVariants = variants ?? VARIANTS[variantKey];

  return (
    <Component
      size={size}
      className={className}
      strokeWidth={strokeWidth}
      variants={effectiveVariants}
      initial="initial"
      animate={controls}
      whileHover={animateOnHover ? 'hover' : undefined}
      whileTap={animateOnTap ? 'tap' : undefined}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
      {...rest}
    />
  );
}

export { AnimateIcon, IconWrapper };
