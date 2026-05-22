import type {Metadata} from 'next';
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

export const metadata: Metadata = {
  title: 'CSP Nexora | Automação e Inteligência Artificial',
  description: 'Criamos ecossistemas de automação com Inteligência Artificial para aumentar produtividade e reduzir custos.',
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
