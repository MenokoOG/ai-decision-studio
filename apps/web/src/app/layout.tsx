import type { Metadata } from 'next';
import { Sora } from 'next/font/google';
import type { ReactNode } from 'react';

import './globals.css';

const sora = Sora({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AI Decision Studio',
  description: 'Web-first AI initiative planning and deterministic decision support.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={sora.className}>{children}</body>
    </html>
  );
}
