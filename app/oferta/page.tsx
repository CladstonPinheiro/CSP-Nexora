import type { Metadata } from "next";
import Image from "next/image";
import NavbarOferta from "@/components/oferta/NavbarOferta";
import HeroOferta from "@/components/oferta/HeroOferta";
import { ProblemaSection, BeneficiosSection, GoogleComparativoSection } from "@/components/oferta/BeneficiosOferta";
import { EntregaSection, ProcessoSection, PlanosSection } from "@/components/oferta/PlanosOferta";
import { FAQSection, ContatoSection } from "@/components/oferta/FAQContato";

export const metadata: Metadata = {
  title: "Site Profissional em 24h | CSP Nexora",
  description: "Seu negócio no Google Meu Negócio merece um site profissional. Entregamos em 24h com domínio .com.br, e-mails profissionais e hospedagem inclusa por 1 ano.",
  openGraph: {
    title: "Site Profissional em 24h | CSP Nexora",
    description: "Domínio .com.br + hospedagem + e-mails profissionais. A partir de R$ 500.",
    url: "https://cspnexora.com.br/oferta",
    siteName: "CSP Nexora",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Site Profissional em 24h | CSP Nexora",
    description: "Domínio .com.br + hospedagem + e-mails profissionais. A partir de R$ 500.",
  },
  robots: { index: true, follow: true },
};

export default function OfertaPage() {
  return (
    <>
      <NavbarOferta />
      <main className="min-h-screen bg-[#050505] pt-[72px]">
        <HeroOferta />
        <ProblemaSection />
        <BeneficiosSection />
        <GoogleComparativoSection />
        <EntregaSection />
        <ProcessoSection />
        <PlanosSection />
        <FAQSection />
        <ContatoSection />
        <footer className="border-t border-white/[0.05] px-6 py-10 text-center">
          <div className="flex justify-center mb-4">
            <Image src="/logo.png" alt="CSP Nexora" width={207} height={113} className="h-auto w-[100px] object-contain" />
          </div>
          <p className="mt-2 text-xs text-white/30">Soluções digitais para negócios que querem crescer.</p>
          <p className="mt-1 text-xs text-white/30">📧 contato@cspnexora.com.br · 📱 (61) 98420-2578</p>
          <p className="mt-4 text-xs text-white/20">© {new Date().getFullYear()} CSP Nexora. Todos os direitos reservados.</p>
        </footer>
      </main>
    </>
  );
}
