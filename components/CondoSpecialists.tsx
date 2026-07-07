'use client';

import React from 'react';
import { motion } from 'motion/react';

const CondoSpecialists = () => {
  return (
    <section className="py-24 bg-[#050505]">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black font-outfit tracking-tighter leading-[1.1] sm:leading-[0.95] text-white mb-6">
            Especialistas em <span className="text-cyan-400 italic">Administradoras de Condomínios e Imobiliárias</span>
          </h2>

          <p className="text-sm sm:text-base lg:text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
            Desenvolvemos ecossistemas inteligentes para empresas que administram condomínios e imóveis. Nossa tecnologia conecta atendimento, financeiro, cobrança, contratos, WhatsApp e processos internos em uma operação integrada, preparada para crescer junto com o seu negócio.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CondoSpecialists;
