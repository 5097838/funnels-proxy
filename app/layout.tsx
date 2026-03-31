import type { ReactNode } from 'react';

export const metadata = { title: 'Landing Page' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}