import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/lib/query-provider';
import { ClientAuthProvider } from '@/lib/auth-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Northstar Institute HRMS',
  description: 'Self-hosted human-resources workspace for an institution',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <QueryProvider>
          <ClientAuthProvider>{children}</ClientAuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}