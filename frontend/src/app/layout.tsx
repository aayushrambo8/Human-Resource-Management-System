import type { Viewport } from 'next';
import { Inter, Lora, Merriweather } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/lib/query-provider';
import { ClientAuthProvider } from '@/lib/auth-provider';
import { ThemeProvider, themeInitScript } from '@/lib/theme-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const lora = Lora({ subsets: ['latin'], variable: '--font-lora' });
const merriweather = Merriweather({ weight: ['300', '400', '700'], subsets: ['latin'], variable: '--font-merriweather' });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
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
            <ClientAuthProvider>{children}</ClientAuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
