'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Bot, Cpu, Globe, Rocket, ArrowRight } from 'lucide-react';

const About = () => {
  return (
    <section id="sobre" className="py-24 bg-[#050505] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative w-full max-w-lg mx-auto lg:mx-0"
          >
             <div className="absolute -inset-20 bg-cyan-500/10 rounded-full blur-[100px]"></div>
             <div className="relative border border-white/5 bg-white/2 bg-opacity-10 backdrop-blur-2xl rounded-[3rem] p-6 sm:p-12 overflow-hidden h-[400px] sm:h-[600px] flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 w-full h-full">
                   <div className="space-y-4">
                      <div className="h-2/3 bg-white/5 rounded-3xl p-4 sm:p-6 flex flex-col justify-end border border-white/5">
                         <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-2 sm:mb-4">
                            <Bot className="text-cyan-400 w-5 h-5 sm:w-6 sm:h-6" />
                         </div>
                         <p className="text-[9px] sm:text-xs font-bold tracking-widest text-gray-500 uppercase mb-1 sm:mb-2">Agentes Autônomos</p>
                         <h4 className="text-sm sm:text-xl font-bold">Inteligência Operacional</h4>
                      </div>
                      <div className="h-1/3 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-4 sm:p-6 text-white">
                         <Globe className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-4" />
                         <p className="text-sm sm:font-bold">Escala Global</p>
                      </div>
                   </div>
                   <div className="space-y-4 pt-6 sm:pt-12">
                      <div className="h-1/3 bg-white/10 rounded-3xl p-4 sm:p-6 border border-white/5">
                         <Cpu className="text-purple-400 w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-4" />
                         <p className="text-sm sm:font-bold">Integrações</p>
                      </div>
                      <div className="h-2/3 bg-white/5 rounded-3xl p-4 sm:p-6 flex flex-col justify-end border border-white/5 shadow-2xl">
                         <Rocket className="text-orange-400 w-8 h-8 sm:w-10 sm:h-10 mb-2 sm:mb-4" />
                         <p className="font-black text-lg sm:text-2xl">Ready to <br /> Scale</p>
                      </div>
                   </div>
                </div>
             </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8 flex flex-col items-center lg:items-start text-center lg:text-left"
          >
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">
              Nossa Missão
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black font-outfit tracking-tighter leading-[1.1] sm:leading-[0.95] text-center lg:text-left">
              Transformamos Processos <br /> em <span className="text-cyan-400 italic">Ecossistemas Inteligentes</span>
            </h2>
            
            <p className="text-sm sm:text-base lg:text-xl text-gray-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
              A CSP Nexora desenvolve soluções avançadas de automação utilizando 
              Inteligência Artificial, integrações inteligentes e fluxos automatizados 
              para empresas que desejam escalar operações com eficiência.
            </p>
            
            <p className="text-xs sm:text-sm lg:text-lg text-gray-500 max-w-xl mx-auto lg:mx-0">
              Criamos sistemas inteligentes capazes de automatizar atendimento, vendas, 
              processos internos, geração de leads, integrações e operações estratégicas.
            </p>
            
            <div className="pt-4 sm:pt-8 w-full flex justify-center lg:justify-start">
               <button className="group flex items-center justify-center gap-4 text-white font-bold uppercase tracking-widest text-xs sm:text-sm hover:gap-6 transition-all">
                  Conheça nossa tecnologia <ArrowRight className="text-cyan-400 w-4 h-4" />
               </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
