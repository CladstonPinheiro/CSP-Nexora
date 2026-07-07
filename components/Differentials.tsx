'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Wrench, TrendingUp, HeartHandshake, Compass, RefreshCw, Unlock, BarChart3 } from 'lucide-react';

const Differentials = () => {
  const diffs = [
    { title: 'Ecossistemas personalizados', description: 'Projetados conforme os processos da sua empresa, sem soluções genéricas.', icon: <Sparkles className="text-teal-400" /> },
    { title: 'Desenvolvemos ferramentas próprias', description: 'Desenvolvidas para atender exatamente às necessidades da sua operação.', icon: <Wrench className="text-green-400" /> },
    { title: 'Escalabilidade', description: 'Sua operação cresce sem precisar reconstruir processos.', icon: <TrendingUp className="text-cyan-400" /> },
    { title: 'Acompanhamento contínuo', description: 'Evoluímos sua solução conforme o crescimento da sua empresa.', icon: <HeartHandshake className="text-purple-400" /> },
    { title: 'Implantação consultiva', description: 'Implantação planejada para garantir segurança e eficiência.', icon: <Compass className="text-orange-400" /> },
    { title: 'Evolução permanente', description: 'Seu ecossistema evolui junto com as necessidades do negócio.', icon: <RefreshCw className="text-red-400" /> },
    { title: 'Sem soluções engessadas', description: 'Soluções flexíveis, adaptadas à realidade da sua operação.', icon: <Unlock className="text-indigo-400" /> },
    { title: 'Redução de Custos', description: 'Automatize processos e reduza desperdícios operacionais.', icon: <BarChart3 className="text-blue-400" /> },
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
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mt-2 group-hover:text-gray-400 transition-colors">{diff.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Differentials;
