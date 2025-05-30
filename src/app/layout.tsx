import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import SessionProviderWrapper from '@/components/SessionProviderWrapper';
import LanguageChangeBtn from '@/components/languageChangeBtn';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Toaster } from 'sonner';
import { PinProvider } from '@/context/PinContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'chicken hut billing system',
  description: 'A billing system for chicken hut',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <NextIntlClientProvider messages={messages}>
        <SessionProviderWrapper>
          <PinProvider>
            <body
              className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
              {children}
              <LanguageChangeBtn />
              <Toaster />
            </body>
          </PinProvider>
        </SessionProviderWrapper>
      </NextIntlClientProvider>
    </html>
  );
}
