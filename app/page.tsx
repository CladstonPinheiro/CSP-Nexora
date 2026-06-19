import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Services from '@/components/Services';
import Differentials from '@/components/Differentials';
import Process from '@/components/Process';
import Impact from '@/components/Impact';
import CTAFinal from '@/components/CTAFinal';
import Diagnostic from '@/components/Diagnostic';
import Footer from '@/components/Footer';

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://cspnexora.com.br/#organization',
      name: 'CSP Nexora',
      url: 'https://cspnexora.com.br',
      logo: {
        '@type': 'ImageObject',
        url: 'https://cspnexora.com.br/logo.png',
      },
      sameAs: [
        'https://instagram.com/cspnexora',
        'https://wa.me/5561920043098',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+55-61-92004-3098',
        contactType: 'customer service',
        availableLanguage: 'Portuguese',
        areaServed: 'BR',
      },
    },
    {
      '@type': 'LocalBusiness',
      '@id': 'https://cspnexora.com.br/#localbusiness',
      name: 'CSP Nexora',
      description:
        'Empresa especializada em automação com Inteligência Artificial, agentes inteligentes, chatbots avançados e integração de sistemas para empresas em Brasília e todo o Brasil.',
      url: 'https://cspnexora.com.br',
      telephone: '+55-61-92004-3098',
      priceRange: '$$',
      image: 'https://cspnexora.com.br/og-image.png',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Brasília',
        addressRegion: 'DF',
        addressCountry: 'BR',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: -15.7801,
        longitude: -47.9292,
      },
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
      sameAs: [
        'https://instagram.com/cspnexora',
        'https://wa.me/5561920043098',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://cspnexora.com.br/#website',
      url: 'https://cspnexora.com.br',
      name: 'CSP Nexora',
      description:
        'Automação com IA, Agentes Inteligentes e Transformação Digital para empresas.',
      publisher: {
        '@id': 'https://cspnexora.com.br/#organization',
      },
      inLanguage: 'pt-BR',
    },
    {
      '@type': 'WebPage',
      '@id': 'https://cspnexora.com.br/#webpage',
      url: 'https://cspnexora.com.br',
      name: 'CSP Nexora | Automação com IA e Agentes Inteligentes',
      isPartOf: { '@id': 'https://cspnexora.com.br/#website' },
      about: { '@id': 'https://cspnexora.com.br/#organization' },
      description:
        'Transforme sua empresa com IA, automação de processos e agentes inteligentes. Tecnologia premium para negócios em Brasília e todo o Brasil.',
      inLanguage: 'pt-BR',
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-[#050505] selection:bg-cyan-500 selection:text-white">
        <Navbar />
        <Hero />
        <About />
        <Services />
        <Differentials />
        <Process />
        <Impact />
        <CTAFinal />
        <Diagnostic />
        <Footer />
      </main>
    </>
  );
}
