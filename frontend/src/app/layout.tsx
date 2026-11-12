import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/lib/query-provider';
import { ClientAuthProvider } from '@/lib/auth-provider';
import { ThemeProvider, themeInitScript } from '@/lib/theme-provider';
import { BRANDING } from '@/lib/branding';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: `${BRANDING.name} HRMS`,
  description: BRANDING.tagline,
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the theme init script below sets the `dark`
    // class before React hydrates; the mismatch is intentional and benign.
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <QueryProvider>
          <ThemeProvider>
            <ClientAuthProvider>{children}</ClientAuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
