'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Bot, Zap, Shield, ChevronRight } from 'lucide-react';

const Hero = () => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden bg-[#050505]">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4"></div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7 space-y-8 flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="flex flex-col items-center lg:items-start">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] mb-6 text-center">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                Automação Inteligente de Próxima Geração
              </div>
              
              <h1 className="font-outfit text-4xl sm:text-6xl lg:text-8xl font-black tracking-tighter text-white mb-6 leading-[1.05] lg:leading-[0.95] text-center lg:text-left">
                Automação <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                  Inteligente
                </span> <br />
                para Empresas
              </h1>
              
              <p className="text-sm sm:text-base lg:text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed text-center lg:text-left mx-auto lg:mx-0">
                Criamos ecossistemas de automação com Inteligência Artificial para 
                aumentar produtividade, reduzir custos e acelerar resultados.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center w-full sm:w-auto">
                <a 
                  href="#diagnostico"
                  className="group relative w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 rounded-full font-bold uppercase tracking-widest text-xs sm:text-sm overflow-hidden bg-white text-black transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    Solicitar Diagnóstico <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </a>
                
                <a 
                  href="https://wa.me/5561920043098"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 rounded-full font-bold uppercase tracking-widest text-xs sm:text-sm border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-3 text-white"
                >
                  Falar no WhatsApp
                </a>
              </div>

              {/* Trust indicators */}
              <div className="pt-12 flex flex-wrap justify-center lg:justify-start gap-6 sm:gap-8 opacity-40 grayscale group hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                <div className="flex items-center gap-2 font-black text-lg sm:text-xl tracking-tighter">OPENAI</div>
                <div className="flex items-center gap-2 font-black text-lg sm:text-xl tracking-tighter">STRIPE</div>
                <div className="flex items-center gap-2 font-black text-lg sm:text-xl tracking-tighter">VERCEL</div>
                <div className="flex items-center gap-2 font-black text-lg sm:text-xl tracking-tighter">NOTION</div>
              </div>
            </div>
          </div>

          <motion.div
            className="lg:col-span-5 relative"
            initial={{ opacity: 1, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Visual AI Orb / Dashboard Mockup */}
            <div className="relative group">
              <div className="absolute -inset-10 bg-cyan-500/20 rounded-full blur-[100px] group-hover:bg-blue-500/30 transition-all duration-1000"></div>
              
              <div className="relative aspect-square rounded-[3rem] bg-[#111] border border-white/10 overflow-hidden shadow-3xl p-8 flex items-center justify-center">
                {/* Simulated AI Network Visualization */}
                <div className="absolute inset-0 opacity-20">
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] animate-spin-slow">
                      <div className="absolute inset-0 border border-cyan-500/20 rounded-full"></div>
                      <div className="absolute top-0 left-1/2 w-4 h-4 bg-cyan-500 rounded-full -translate-x-1/2 -translate-y-1/2 blur-sm"></div>
                   </div>
                </div>

                <motion.div 
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.05, 0.95, 1]
                  }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                  className="w-48 h-48 bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 rounded-[2.5rem] p-px"
                >
                  <div className="w-full h-full bg-[#0A0A0A] rounded-[2.4rem] flex items-center justify-center overflow-hidden relative group">
                    <Bot className="text-white w-16 h-16 blur-[1px]" />
                  </div>
                </motion.div>

                {/* Floating UI Elements */}
                <div className="absolute top-1/2 right-4 translate-x-1/4 -translate-y-12 bg-white/10 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <Zap className="text-green-400 w-4 h-4" />
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Performance</p>
                      <p className="text-lg font-black">+95%</p>
                   </div>
                </div>

                <div className="absolute bottom-8 left-4 -translate-x-1/4 bg-white/10 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                      <Shield className="text-cyan-400 w-4 h-4" />
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Escalabilidade</p>
                      <p className="text-lg font-black">Ready</p>
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
