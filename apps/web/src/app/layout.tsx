import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Wind Forecast Application',
  description: 'Production-ready monorepo for a full-stack wind forecast monitoring app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
