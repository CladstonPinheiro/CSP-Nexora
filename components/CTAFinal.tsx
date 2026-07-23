'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, MessageSquare } from 'lucide-react';
import { useWhatsappSiteLink } from '@/lib/whatsapp';

const CTAFinal = () => {
  const whatsappLink = useWhatsappSiteLink();
  return (
    <section className="py-32 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center space-y-12">
           <motion.div
             initial={{ scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="relative inline-block"
           >
              <div className="absolute -inset-10 bg-cyan-500/10 rounded-full blur-[80px]"></div>
              <h2 className="text-3xl sm:text-5xl lg:text-8xl font-black font-outfit tracking-tighter text-white relative leading-[1.1] sm:leading-[0.95]">
                 Sua empresa está preparada <br /> para crescer sem aumentar <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">a complexidade da operação?</span>
              </h2>
           </motion.div>

           <p className="text-sm sm:text-lg lg:text-xl text-gray-500 max-w-2xl mx-auto italic">
             Descubra como um ecossistema inteligente pode reduzir retrabalho, organizar processos e aumentar a produtividade da sua equipe.
           </p>

           <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 items-center w-full max-w-md sm:max-w-none mx-auto">
              <a 
                href="#diagnostico"
                className="group relative w-full sm:w-auto px-6 py-3.5 sm:px-10 sm:py-5 rounded-full font-black uppercase tracking-widest text-xs sm:text-lg overflow-hidden bg-white text-black transition-all hover:scale-105 shadow-23xl flex items-center justify-center text-center"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Solicitar Projeto <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </a>
              
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group w-full sm:w-auto px-6 py-3.5 sm:px-10 sm:py-5 rounded-full font-black uppercase tracking-widest text-xs sm:text-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-3"
              >
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" /> WhatsApp
              </a>
           </div>
        </div>
      </div>
    </section>
  );
};

export default CTAFinal;
