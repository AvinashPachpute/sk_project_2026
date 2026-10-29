import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Apex SIMS — Student Information Management System',
  description: 'Enterprise college administration portal for student records, attendance tracking, and examination grading.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
