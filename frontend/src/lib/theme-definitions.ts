export type ThemeId = 'desert-studio' | 'botanical' | 'cloudscape' | 'terracotta';
export type AppearanceMode = 'light' | 'dark' | 'system';
export type UiDensity = 'comfortable' | 'compact';

export interface ThemeColors {
  canvas: string;
  canvasSecondary: string;
  surface: string;
  surfaceElevated: string;
  workspaceMat?: string;
  primary: string;
  primaryHover: string;
  secondary: string;
  accent: string;
  supporting: string;
  text: string;
  textMuted: string;
  border: string;
}

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  personality: string;
  light: ThemeColors;
  dark: ThemeColors;
}

export const THEMES: Record<ThemeId, ThemeDefinition> = {
  'desert-studio': {
    id: 'desert-studio',
    name: 'Desert Studio',
    description: 'Warm champagne, soft linen, and radiant golden amber.',
    personality: 'Warm, golden, radiant and welcoming',
    light: {
      canvas: '#FAF6F0',
      canvasSecondary: '#F3ECE0',
      surface: '#FFFDF9',
      surfaceElevated: '#FFFFFF',
      workspaceMat: '#F7F2E7',
      primary: '#B45309',
      primaryHover: '#92400E',
      secondary: '#C8924A',
      accent: '#FDE68A',
      supporting: '#E2BA78',
      text: '#292524',
      textMuted: '#57534E',
      border: '#E7DFD3',
    },
    dark: {
      canvas: '#1A1816',
      canvasSecondary: '#24211D',
      surface: '#2D2824',
      surfaceElevated: '#36302B',
      workspaceMat: '#201D19',
      primary: '#F59E0B',
      primaryHover: '#FBBF24',
      secondary: '#D97706',
      accent: '#FDE047',
      supporting: '#C49746',
      text: '#FAF6F0',
      textMuted: '#A89F94',
      border: '#453C35',
    },
  },
  'botanical': {
    id: 'botanical',
    name: 'Botanical',
    description: 'Natural, peaceful, sophisticated and organic.',
    personality: 'Calm, grounded, elegant and professional',
    light: {
      canvas: '#EAF0E5',
      canvasSecondary: '#E2EBDD',
      surface: '#FAF9F4',
      surfaceElevated: '#FCFBF7',
      workspaceMat: '#F5F3EB',
      primary: '#507E63',
      primaryHover: '#3E694F',
      secondary: '#8BAE91',
      accent: '#C7D9A5',
      supporting: '#D7B89A',
      text: '#293D32',
      textMuted: '#4B594E',
      border: '#DDE7D9',
    },
    dark: {
      canvas: '#17231D',
      canvasSecondary: '#1D2D24',
      surface: '#24352B',
      surfaceElevated: '#2C4033',
      workspaceMat: '#1E2D25',
      primary: '#8BC39A',
      primaryHover: '#A1D1AA',
      secondary: '#78A88A',
      accent: '#C1CF8E',
      supporting: '#B69A78',
      text: '#EAF3EA',
      textMuted: '#A1B5A4',
      border: '#394C40',
    },
  },
  'cloudscape': {
    id: 'cloudscape',
    name: 'Cloudscape',
    description: 'Airy, fresh, modern and sophisticated.',
    personality: 'Intelligent, atmospheric, light and contemporary',
    light: {
      canvas: '#EAF1F8',
      canvasSecondary: '#DFEAF5',
      surface: '#FBFBF8',
      surfaceElevated: '#FDFCFA',
      workspaceMat: '#F6F4ED',
      primary: '#3B6699',
      primaryHover: '#2C5282',
      secondary: '#76B6CD',
      accent: '#EBCB83',
      supporting: '#B6CDE3',
      text: '#273B52',
      textMuted: '#475569',
      border: '#DDE7F0',
    },
    dark: {
      canvas: '#151F2D',
      canvasSecondary: '#1C2A3C',
      surface: '#24344A',
      surfaceElevated: '#2C4057',
      workspaceMat: '#1D2A3B',
      primary: '#83B5E8',
      primaryHover: '#9CC8F0',
      secondary: '#70C1D1',
      accent: '#E8C98C',
      supporting: '#819DB9',
      text: '#ECF3FB',
      textMuted: '#A2B3C6',
      border: '#384A60',
    },
  },
  'terracotta': {
    id: 'terracotta',
    name: 'Terracotta',
    description: 'Crisp architectural stone paired with bold Mediterranean burnt copper.',
    personality: 'High-contrast, architectural, sharp and distinctive',
    light: {
      canvas: '#F4F3F1',
      canvasSecondary: '#EAE8E4',
      surface: '#FFFFFF',
      surfaceElevated: '#FFFFFF',
      workspaceMat: '#F0EEEA',
      primary: '#C2410C',
      primaryHover: '#9A3412',
      secondary: '#EA580C',
      accent: '#FB923C',
      supporting: '#D97706',
      text: '#1C1917',
      textMuted: '#57534E',
      border: '#E2DFD9',
    },
    dark: {
      canvas: '#141416',
      canvasSecondary: '#1C1C1F',
      surface: '#242428',
      surfaceElevated: '#2C2C32',
      workspaceMat: '#18181B',
      primary: '#F97316',
      primaryHover: '#FB923C',
      secondary: '#EA580C',
      accent: '#FDBA74',
      supporting: '#C2410C',
      text: '#F5F5F7',
      textMuted: '#A1A1AA',
      border: '#383842',
    },
  },
};

export interface WorkspacePreferences {
  theme: ThemeId;
  mode: AppearanceMode;
  customAccents: {
    light: {
      primary: string | null;
      secondary: string | null;
    };
    dark: {
      primary: string | null;
      secondary: string | null;
    };
  };
  backgroundIntensity: number; // 0 - 100
  showContours: boolean;
  shadowIntensity: number; // 0 - 100
  cardRadius: number; // in px, e.g. 16 - 24
  uiDensity: UiDensity;
}

export const DEFAULT_PREFERENCES: WorkspacePreferences = {
  theme: 'desert-studio',
  mode: 'light',
  customAccents: {
    light: { primary: null, secondary: null },
    dark: { primary: null, secondary: null },
  },
  backgroundIntensity: 85,
  showContours: true,
  shadowIntensity: 65,
  cardRadius: 20,
  uiDensity: 'comfortable',
};

