import React from 'react';
import {
  LayoutDashboard,
  Users,
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
  | 'users'
  | 'building'
  | 'clock'
  | 'fingerprint'
  | 'calendar'
  | 'settings'
  | 'chevron'
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
  | 'chevron-down'
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

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number | string;
  className?: string;
}

export function Icon({ name, size = 16, className = '', ...rest }: IconProps) {
  const iconProps = {
    size,
    className,
    strokeWidth: 1.75,
    ...rest,
  };

  switch (name) {
    case 'grid':
      return <LayoutDashboard {...iconProps} />;
    case 'users':
      return <Users {...iconProps} />;
    case 'building':
      return <Building2 {...iconProps} />;
    case 'clock':
      return <Clock {...iconProps} />;
    case 'fingerprint':
      return <Fingerprint {...iconProps} />;
    case 'calendar':
      return <Calendar {...iconProps} />;
    case 'settings':
      return <Settings {...iconProps} />;
    case 'chevron':
      return <ChevronRight {...iconProps} />;
    case 'chevron-down':
      return <ChevronDown {...iconProps} />;
    case 'logout':
      return <LogOut {...iconProps} />;
    case 'arrow':
      return <ArrowRight {...iconProps} />;
    case 'back':
      return <ArrowLeft {...iconProps} />;
    case 'plus':
      return <Plus {...iconProps} />;
    case 'menu':
      return <Menu {...iconProps} />;
    case 'close':
      return <X {...iconProps} />;
    case 'warning':
      return <AlertTriangle {...iconProps} />;
    case 'briefcase':
      return <Briefcase {...iconProps} />;
    case 'mail':
      return <Mail {...iconProps} />;
    case 'phone':
      return <Phone {...iconProps} />;
    case 'activity':
      return <Activity {...iconProps} />;
    case 'alert':
      return <AlertCircle {...iconProps} />;
    case 'info':
      return <Info {...iconProps} />;
    case 'server':
      return <Server {...iconProps} />;
    case 'sun':
      return <Sun {...iconProps} />;
    case 'moon':
      return <Moon {...iconProps} />;
    case 'search':
      return <Search {...iconProps} />;
    case 'filter':
      return <Filter {...iconProps} />;
    case 'download':
      return <Download {...iconProps} />;
    case 'more':
      return <MoreVertical {...iconProps} />;
    case 'check':
      return <Check {...iconProps} />;
    case 'check-circle':
      return <CheckCircle2 {...iconProps} />;
    case 'x-circle':
      return <XCircle {...iconProps} />;
    case 'bell':
      return <Bell {...iconProps} />;
    case 'sliders':
      return <SlidersHorizontal {...iconProps} />;
    case 'layers':
      return <Layers {...iconProps} />;
    case 'sparkles':
      return <Sparkles {...iconProps} />;
    case 'refresh':
      return <RefreshCw {...iconProps} />;
    case 'trending-up':
      return <TrendingUp {...iconProps} />;
    case 'trending-down':
      return <TrendingDown {...iconProps} />;
    case 'cake':
      return <Cake {...iconProps} />;
    case 'award':
      return <Award {...iconProps} />;
    case 'dot':
      return <CircleDot {...iconProps} />;
    case 'file':
      return <FileText {...iconProps} />;
    case 'shield':
      return <ShieldCheck {...iconProps} />;
    default:
      return <CircleDot {...iconProps} />;
  }
}
