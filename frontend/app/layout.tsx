import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/components/providers/QueryProvider';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Scarlet Fashion',
  description: 'Premium Ladies Clothing Store',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
