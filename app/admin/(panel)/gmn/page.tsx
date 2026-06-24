'use client';

import { useState } from 'react';
import {
  Globe,
  Loader2,
  ClipboardCopy,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  Phone,
  MapPin,
  Briefcase,
  Instagram,
  Facebook,
  MessageCircle,
  FileText,
} from 'lucide-react';
import type { GmnExtracted } from '@/app/api/gmn/extract/route';

const nichoLabel: Record<string, string> = {
  imobiliaria:                'Imobiliária',
  administradora_imoveis:     'Adm. de Imóveis',
  administradora_condominios: 'Adm. de Condomínios',
  outro:                      'Outro',
};

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-gray-500" />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-widest text-gray-700">{label}</p>
        <p className="text-sm text-white mt-0.5 break-words">{value}</p>
      </div>
    </div>
  );
}

export default function GmnPage() {
  const [rawText, setRawText]       = useState('');
  const [extracting, setExtracting] = useState('');
  const [extracted, setExtracted]   = useState<GmnExtracted | null>(null);
  const [error, setError]           = useState('');
  const [crmStatus, setCrmStatus]   = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [copied, setCopied]         = useState(false);

  async function handleExtract() {
    if (!rawText.trim()) return;
    setExtracting('Analisando com IA...');
    setExtracted(null);
    setError('');
    setCrmStatus('idle');

    try {
      const res = await fetch('/api/gmn/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Erro desconhecido');
      setExtracted(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao extrair dados.');
    } finally {
      setExtracting('');
    }
  }

  async function handleCadastrar() {
    if (!extracted) return;
    setCrmStatus('saving');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome:    extracted.company_name,
          empresa: extracted.company_name,
          telefone: extracted.phone || extracted.whatsapp,
          email:   '',
          niche:   extracted.niche || 'outro',
          source:  'prospeccao_gmn',
          stage:   'identificado',
          notes:   [
            extracted.description && `Descrição: ${extracted.description}`,
            extracted.services.length > 0 && `Serviços: ${extracted.services.join(', ')}`,
            extracted.address && `Endereço: ${extracted.address}`,
            extracted.instagram && `Instagram: ${extracted.instagram}`,
            extracted.facebook && `Facebook: ${extracted.facebook}`,
          ].filter(Boolean).join('\n') || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Erro ao cadastrar');
      setCrmStatus('saved');
    } catch {
      setCrmStatus('error');
    }
  }

  function handleCopyPrompt() {
    if (!extracted) return;
    const text = JSON.stringify(extracted, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Globe className="w-4 h-4 text-blue-400" />
          </div>
          <h1 className="font-outfit text-3xl font-black tracking-tight text-white">Prospecção GMN</h1>
        </div>
        <p className="text-gray-600 text-sm ml-12">
          Extraia dados do Google Meu Negócio e cadastre leads automaticamente
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Input */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 mb-3">
              Dados do Google Meu Negócio
            </p>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Cole aqui os dados copiados do Google Meu Negócio..."
              rows={16}
              className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 outline-none resize-none focus:border-blue-500/40 transition-colors font-mono leading-relaxed"
            />
            <button
              onClick={handleExtract}
              disabled={!!extracting || !rawText.trim()}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[11px] font-black uppercase tracking-widest px-6 py-3.5 rounded-xl transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              {extracting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {extracting}
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  Extrair e Organizar com IA
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Resultado */}
        <div className="flex flex-col gap-4">
          {!extracted && !extracting && (
            <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-2xl p-10 flex flex-col items-center justify-center text-center min-h-[200px]">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <Globe className="w-5 h-5 text-gray-700" />
              </div>
              <p className="text-sm font-bold text-gray-600">Nenhum dado extraído ainda</p>
              <p className="text-xs text-gray-700 mt-1">Cole os dados e clique em Extrair</p>
            </div>
          )}

          {extracting && (
            <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-2xl p-10 flex flex-col items-center justify-center min-h-[200px]">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin mb-3" />
              <p className="text-sm text-gray-500">{extracting}</p>
            </div>
          )}

          {extracted && (
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
              {/* Nome + Nicho */}
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  {extracted.company_name || '—'}
                </h2>
                {extracted.niche && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-lg border bg-blue-500/10 border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest">
                    {nichoLabel[extracted.niche] ?? extracted.niche}
                  </span>
                )}
              </div>

              <div className="h-px bg-white/5" />

              {/* Campos */}
              <div className="flex flex-col gap-4">
                <InfoRow icon={Phone}         label="Telefone"    value={extracted.phone} />
                <InfoRow icon={MapPin}         label="Endereço"    value={extracted.address} />
                <InfoRow icon={MapPin}         label="Cidade"      value={extracted.city} />
                <InfoRow icon={MessageCircle}  label="WhatsApp"    value={extracted.whatsapp} />
                <InfoRow icon={Instagram}      label="Instagram"   value={extracted.instagram} />
                <InfoRow icon={Facebook}       label="Facebook"    value={extracted.facebook} />
                <InfoRow icon={FileText}       label="Descrição"   value={extracted.description} />
              </div>

              {/* Serviços */}
              {extracted.services.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-gray-700" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-700">Serviços</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {extracted.services.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.07] text-xs text-gray-400"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="h-px bg-white/5" />

              {/* Ações */}
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={handleCadastrar}
                  disabled={crmStatus === 'saving' || crmStatus === 'saved'}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-60 disabled:cursor-not-allowed
                    bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                >
                  {crmStatus === 'saving' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {crmStatus === 'saved'  && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {crmStatus === 'error'  && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
                  {crmStatus === 'idle'   && <UserPlus className="w-3.5 h-3.5" />}
                  {crmStatus === 'saving' ? 'Cadastrando...' :
                   crmStatus === 'saved'  ? 'Cadastrado no CRM!' :
                   crmStatus === 'error'  ? 'Erro — tentar novamente' :
                   'Cadastrar no CRM'}
                </button>

                <button
                  onClick={handleCopyPrompt}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all
                    bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.08]"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <ClipboardCopy className="w-3.5 h-3.5" />}
                  {copied ? 'Copiado!' : 'Copiar JSON para AI Studio'}
                </button>
              </div>

              {crmStatus === 'error' && (
                <p className="text-xs text-red-400 text-center">
                  Erro ao cadastrar. Verifique se telefone está preenchido e tente novamente.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
