import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Decision Studio',
  description: 'AI initiative planning and decision support by Menoko OG.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
