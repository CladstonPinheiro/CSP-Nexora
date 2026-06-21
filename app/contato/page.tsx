'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ContatoPage() {
  const [formData, setFormData] = useState({ nome: '', email: '', mensagem: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.nome || !formData.email || !formData.mensagem) {
      setErrorMessage('Por favor, preencha todos os campos.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/contato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Erro ao enviar mensagem.');
      }

      setIsSubmitted(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ocorreu um erro. Tente novamente.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setIsSubmitted(false);
    setFormData({ nome: '', email: '', mensagem: '' });
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      <section className="relative pt-36 pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-cyan-500/10 rounded-full blur-[80px]"></div>
        </div>

        <div className="relative z-10 max-w-lg mx-auto px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-[10px] font-bold uppercase tracking-widest mb-10 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar
          </Link>

          <div className="mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-[0.2em]">
              Fale Conosco
            </div>
            <h1 className="font-outfit text-4xl sm:text-5xl font-black tracking-tighter leading-[1.05]">
              Tem uma dúvida<br />ou quer um papo?
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Sem compromisso. Nossa equipe responde em até 24h.
            </p>
          </div>

          <div className="bg-white p-8 rounded-[2rem] shadow-2xl text-black">
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 block" htmlFor="contato-nome">
                      Nome*
                    </label>
                    <input
                      id="contato-nome"
                      type="text"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      placeholder="Seu nome"
                      required
                      className="w-full bg-[#f8fafc] border border-slate-200 text-black px-5 py-3.5 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 block" htmlFor="contato-email">
                      Email*
                    </label>
                    <input
                      id="contato-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="seuemail@exemplo.com"
                      required
                      className="w-full bg-[#f8fafc] border border-slate-200 text-black px-5 py-3.5 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 block" htmlFor="contato-mensagem">
                      Mensagem*
                    </label>
                    <textarea
                      id="contato-mensagem"
                      name="mensagem"
                      value={formData.mensagem}
                      onChange={handleChange}
                      placeholder="Como podemos ajudar você?"
                      required
                      rows={4}
                      className="w-full bg-[#f8fafc] border border-slate-200 text-black px-5 py-3.5 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder-gray-400 resize-none"
                    />
                  </div>

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

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 px-8 rounded-full bg-black hover:bg-gray-900 text-white font-bold text-sm uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                    ) : (
                      'Enviar Mensagem'
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4 space-y-4"
                >
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-500">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-outfit text-xl font-black text-gray-900">Mensagem enviada!</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Recebemos sua mensagem e responderemos em até 24h no email informado.
                    </p>
                  </div>
                  <button
                    onClick={reset}
                    className="px-6 py-2.5 rounded-full border border-slate-200 text-gray-700 text-xs font-semibold hover:bg-slate-50 transition-all"
                  >
                    Enviar outra mensagem
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="text-center text-gray-600 text-xs mt-8">
            Prefere falar agora?{' '}
            <a
              href="https://wa.me/5561920043098"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
            >
              WhatsApp
            </a>
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
