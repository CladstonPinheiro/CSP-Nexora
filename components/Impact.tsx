'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Zap, TrendingUp, Users, Clock, Database } from 'lucide-react';

const Impact = () => {
  const stats = [
    { text: 'Redução significativa do tempo gasto em tarefas repetitivas.', icon: <Zap className="text-orange-400" /> },
    { text: 'Atendimento disponível 24 horas', icon: <Clock className="text-green-400" /> },
    { text: 'Processos integrados', icon: <TrendingUp className="text-cyan-400" /> },
    { text: 'Redução do retrabalho', icon: <Users className="text-purple-400" /> },
    { text: 'Informações centralizadas', icon: <Database className="text-blue-400" /> },
  ];

  return (
    <section id="impacto" className="py-32 bg-[#050505] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-[4rem] p-12 md:p-24 relative overflow-hidden">
           {/* Background Decoration */}
           <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 transform rotate-45 translate-x-1/3"></div>
           
           <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8 flex flex-col items-center lg:items-start text-center lg:text-left">
                 <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black font-outfit text-white tracking-tighter leading-none text-center lg:text-left">
                    O Impacto da <br /> <span className="italic">Automação Real</span>
                 </h2>
                 <p className="text-white/80 text-sm sm:text-base lg:text-xl max-w-md leading-relaxed text-center lg:text-left">
                    Nossas soluções não apenas automatizam, elas elevam o potencial produtivo 
                    da sua empresa a níveis sem precedentes na era da IA.
                 </p>
                 <a 
                   href="#diagnostico" 
                   className="bg-white text-black w-full sm:w-auto px-6 py-3.5 sm:px-10 sm:py-5 rounded-full text-xs sm:text-lg font-black hover:scale-105 transition-all shadow-2xl text-center"
                 >
                    Solicitar Estudo de Caso
                 </a>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full">
                 {stats.map((stat, idx) => (
                    <motion.div
                       key={idx}
                       initial={{ scale: 0.9 }}
                       whileInView={{ opacity: 1, scale: 1 }}
                       viewport={{ once: true }}
                       className={`bg-white/10 backdrop-blur-xl border border-white/10 p-5 sm:p-8 rounded-3xl flex flex-col items-center sm:items-start text-center sm:text-left ${idx === 4 ? 'col-span-2' : ''}`}
                    >
                       <div className="mb-3 sm:mb-4">{stat.icon}</div>
                       <p className="text-sm sm:text-lg font-bold text-white leading-snug">{stat.text}</p>
                    </motion.div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </section>
  );
};

export default Impact;
