'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Zap, Globe, BarChart3, Database, Workflow, Cpu, Rocket, SearchCheck, TrendingUp } from 'lucide-react';

const Differentials = () => {
  const diffs = [
    { title: 'Alta Performance', icon: <Zap className="text-orange-400" /> },
    { title: 'Escalabilidade', icon: <TrendingUp className="text-cyan-400" /> },
    { title: 'Atendimento Inteligente', icon: <ShieldCheck className="text-green-400" /> },
    { title: 'Integrações Avançadas', icon: <Cpu className="text-purple-400" /> },
    { title: 'Redução de Custos', icon: <BarChart3 className="text-blue-400" /> },
    { title: 'Automação 24/7', icon: <Workflow className="text-red-400" /> },
    { title: 'Inteligência Operacional', icon: <SearchCheck className="text-indigo-400" /> },
    { title: 'Crescimento Acelerado', icon: <Rocket className="text-yellow-400" /> },
  ];

  return (
    <section id="diferenciais" className="py-32 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12 sm:mb-24">
           <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black font-outfit tracking-tighter text-white">
             Por que escolher a <span className="italic text-cyan-400">CSP Nexora?</span>
           </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {diffs.map((diff, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center group hover:bg-white/10 transition-all hover:border-white/20"
            >
              <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform">
                {React.cloneElement(diff.icon as React.ReactElement<any>, { className: "w-8 h-8" })}
              </div>
              <h4 className="text-white font-bold tracking-tight">{diff.title}</h4>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Differentials;
