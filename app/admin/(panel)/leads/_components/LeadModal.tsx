'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createLead, updateLead } from '../actions';
import type { Lead } from './types';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (lead: Lead) => void;
  lead?: Lead;
}

const EMPTY_FORM = {
  empresa: '',
  nome: '',
  nicho: '',
  cidade: '',
  telefone: '',
  email: '',
  linkedin: '',
  instagram: '',
  website: '',
  origem: '',
  indicado_por: '',
  score: '',
  anotacoes: '',
};

const INPUT =
  'w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-700 focus:outline-none focus:border-white/20 transition-all';
const LABEL = 'block text-[10px] font-black uppercase tracking-widest text-[#F0F0F0] mb-1.5';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      {children}
    </div>
  );
}

function leadToForm(lead: Lead) {
  return {
    empresa:     lead.company_name ?? '',
    nome:        lead.contact_name ?? '',
    nicho:       lead.niche ?? '',
    cidade:      lead.city ?? '',
    telefone:    lead.phone ?? '',
    email:       lead.email ?? '',
    linkedin:    lead.linkedin ?? '',
    instagram:   lead.instagram ?? '',
    website:     lead.website ?? '',
    origem:      lead.source ?? '',
    indicado_por: lead.referred_by ?? '',
    score:       lead.score ?? '',
    anotacoes:   lead.notes ?? '',
  };
}

export function LeadModal({ isOpen, onClose, onSuccess, lead }: LeadModalProps) {
  const [form, setForm] = useState(lead ? leadToForm(lead) : EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setForm(lead ? leadToForm(lead) : EMPTY_FORM);
      setError('');
    }
  }, [isOpen, lead]);

  const set =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleClose = () => {
    setError('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      company_name: form.empresa,
      contact_name: form.nome,
      niche:        form.nicho || null,
      city:         form.cidade || null,
      phone:        form.telefone || null,
      email:        form.email || null,
      linkedin:     form.linkedin || null,
      instagram:    form.instagram || null,
      website:      form.website || null,
      source:       form.origem || null,
      referred_by:  form.origem === 'indicacao' ? (form.indicado_por || null) : null,
      score:        form.score || null,
      notes:        form.anotacoes || null,
    };

    const { data, error: dbError } = lead
      ? await updateLead(lead.id, payload)
      : await createLead(payload);

    if (dbError) {
      setError(dbError);
      setLoading(false);
      return;
    }

    onSuccess(data as unknown as Lead);
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 pt-10 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl bg-[#0C0C0C] border border-white/10 rounded-2xl p-8 mb-8 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-7">
              <div>
                <h2 className="font-outfit text-xl font-black tracking-tight text-white">
                  {lead ? 'Editar Lead' : 'Novo Lead'}
                </h2>
                <p className="text-gray-600 text-xs mt-1">
                  {lead ? `Editando ${lead.company_name ?? 'lead'}` : 'Preencha os dados do novo lead'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Empresa + Contato */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Empresa *">
                  <input type="text" value={form.empresa} onChange={set('empresa')} required placeholder="Nome da empresa" className={INPUT} />
                </Field>
                <Field label="Contato *">
                  <input type="text" value={form.nome} onChange={set('nome')} required placeholder="Nome do contato" className={INPUT} />
                </Field>
              </div>

              {/* Nicho + Cidade */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Nicho">
                  <select value={form.nicho} onChange={set('nicho')} className={INPUT} style={{ backgroundColor: '#111' }}>
                    <option value="">Selecione...</option>
                    <option value="imobiliaria">Imobiliária</option>
                    <option value="administradora_imoveis">Administradora de Imóveis</option>
                    <option value="administradora_condominios">Administradora de Condomínios</option>
                    <option value="outro">Outro</option>
                  </select>
                </Field>
                <Field label="Cidade">
                  <input type="text" value={form.cidade} onChange={set('cidade')} placeholder="Ex: Brasília - DF" className={INPUT} />
                </Field>
              </div>

              {/* Telefone + Email */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Telefone">
                  <input type="tel" value={form.telefone} onChange={set('telefone')} placeholder="(61) 99999-9999" className={INPUT} />
                </Field>
                <Field label="Email">
                  <input type="email" value={form.email} onChange={set('email')} placeholder="contato@empresa.com" className={INPUT} />
                </Field>
              </div>

              {/* LinkedIn + Instagram */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="LinkedIn">
                  <input type="text" value={form.linkedin} onChange={set('linkedin')} placeholder="linkedin.com/in/..." className={INPUT} />
                </Field>
                <Field label="Instagram">
                  <input type="text" value={form.instagram} onChange={set('instagram')} placeholder="@usuario" className={INPUT} />
                </Field>
              </div>

              {/* Website + Origem */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Website">
                  <input type="text" value={form.website} onChange={set('website')} placeholder="www.empresa.com.br" className={INPUT} />
                </Field>
                <Field label="Origem *">
                  <select value={form.origem} onChange={set('origem')} required className={INPUT} style={{ backgroundColor: '#111' }}>
                    <option value="">Selecione...</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="formulario">Formulário</option>
                    <option value="email">Email</option>
                    <option value="instagram">Instagram</option>
                    <option value="indicacao">Indicação</option>
                    <option value="telefone">Telefone</option>
                    <option value="prospeccao_ia">Prospecção IA</option>
                  </select>
                </Field>
              </div>

              {/* Indicado por (condicional) + Score */}
              <div className="grid grid-cols-2 gap-4">
                {form.origem === 'indicacao' ? (
                  <Field label="Indicado por">
                    <input type="text" value={form.indicado_por} onChange={set('indicado_por')} placeholder="Nome de quem indicou" className={INPUT} />
                  </Field>
                ) : (
                  <div />
                )}
                <Field label="Score">
                  <select value={form.score} onChange={set('score')} className={INPUT} style={{ backgroundColor: '#111' }}>
                    <option value="">Selecione...</option>
                    <option value="alto">Alto</option>
                    <option value="medio">Médio</option>
                    <option value="baixo">Baixo</option>
                  </select>
                </Field>
              </div>

              {/* Anotações */}
              <Field label="Anotações">
                <textarea
                  value={form.anotacoes}
                  onChange={set('anotacoes')}
                  rows={3}
                  placeholder="Observações relevantes sobre o lead..."
                  className={`${INPUT} resize-none`}
                />
              </Field>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-[11px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all"
                >
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="flex-1 relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-40 group-hover:opacity-70 group-disabled:opacity-20 transition duration-300" />
                  <div className="relative w-full bg-white text-black py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60">
                    {loading ? 'Salvando...' : lead ? 'Salvar Alterações' : 'Salvar Lead'}
                  </div>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
