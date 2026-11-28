import type { Metadata, Viewport } from 'next';
import { Inter, Lora, Merriweather } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/lib/query-provider';
import { ClientAuthProvider } from '@/lib/auth-provider';
import { ThemeProvider, themeInitScript } from '@/lib/theme-provider';
import { CookieConsentBanner } from '@/components/ui/CookieConsentBanner';
import { ToastProvider } from '@/components/ui/Toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const lora = Lora({ subsets: ['latin'], variable: '--font-lora', display: 'swap' });
const merriweather = Merriweather({
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  variable: '--font-merriweather',
  display: 'swap',
});

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://hrms.bitmesra.ac.in').replace(/\/+$/, '');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'BIT Patna HRMS · Enterprise Workforce & Biometric Portal',
    template: '%s | BIT Patna HRMS',
  },
  description:
    'Unified Human Resource Management System for Birla Institute of Technology (BIT Patna): real-time biometric attendance, workforce directory, and leave governance.',
  keywords: [
    'HRMS',
    'Human Resource Management System',
    'BIT Patna',
    'Birla Institute of Technology',
    'Biometric Attendance',
    'Leave Management',
  ],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteUrl,
    siteName: 'BIT Patna Enterprise HRMS',
    title: 'BIT Patna HRMS · Enterprise Workforce & Biometric Portal',
    description:
      'Real-time biometric terminal telemetry, automated timesheet ledgers, and streamlined leave governance.',
    images: [
      {
        url: '/images/og-preview.png',
        width: 1200,
        height: 630,
        alt: 'BIT Patna Enterprise HRMS Portal Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BIT Patna HRMS · Enterprise Workforce & Biometric Portal',
    description:
      'Real-time biometric terminal telemetry, automated timesheet ledgers, and streamlined leave governance.',
    images: ['/images/og-preview.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF6F0' },
    { media: '(prefers-color-scheme: dark)', color: '#1A1816' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the theme init script below sets the `dark`
    // class before React hydrates; the mismatch is intentional and benign.
    <html lang="en" className={`${inter.variable} ${lora.variable} ${merriweather.variable}`} suppressHydrationWarning>
      <body className={`${lora.className} antialiased`}>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <QueryProvider>
          <ThemeProvider>
            <ToastProvider>
              <ClientAuthProvider>
                {children}
                <CookieConsentBanner />
              </ClientAuthProvider>
            </ToastProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
