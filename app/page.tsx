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

export default function Home() {
  return (
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
  );
}
