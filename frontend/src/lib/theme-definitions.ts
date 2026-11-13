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
    description: 'Warm, artistic, elegant, inviting and sophisticated.',
    personality: 'Warm, luxurious, expressive and welcoming',
    light: {
      canvas: '#F5EAE0',
      canvasSecondary: '#F0DFD2',
      surface: '#FCFAF5',
      surfaceElevated: '#FFFDF9',
      workspaceMat: '#F8F5EC',
      primary: '#E9785F',
      primaryHover: '#D9664E',
      secondary: '#B77A62',
      accent: '#F2C68A',
      supporting: '#DDAE9C',
      text: '#303B4B',
      textMuted: '#7D7B79',
      border: '#EFE0D4',
    },
    dark: {
      canvas: '#211E1D',
      canvasSecondary: '#2B2523',
      surface: '#302A28',
      surfaceElevated: '#39302D',
      workspaceMat: '#282321',
      primary: '#F08A70',
      primaryHover: '#F49B84',
      secondary: '#B98A79',
      accent: '#E9BC83',
      supporting: '#9D7467',
      text: '#F5EAE2',
      textMuted: '#B6A59B',
      border: '#493B36',
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
      textMuted: '#768579',
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
      primary: '#527DAF',
      primaryHover: '#406A9B',
      secondary: '#76B6CD',
      accent: '#EBCB83',
      supporting: '#B6CDE3',
      text: '#273B52',
      textMuted: '#77889A',
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
    description: 'Bold, earthy, artistic and distinctive.',
    personality: 'Artistic, expressive, warm and memorable',
    light: {
      canvas: '#F2E4D9',
      canvasSecondary: '#EAD8CA',
      surface: '#FCFAF6',
      surfaceElevated: '#FFFDF9',
      workspaceMat: '#F7F3E9',
      primary: '#B96648',
      primaryHover: '#A65339',
      secondary: '#D38A69',
      accent: '#E8BD86',
      supporting: '#C99C83',
      text: '#40332E',
      textMuted: '#86756E',
      border: '#E9D7C9',
    },
    dark: {
      canvas: '#241C19',
      canvasSecondary: '#30231F',
      surface: '#382924',
      surfaceElevated: '#44312A',
      workspaceMat: '#2D221E',
      primary: '#E58B68',
      primaryHover: '#F09B78',
      secondary: '#C9876C',
      accent: '#E6BB83',
      supporting: '#B98C72',
      text: '#F5E9DF',
      textMuted: '#B9A196',
      border: '#554039',
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

