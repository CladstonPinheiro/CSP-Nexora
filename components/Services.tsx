'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Bot, Cpu, MessageSquare, Workflow, Zap, BarChart3, Cloud, Shield, Database, Users } from 'lucide-react';

const services = [
  {
    id: 'ferramentas-proprias',
    title: 'Ferramentas Próprias e Personalizadas',
    description: 'Desenvolvemos soluções exclusivas para o seu negócio — com as informações que realmente importam para a sua operação, integradas diretamente ao seu ecossistema.',
    icon: <Database className="w-8 h-8" />,
    color: 'from-emerald-400 to-teal-500'
  },
  {
    id: 'automacao-ia',
    title: 'Automação com IA',
    description: 'Fluxos de trabalho inteligentes que aprendem e se adaptam.',
    icon: <Bot className="w-8 h-8" />,
    color: 'from-cyan-400 to-blue-500'
  },
  {
    id: 'agentes-inteligentes',
    title: 'Agentes Inteligentes',
    description: 'Trabalhadores digitais autônomos para tarefas complexas.',
    icon: <Cpu className="w-8 h-8" />,
    color: 'from-blue-500 to-purple-600'
  },
  {
    id: 'chatbots-avancados',
    title: 'Chatbots Avançados',
    description: 'Interação natural com clientes 24/7 de forma personalizada.',
    icon: <MessageSquare className="w-8 h-8" />,
    color: 'from-purple-600 to-pink-500'
  },
  {
    id: 'integracao-sistemas',
    title: 'Integração de Sistemas',
    description: 'Conectamos todo o seu stack tecnológico em um ecossistema.',
    icon: <Workflow className="w-8 h-8" />,
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'automacao-whatsapp',
    title: 'Automação de WhatsApp',
    description: 'Escalabilidade no canal de comunicação mais importante.',
    icon: <Zap className="w-8 h-8" />,
    color: 'from-green-400 to-cyan-500'
  },
  {
    id: 'ia-atendimento',
    title: 'IA para Atendimento',
    description: 'Redução drástica no tempo de resposta com precisão absoluta.',
    icon: <Shield className="w-8 h-8" />,
    color: 'from-cyan-500 to-indigo-500'
  }
];

const Services = () => {
  return (
    <section id="servicos" className="py-32 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12 sm:mb-24">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 sm:mb-8">
              Nossas Soluções
           </div>
           <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black font-outfit tracking-tighter text-white">
             Tecnologia que <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Impulsiona o Futuro</span>
           </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
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
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${service.color} p-3.5 sm:p-4 text-white mb-6 sm:mb-8 shadow-xl mx-auto md:mx-0 flex items-center justify-center`}>
                  {React.cloneElement(service.icon, { className: "w-6 h-6 sm:w-8 sm:h-8" })}
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 group-hover:text-cyan-400 transition-colors">
                  {service.title}
                </h3>
                
                <p className="text-xs sm:text-sm lg:text-base text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors">
                  {service.description}
                </p>

                <a 
                  href={`/servicos#${service.id}`}
                  className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-white/5 flex items-center justify-between max-lg:opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity w-full cursor-pointer hover:text-cyan-400"
                >
                   <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-cyan-500">Saiba mais</span>
                   <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/5 flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                   </div>
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
