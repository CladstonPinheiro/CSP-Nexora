'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Diagnostic from '@/components/Diagnostic';
import { motion } from 'motion/react';
import { Bot, Cpu, MessageSquare, Workflow, Zap, ArrowLeft, ArrowRight, MessageCircle, Shield, Headset, ClipboardList, LayoutDashboard } from 'lucide-react';
import { WHATSAPP_SITE_LINK } from '@/lib/whatsapp';

const serviceDetails = [
  {
    id: 'atendimento',
    title: 'Atendimento',
    subtitle: 'Suporte ágil e humanizado em todos os pontos de contato com o cliente.',
    description: 'Estruturamos processos de atendimento organizados, com fluxos claros, tempos de resposta reduzidos e alinhamento entre equipe e ferramentas. A CSP Nexora ajuda sua empresa a oferecer uma experiência de atendimento consistente e profissional, do primeiro contato ao pós-venda.',
    icon: <Headset className="w-12 h-12" />,
    color: 'from-emerald-400 to-teal-500'
  },
  {
    id: 'ia-atendimento',
    title: 'IA para Atendimento',
    subtitle: 'Redução drástica no tempo de resposta com precisão absoluta.',
    description: 'Implemente soluções de Inteligência Artificial personalizadas para automatizar, qualificar e otimizar o atendimento ao cliente da sua empresa. A CSP Nexora desenvolve sistemas de atendimento que compreendem intenções, respondem a dúvidas frequentemente feitas de forma instantânea e humanizada e fazem a triagem inteligente de leads, operando 24/7 sem interrupções.',
    icon: <Shield className="w-12 h-12" />,
    color: 'from-cyan-500 to-indigo-500'
  },
  {
    id: 'chatbots-avancados',
    title: 'Chatbots Avançados',
    subtitle: 'Atendimento automatizado que gera resultados reais.',
    description: 'Ofereça atendimento rápido, inteligente e disponível 24 horas por dia. Os chatbots desenvolvidos pela CSP Nexora utilizam IA para criar conversas naturais, melhorar a experiência do cliente e aumentar a geração de oportunidades para sua empresa.',
    icon: <MessageSquare className="w-12 h-12" />,
    color: 'from-purple-600 to-pink-500'
  },
  {
    id: 'automacao-whatsapp',
    title: 'Automação de WhatsApp',
    subtitle: 'Mais agilidade no atendimento e mais oportunidades de negócio.',
    description: 'Automatize o principal canal de comunicação da sua empresa com fluxos inteligentes, respostas automáticas, captação de leads e atendimento escalável. Transforme o WhatsApp em uma ferramenta estratégica de vendas, suporte e relacionamento.',
    icon: <Zap className="w-12 h-12" />,
    color: 'from-green-400 to-cyan-500'
  },
  {
    id: 'gestao',
    title: 'Gestão',
    subtitle: 'Mais controle e clareza sobre a operação do seu negócio.',
    description: 'Desenvolvemos soluções que organizam processos, centralizam informações e dão visibilidade real sobre a operação. Com a CSP Nexora, sua empresa ganha controle sobre tarefas, indicadores e fluxos de trabalho, tomando decisões mais rápidas e baseadas em dados.',
    icon: <ClipboardList className="w-12 h-12" />,
    color: 'from-indigo-500 to-violet-600'
  },
  {
    id: 'integracao-sistemas',
    title: 'Integração de Sistemas',
    subtitle: 'Tecnologia conectada para empresas mais produtivas.',
    description: 'Conectamos plataformas, ferramentas e processos para criar um ecossistema integrado e eficiente. A CSP Nexora elimina retrabalho, melhora o fluxo de informações e garante que seus sistemas operem de forma sincronizada e inteligente.',
    icon: <Workflow className="w-12 h-12" />,
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    subtitle: 'Indicadores em tempo real para decisões mais rápidas e precisas.',
    description: 'Criamos painéis personalizados que reúnem os principais indicadores do seu negócio em um só lugar, com visual intuitivo e dados atualizados em tempo real. A CSP Nexora transforma informação dispersa em decisão estratégica.',
    icon: <LayoutDashboard className="w-12 h-12" />,
    color: 'from-amber-400 to-orange-500'
  },
  {
    id: 'automacao-ia',
    title: 'Automação com IA',
    subtitle: 'Sua empresa trabalhando de forma inteligente, todos os dias.',
    description: 'Transforme tarefas repetitivas em processos inteligentes com automação baseada em Inteligência Artificial. A CSP Nexora desenvolve fluxos automatizados que reduzem falhas, aumentam a produtividade e permitem que sua empresa opere com mais velocidade e eficiência. Automatize atendimentos, processos internos e rotinas operacionais de forma estratégica e escalável.',
    icon: <Bot className="w-12 h-12" />,
    color: 'from-cyan-400 to-blue-500'
  },
  {
    id: 'agentes-inteligentes',
    title: 'Agentes Inteligentes',
    subtitle: 'Mais eficiência, menos operação manual.',
    description: 'Implemente agentes de IA capazes de executar tarefas, interpretar informações e interagir de forma autônoma com clientes e equipes. Nossos agentes inteligentes ajudam empresas a reduzir tempo operacional, otimizar processos e ampliar a capacidade de atendimento sem aumentar a equipe.',
    icon: <Cpu className="w-12 h-12" />,
    color: 'from-blue-500 to-purple-600'
  }
];

export default function ServicesPage() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if ('scrollRestoration' in window.history) {
          window.history.scrollRestoration = 'manual';
        }
      } catch (err) {
        console.error('Failed to set scrollRestoration', err);
      }

      if (!window.location.hash) {
        window.scrollTo(0, 0);
        
        const timer1 = setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'auto' });
        }, 50);
        
        const timer2 = setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'auto' });
        }, 200);

        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
        };
      }
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#050505] selection:bg-cyan-500 selection:text-white">
      <Navbar />

      {/* Hero Header */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05),transparent_60%)]"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar para o início
          </Link>
          <h1 className="font-outfit text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-white mb-6 leading-none">
            Nossos <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Serviços</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Descubra como as soluções inteligentes da CSP Nexora podem revolucionar a operação da sua empresa.
          </p>
        </div>
      </section>

      {/* Services List Detail */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6 space-y-24 sm:space-y-32">
          {serviceDetails.map((service, idx) => (
            <motion.div
              key={service.id}
              id={service.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className={`flex flex-col gap-12 items-center ${
                idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              }`}
            >
              {/* Graphic/Icon space */}
              <div className="w-full lg:w-2/5 flex justify-center">
                <div className="relative group w-64 h-64 flex items-center justify-center">
                  <div className={`absolute -inset-4 bg-gradient-to-br ${service.color} rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`}></div>
                  <div className="relative w-48 h-48 rounded-[3rem] bg-[#111] border border-white/5 flex items-center justify-center text-white shadow-2xl">
                    <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${service.color} p-5 flex items-center justify-center text-white`}>
                      {service.icon}
                    </div>
                  </div>
                </div>
              </div>

              {/* Text content details */}
              <div className="w-full lg:w-3/5 space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start">
                <h2 className="text-3xl sm:text-4xl font-black font-outfit text-white tracking-tight">
                  {service.title}
                </h2>
                <div className={`text-sm font-semibold tracking-wider text-transparent bg-clip-text bg-gradient-to-r ${service.color} uppercase`}>
                  {service.subtitle}
                </div>
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed text-justify sm:text-center lg:text-left">
                  {service.description}
                </p>

                 <div className="pt-4 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <a 
                    href="#diagnostico"
                    onClick={(e) => {
                      e.preventDefault();
                      const element = document.getElementById('diagnostico');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="group px-6 py-3 rounded-full font-bold uppercase tracking-widest text-xs overflow-hidden bg-white text-black transition-all hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    FALE COM ESPECIALISTA <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a
                    href={WHATSAPP_SITE_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group px-6 py-3 rounded-full font-bold uppercase tracking-widest text-xs border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-white"
                  >
                    <MessageCircle className="w-4 h-4 text-cyan-400" /> WHATSAPP
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <Diagnostic />
      <Footer />
    </main>
  );
}
