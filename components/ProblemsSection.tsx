'use client';

import React from 'react';
import { motion } from 'motion/react';
import { CheckSquare } from 'lucide-react';

const problems = [
  { title: 'Retrabalho', color: 'from-emerald-400 to-teal-500' },
  { title: 'Cobranças manuais', color: 'from-cyan-400 to-blue-500' },
  { title: 'Informações espalhadas', color: 'from-blue-500 to-purple-600' },
  { title: 'Equipe sobrecarregada', color: 'from-purple-600 to-pink-500' },
  { title: 'Atendimento lento', color: 'from-orange-500 to-red-500' },
  { title: 'Processos sem integração', color: 'from-green-400 to-cyan-500' },
  { title: 'Falta de indicadores', color: 'from-cyan-500 to-indigo-500' },
  { title: 'Dificuldade para crescer', color: 'from-indigo-500 to-violet-600' },
];

const ProblemsSection = () => {
  return (
    <section id="problemas" className="py-32 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12 sm:mb-24">
          <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black font-outfit tracking-tighter text-white">
            Você enfrenta algum <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">destes problemas?</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="absolute -inset-2 bg-gradient-to-r opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500" style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}></div>

              <div className="relative h-full bg-[#111] border border-white/5 rounded-3xl p-6 sm:p-8 hover:bg-[#161616] transition-all duration-500 hover:-translate-y-2 flex flex-col items-center md:items-start text-center md:text-left">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${problem.color} p-3.5 sm:p-4 text-white mb-6 sm:mb-8 shadow-xl mx-auto md:mx-0 flex items-center justify-center`}>
                  <CheckSquare className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {problem.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemsSection;
