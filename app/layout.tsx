import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

const BASE_URL = 'https://cspnexora.com.br';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'CSP Nexora | Automação com IA e Agentes Inteligentes',
    template: '%s | CSP Nexora',
  },
  description:
    'Transforme sua empresa com IA, automação de processos e agentes inteligentes. CSP Nexora — tecnologia premium para negócios em Brasília e todo o Brasil.',
  keywords: [
    'automação com IA',
    'agentes inteligentes',
    'automação de processos',
    'inteligência artificial empresarial',
    'chatbots avançados',
    'integração de sistemas',
    'automação WhatsApp',
    'transformação digital',
    'CSP Nexora',
    'Brasília',
    'BPM',
  ],
  authors: [{ name: 'CSP Nexora', url: BASE_URL }],
  creator: 'CSP Nexora',
  publisher: 'CSP Nexora',
  alternates: {
    canonical: BASE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: BASE_URL,
    siteName: 'CSP Nexora',
    title: 'CSP Nexora | Automação com IA e Agentes Inteligentes',
    description:
      'Transforme sua empresa com IA, automação de processos e agentes inteligentes. CSP Nexora — tecnologia premium para negócios em Brasília e todo o Brasil.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CSP Nexora — Automação com IA e Agentes Inteligentes',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CSP Nexora | Automação com IA e Agentes Inteligentes',
    description:
      'Transforme sua empresa com IA, automação de processos e agentes inteligentes. Tecnologia premium para negócios em Brasília e todo o Brasil.',
    images: ['/og-image.png'],
    creator: '@cspnexora',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${outfit.variable}`}>
      <body suppressHydrationWarning className="antialiased bg-[#050505] text-[#FFFFFF] selection:bg-cyan-500/30">
        {children}
      </body>
    </html>
  );
}
