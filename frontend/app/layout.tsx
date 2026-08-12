import type { Metadata } from 'next';
import { Inter, Noto_Sans_Bengali } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/components/providers/query-provider';
import { Toast } from '@/components/common/toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ['bengali'],
  variable: '--font-bangla',
});

export const metadata: Metadata = {
  title: {
    default: 'UTHANO - From Farm to Family',
    template: '%s | UTHANO',
  },
  description:
    'Fresh from the farm, delivered to your home. UTHANO sources fresh fruits and agricultural products directly from Bangladeshi farms with complete traceability.',
  keywords: [
    'UTHANO',
    'farm to home',
    'fresh fruits',
    'Bangladesh',
    'organic',
    'farm fresh',
    'agriculture',
  ],
  openGraph: {
    title: 'UTHANO - From Farm to Family',
    description:
      'Fresh from the farm, delivered to your home. UTHANO sources fresh fruits and agricultural products directly from Bangladeshi farms.',
    type: 'website',
    locale: 'en_US',
    siteName: 'UTHANO',
  },
  robots: {
    index: true,
    follow: true,
  },
};
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${notoSansBengali.variable}`}>
      <body className="font-sans">
        <QueryProvider>
          {children}
          <Toast />
        </QueryProvider>
      </body>
    </html>
  );
}