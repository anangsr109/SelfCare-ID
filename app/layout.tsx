import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SelfCare ID Telehealth — Konsultasi Klinis & RME Biometrik',
  description:
    'Konsol konsultasi telehealth tingkat klinis, observasi biometrik waktu nyata, dan alur kerja RME terintegrasi.',
  openGraph: {
    title: 'SelfCare ID Telehealth — Konsultasi Klinis & RME Biometrik',
    description:
      'Konsol konsultasi telehealth tingkat klinis, observasi biometrik waktu nyata, dan alur kerja RME terintegrasi.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SelfCare ID Telehealth — Konsultasi Klinis & RME Biometrik',
    description:
      'Konsol konsultasi telehealth tingkat klinis, observasi biometrik waktu nyata, dan alur kerja RME terintegrasi.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-screen bg-[#F8FAFC] font-sans text-[#0F172A] antialiased selection:bg-[#0D9488]/15 selection:text-[#0F766E]"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
