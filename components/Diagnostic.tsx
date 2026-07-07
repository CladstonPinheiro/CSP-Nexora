'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const howItWorksSteps = [
  {
    title: 'Diagnóstico da Operação',
    description: 'Entendemos como sua empresa funciona hoje: processos, gargalos e oportunidades.'
  },
  {
    title: 'Apresentação da Solução',
    description: 'Mostramos, com uma demonstração real, como o ecossistema CSP Nexora resolveria os problemas identificados.'
  },
  {
    title: 'Proposta Personalizada',
    description: 'Você recebe uma proposta sob medida, com investimento e prazo claros para implantação.'
  }
];

const DiagnosticForm = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    empresa: '',
    niche: '',
    telefone: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  const { executeRecaptcha } = useGoogleReCaptcha();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lock = localStorage.getItem('cspnexora_diagnostic_submitted');
      if (lock === 'true') {
        const timer = setTimeout(() => {
          setIsSubmitted(true);
          setAlreadySubmitted(true);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Basic phone formatting for BR: (XX) XXXXX-XXXX
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }

    setFormData((prev) => ({ ...prev, telefone: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.nome || !formData.email || !formData.empresa || !formData.niche || !formData.telefone) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }

    if (!executeRecaptcha) {
      setErrorMessage('Verificação de segurança não carregada. Recarregue a página e tente novamente.');
      return;
    }

    setIsLoading(true);

    try {
      const recaptchaToken = await executeRecaptcha('submit_lead');

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, recaptchaToken }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 512) {
          throw new Error(
            'As credenciais do Supabase não estão configuradas. Por favor, acesse a aba "Segredos" (Secrets) no painel do Google AI Studio à direita, adicione as variáveis URL_SUPABASE e SUPABASE_SERVICE_ROLE_KEY, e clique no botão "Aplicar alterações".'
          );
        } else if (result.code === '42P01' || (result.details && result.details.includes('relation "leads" does not exist'))) {
          throw new Error(
            'A tabela "leads" não existe no seu banco de dados Supabase. Crie uma tabela chamada "leads" com as colunas: nome (text), email (text), empresa (text) e telefone (text).'
          );
        } else {
          throw new Error(result.error || 'Erro ao salvar no banco de dados.');
        }
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('cspnexora_diagnostic_submitted', 'true');
      }
      setIsSubmitted(true);
      setAlreadySubmitted(false);
      setFormData({ nome: '', email: '', empresa: '', niche: '', telefone: '' });
    } catch (error: any) {
      setErrorMessage(error.message || 'Ocorreu um erro ao enviar seus dados. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="diagnostico" className="relative py-24 md:py-32 bg-[#02183b] overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[80px] -translate-y-1/2 -translate-x-1/3"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-blue-500/15 rounded-full blur-[80px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left Column - Content */}
          <div className="lg:col-span-6 space-y-6 flex flex-col items-center lg:items-start text-center lg:text-left">
            <h2 className="font-outfit text-3xl sm:text-5xl lg:text-7xl font-black tracking-tighter text-white leading-[1.1] sm:leading-[1.05] text-center lg:text-left">
              Vamos construir <br />
              o futuro da <br />
              <span className="text-[#ff9100]">
                sua operação digital.
              </span>
            </h2>

            <p className="text-gray-300 text-sm sm:text-base lg:text-xl font-normal leading-relaxed max-w-xl text-center lg:text-left mx-auto lg:mx-0">
              Agende uma conversa com nossos especialistas para entender sua operação. É o primeiro passo de um processo personalizado, que termina com uma proposta sob medida para o seu negócio.
            </p>

            <div className="space-y-5 w-full pt-2">
              {howItWorksSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-4 text-left">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#ff9100] font-black text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm sm:text-base mb-1">{step.title}</h4>
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - White Form Card */}
          <div className="lg:col-span-6 w-full max-w-xl mx-auto lg:mx-0">
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-white/10 relative text-black">

              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <motion.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    exit={{ opacity: 0, y: -15 }}
                    className="space-y-6"
                  >

                    {/* Grid Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                      {/* Name field */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 block" htmlFor="diag-nome">
                          Nome*
                        </label>
                        <input
                          id="diag-nome"
                          type="text"
                          name="nome"
                          value={formData.nome}
                          onChange={handleInputChange}
                          className="w-full bg-[#f8fafc] border border-slate-200 text-black px-5 py-4 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder-gray-400"
                          placeholder="Seu nome completo"
                          required
                        />
                      </div>

                      {/* Corporate Email field */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 block" htmlFor="diag-email">
                          Email corporativo*
                        </label>
                        <input
                          id="diag-email"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full bg-[#f8fafc] border border-slate-200 text-black px-5 py-4 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder-gray-400"
                          placeholder="seuemail@empresa.com"
                          required
                        />
                      </div>

                      {/* Company field */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 block" htmlFor="diag-empresa">
                          Empresa*
                        </label>
                        <input
                          id="diag-empresa"
                          type="text"
                          name="empresa"
                          value={formData.empresa}
                          onChange={handleInputChange}
                          className="w-full bg-[#f8fafc] border border-slate-200 text-black px-5 py-4 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder-gray-400"
                          placeholder="Nome da sua empresa"
                          required
                        />
                      </div>

                      {/* Niche field */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 block" htmlFor="diag-niche">
                          Nicho*
                        </label>
                        <div className="relative">
                          <select
                            id="diag-niche"
                            name="niche"
                            value={formData.niche}
                            onChange={handleInputChange}
                            required
                            className="w-full appearance-none bg-[#f8fafc] border border-slate-200 text-black px-5 py-4 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all cursor-pointer"
                          >
                            <option value="">Selecione o nicho...</option>
                            <option value="administradora_condominios">Administradora de Condomínios</option>
                            <option value="administradora_imoveis">Imobiliária - Adm de Imóveis</option>
                            <option value="outro">Outros</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Phone field — spans full width since grid has odd count */}
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-gray-700 block" htmlFor="diag-telefone">
                          Telefone*
                        </label>
                        <div className="flex items-center bg-[#f8fafc] border border-slate-200 rounded-full px-4 focus-within:ring-2 focus-within:ring-cyan-500 transition-all">
                          <div className="flex items-center gap-1.5 pr-3 border-r border-slate-200 text-black cursor-pointer select-none">
                            <span className="text-base">🇧🇷</span>
                            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                          </div>
                          <input
                            id="diag-telefone"
                            type="tel"
                            name="telefone"
                            value={formData.telefone}
                            onChange={handlePhoneChange}
                            className="w-full bg-transparent border-0 text-black pl-3 py-4 text-sm font-medium focus:outline-none placeholder-gray-400"
                            placeholder="(61) 99999-9999"
                            required
                          />
                        </div>
                      </div>

                    </div>

                    {/* Disclaimer text */}
                    <p className="text-[10px] text-gray-500 leading-normal">
                      Este site é protegido por reCAPTCHA e a{' '}
                      <a
                        href="https://policies.google.com/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-600 font-semibold hover:underline"
                      >
                        Política de Privacidade
                      </a>{' '}
                      e os{' '}
                      <a
                        href="https://policies.google.com/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-600 font-semibold hover:underline"
                      >
                        Termos de Serviço
                      </a>{' '}
                      do Google se aplicam.
                    </p>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4.5 px-8 rounded-full bg-[#ff9100] hover:bg-[#e07f00] text-white font-bold text-sm uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-75 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                        id="diagnostico-submit-btn"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                            <span>Enviando Dados...</span>
                          </>
                        ) : (
                          <span>Receba um diagnóstico gratuito</span>
                        )}
                      </button>
                    </div>

                    {/* Error message */}
                    {errorMessage && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 text-red-600 bg-red-50 p-3.5 rounded-xl text-xs"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMessage}</span>
                      </motion.div>
                    )}

                  </motion.form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-3 space-y-4"
                  >
                    <div className="w-14 h-14 bg-green-100/80 rounded-full flex items-center justify-center mx-auto text-green-500">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-outfit text-xl font-black text-gray-900">
                        {alreadySubmitted ? 'Diagnóstico já solicitado!' : 'Obrigado pelo contato!'}
                      </h3>
                      <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
                        {alreadySubmitted
                          ? 'Você já solicitou o diagnóstico. Nossos especialistas receberam seus dados e estão analisando sua operação.'
                          : 'Nossos especialistas receberam seus dados e entrarão em contato em breve para agendar o primeiro passo da sua jornada: o diagnóstico da sua operação.'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          localStorage.removeItem('cspnexora_diagnostic_submitted');
                        }
                        setIsSubmitted(false);
                        setAlreadySubmitted(false);
                      }}
                      className="px-6 py-2.5 rounded-full border border-slate-200 text-gray-700 text-xs font-semibold hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      {alreadySubmitted ? 'Enviar um novo formulário' : 'Enviar outro formulário'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

const Diagnostic = () => (
  <GoogleReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ''}>
    <DiagnosticForm />
  </GoogleReCaptchaProvider>
);

export default Diagnostic;
