'use client';

import React from 'react';
import { motion } from 'motion/react';

const steps = [
  {
    num: '01',
    title: 'Diagnóstico Estratégico',
    description: 'Analisamos seus processos atuais para identificar gargalos e oportunidades de automação.'
  },
  {
    num: '02',
    title: 'Planejamento da Automação',
    description: 'Desenhamos o ecossistema inteligente sob medida para seus objetivos de negócio.'
  },
  {
    num: '03',
    title: 'Desenvolvimento Inteligente',
    description: 'Nossa equipe de especialistas constrói as integrações e treina os agentes de IA.'
  },
  {
    num: '04',
    title: 'Implementação e Escala',
    description: 'Colocamos os sistemas em operação e monitoramos o crescimento contínuo.'
  }
];

const Process = () => {
  return (
    <section id="processo" className="py-32 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12 sm:mb-24">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 sm:mb-8">
              Como Funciona
           </div>
           <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black font-outfit tracking-tighter text-white">
             Sua Jornada para a <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Eficiência Total</span>
           </h2>
        </div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-12 left-0 w-full h-px bg-gradient-to-r from-cyan-500/0 via-cyan-500/50 to-cyan-500/0"></div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative space-y-6 group flex flex-col items-center md:items-start text-center md:text-left"
              >
                <div className="relative z-10 w-24 h-24 rounded-[2rem] bg-[#111] border border-white/10 flex items-center justify-center text-cyan-400 font-black text-4xl shadow-3xl group-hover:bg-cyan-500 group-hover:text-black transition-all duration-500 mx-auto md:mx-0">
                  {step.num}
                  {/* Floating glow for active step */}
                  <div className="absolute -inset-4 bg-cyan-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xl sm:text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors text-center md:text-left">{step.title}</h4>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors text-center md:text-left">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;
