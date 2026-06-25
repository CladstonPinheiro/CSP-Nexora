'use client';

import { useState, useEffect, useCallback } from 'react';
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
  History,
  Trash2,
  X,
  Printer,
} from 'lucide-react';
import type { GmnExtracted } from '@/app/api/gmn/extract/route';

const nichoLabel: Record<string, string> = {
  imobiliaria:                'Imobiliária',
  administradora_imoveis:     'Adm. de Imóveis',
  administradora_condominios: 'Adm. de Condomínios',
  outro:                      'Outro',
};

type Prospect = GmnExtracted & {
  id: string;
  lead_cadastrado: boolean;
  lead_id: string | null;
  created_at: string;
  description?: string | null;
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function BSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[9px] font-black uppercase tracking-widest text-gray-700 print:text-gray-500">{title}</p>
      {children}
    </div>
  );
}

function BLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[9px] font-black uppercase tracking-widest text-gray-700 mt-1 print:text-gray-500">{children}</p>;
}

function BValue({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-white break-words print:text-black">{children}</p>;
}

function calcScores(e: GmnExtracted) {
  let presenca: 'alto' | 'medio' | 'baixo';
  let presencaMotivo: string;
  if (e.website || (e.instagram_followers != null && e.instagram_followers > 200 && e.instagram_posts != null && e.instagram_posts > 50) || e.youtube || e.tiktok) {
    presenca = 'alto';
    presencaMotivo = [
      e.website && 'Tem site próprio',
      e.youtube && 'Canal no YouTube',
      e.tiktok && 'Presença no TikTok',
      e.instagram_followers != null && e.instagram_followers > 200 && `${e.instagram_followers} seguidores no Instagram`,
    ].filter(Boolean).join(', ') || 'Forte presença digital';
  } else if (e.instagram || e.facebook || (e.rating != null && e.rating > 4.0)) {
    presenca = 'medio';
    presencaMotivo = [
      e.instagram && 'Tem Instagram',
      e.facebook && 'Tem Facebook',
      e.rating != null && e.rating > 4.0 && `Nota ${e.rating} no Google`,
    ].filter(Boolean).join(', ') || 'Presença básica em redes sociais';
  } else {
    presenca = 'baixo';
    presencaMotivo = 'Sem presença digital identificada';
  }

  let marketing: 'alto' | 'medio' | 'baixo';
  let marketingMotivo: string;
  if (e.rating != null && e.total_reviews != null && e.total_reviews > 20 && e.instagram_followers != null && e.instagram_followers > 100) {
    marketing = 'alto';
    marketingMotivo = `${e.total_reviews} avaliações e ${e.instagram_followers} seguidores no Instagram`;
  } else if (e.rating != null || e.instagram) {
    marketing = 'medio';
    marketingMotivo = [
      e.rating != null && `Nota ${e.rating} no Google`,
      e.instagram && 'Tem Instagram',
    ].filter(Boolean).join(', ') || 'Sinais moderados de investimento';
  } else {
    marketing = 'baixo';
    marketingMotivo = 'Sem avaliações ou redes identificadas';
  }

  let estrutura: 'alto' | 'medio' | 'baixo';
  let estruturaMotivo: string;
  const extraPhones = e.extra_phones ?? [];
  const services    = e.services    ?? [];
  const payments    = e.payments    ?? [];

  if (extraPhones.length > 0 && services.length > 1 && e.has_delivery) {
    estrutura = 'alto';
    estruturaMotivo = `${extraPhones.length + 1} telefones, ${services.length} serviços e entrega`;
  } else if (services.length > 1 || e.has_delivery || payments.length > 1) {
    estrutura = 'medio';
    estruturaMotivo = [
      services.length > 1 && `${services.length} serviços`,
      e.has_delivery && 'Faz entrega',
      payments.length > 1 && `${payments.length} formas de pagamento`,
    ].filter(Boolean).join(', ') || 'Estrutura moderada';
  } else {
    estrutura = 'baixo';
    estruturaMotivo = 'Poucas informações operacionais';
  }

  return { presenca, presencaMotivo, marketing, marketingMotivo, estrutura, estruturaMotivo };
}

const scoreBadge = (s: 'alto' | 'medio' | 'baixo') =>
  s === 'alto'  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' :
  s === 'medio' ? 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400' :
                  'bg-red-500/15 border-red-500/30 text-red-400';

const scoreLabel = (s: 'alto' | 'medio' | 'baixo') =>
  s === 'alto' ? 'Alto' : s === 'medio' ? 'Médio' : 'Baixo';

function BriefingModal({ extracted, onClose }: { extracted: GmnExtracted; onClose: () => void }) {
  const today = new Date().toLocaleDateString('pt-BR');

  const scores = calcScores(extracted);

  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'briefing-print-style';
    style.textContent = `
      @media print {
        body > * { display: none !important; }
        #briefing-print-root { display: block !important; position: fixed; inset: 0; z-index: 9999; background: white; overflow: auto; }
        #briefing-print-root * { color: black !important; border-color: #ddd !important; background: white !important; }
        #briefing-print-root .no-print { display: none !important; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.getElementById('briefing-print-style')?.remove();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-black p-4 pt-8">
      <div id="briefing-print-root" className="w-full max-w-3xl bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl mb-8">

        {/* Cabeçalho */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-white/5">
          <div className="flex items-start gap-4">
            {extracted.logo_url && (
              <img src={extracted.logo_url} alt="Logo" className="w-16 h-16 rounded-xl object-contain border border-white/10" />
            )}
            <div>
              <h2 className="text-2xl font-black text-white">{extracted.company_name}</h2>
              {extracted.gmn_category && <p className="text-sm text-gray-500 mt-0.5">{extracted.gmn_category}</p>}
              {extracted.niche && (
                <span className="inline-block mt-1 px-2 py-0.5 rounded-lg border bg-blue-500/10 border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest">
                  {nichoLabel[extracted.niche] ?? extracted.niche}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-6">

          {/* Paleta */}
          {(extracted.color_palette?.length ?? 0) > 0 && (
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-700 mb-2">Paleta de Cores</p>
              <div className="flex gap-2 flex-wrap">
                {extracted.color_palette.map((cor) => (
                  <div key={cor} className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-xl border border-white/10" style={{ backgroundColor: cor }} />
                    <span className="text-[9px] text-gray-600 font-mono">{cor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scores */}
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-700 mb-2">Score — Perfil do Cliente Ideal</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Presença Online', score: scores.presenca, motivo: scores.presencaMotivo },
                { label: 'Investimento em Marketing', score: scores.marketing, motivo: scores.marketingMotivo },
                { label: 'Estrutura Operacional', score: scores.estrutura, motivo: scores.estruturaMotivo },
              ].map((item) => (
                <div key={item.label} className="flex flex-col gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">{item.label}</p>
                  <span className={`self-start px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-widest ${scoreBadge(item.score)}`}>
                    {scoreLabel(item.score)}
                  </span>
                  <p className="text-xs text-gray-500">{item.motivo}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contatos */}
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-700 mb-2">Contatos</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Telefone', extracted.phone],
                ['WhatsApp', extracted.whatsapp],
                ['Instagram', extracted.instagram],
                ['Facebook', extracted.facebook],
                ['YouTube', extracted.youtube],
                ['TikTok', extracted.tiktok],
                ['LinkedIn', extracted.linkedin],
                ['Website', extracted.website],
                ['Catálogo', extracted.catalog_url],
                ['Email', extracted.email],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label as string}>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-700">{label}</p>
                  <p className="text-sm text-white mt-0.5">{value}</p>
                </div>
              ))}
              {(extracted.extra_phones?.length ?? 0) > 0 && (
                <div className="col-span-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-700">Telefones adicionais</p>
                  <p className="text-sm text-white mt-0.5">{extracted.extra_phones.join(', ')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Localização */}
          {(extracted.address || extracted.city) && (
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-700 mb-2">Localização</p>
              <div className="grid grid-cols-2 gap-3">
                {extracted.address && <div className="col-span-2"><p className="text-[9px] font-black uppercase tracking-widest text-gray-700">Endereço</p><p className="text-sm text-white mt-0.5">{extracted.address}</p></div>}
                {extracted.city && <div><p className="text-[9px] font-black uppercase tracking-widest text-gray-700">Cidade</p><p className="text-sm text-white mt-0.5">{extracted.city}</p></div>}
                {extracted.cep && <div><p className="text-[9px] font-black uppercase tracking-widest text-gray-700">CEP</p><p className="text-sm text-white mt-0.5">{extracted.cep}</p></div>}
              </div>
            </div>
          )}

          {/* Descrição */}
          {extracted.description_full && (
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-700 mb-2">Descrição</p>
              <p className="text-sm text-gray-400 leading-relaxed">{extracted.description_full}</p>
            </div>
          )}

          {/* Serviços */}
          {(extracted.services?.length ?? 0) > 0 && (
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-700 mb-2">Serviços</p>
              <div className="flex flex-wrap gap-1.5">
                {extracted.services.map((s) => (
                  <span key={s} className="px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.07] text-xs text-gray-400">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Diferenciais */}
          {(extracted.differentials?.length ?? 0) > 0 && (
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-700 mb-2">Diferenciais</p>
              <div className="flex flex-wrap gap-1.5">
                {extracted.differentials.map((d) => (
                  <span key={d} className="px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-400">{d}</span>
                ))}
              </div>
            </div>
          )}

          {/* Horários */}
          {extracted.business_hours && Object.keys(extracted.business_hours).length > 0 && (
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-700 mb-2">Horários</p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                {Object.entries(extracted.business_hours).map(([dia, hora]) => (
                  <div key={dia} className="flex justify-between py-0.5 border-b border-white/[0.04]">
                    <span className="text-xs text-gray-600">{dia}</span>
                    <span className="text-xs text-white">{hora}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Avaliação */}
          {(extracted.rating != null || extracted.total_reviews != null) && (
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-700 mb-2">Avaliação no Google</p>
              <div className="flex gap-6">
                {extracted.rating != null && <div><p className="text-[9px] font-black uppercase tracking-widest text-gray-700">Nota</p><p className="text-2xl font-black text-yellow-400 mt-1">⭐ {extracted.rating}</p></div>}
                {extracted.total_reviews != null && <div><p className="text-[9px] font-black uppercase tracking-widest text-gray-700">Avaliações</p><p className="text-2xl font-black text-white mt-1">{extracted.total_reviews}</p></div>}
              </div>
            </div>
          )}

          {/* Pagamentos */}
          {(extracted.payments?.length ?? 0) > 0 && (
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-700 mb-2">Formas de Pagamento</p>
              <div className="flex flex-wrap gap-1.5">
                {extracted.payments.map((p) => (
                  <span key={p} className="px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.07] text-xs text-gray-400">{p}</span>
                ))}
              </div>
            </div>
          )}

          {/* Acessibilidade */}
          {(extracted.accessibility?.length ?? 0) > 0 && (
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-700 mb-2">Acessibilidade</p>
              <div className="flex flex-wrap gap-1.5">
                {extracted.accessibility.map((a) => (
                  <span key={a} className="px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.07] text-xs text-gray-400">{a}</span>
                ))}
              </div>
            </div>
          )}

          {/* Rodapé */}
          <div className="flex justify-between pt-2 border-t border-white/5">
            <p className="text-xs text-gray-700">CSP Nexora — cspnexora.com.br</p>
            <p className="text-xs text-gray-700">Extração: {today}</p>
          </div>

          {/* Botão PDF */}
          <button
            onClick={() => {
              const nomeArquivo = extracted.company_name
                ? extracted.company_name.replace(/[^a-zA-Z0-9À-ÿ\s]/g, '').trim().replace(/\s+/g, '_')
                : 'briefing';
              document.title = `Briefing_${nomeArquivo}`;
              window.print();
              setTimeout(() => { document.title = 'CSP Nexora | Automação com IA e Agentes Inteligentes'; }, 2000);
            }}
            className="no-print flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest bg-violet-500/20 border border-violet-500/40 text-violet-400 hover:bg-violet-500/30"
          >
            <Printer className="w-3.5 h-3.5" />
            Baixar PDF
          </button>

        </div>
      </div>
    </div>
  );
}

export default function GmnPage() {
  const [rawText, setRawText]           = useState('');
  const [logoUrl, setLogoUrl]           = useState('');
  const [extracting, setExtracting]     = useState('');
  const [extracted, setExtracted]       = useState<GmnExtracted | null>(null);
  const [prospectId, setProspectId]     = useState<string | null>(null);
  const [error, setError]               = useState('');
  const [crmStatus, setCrmStatus]       = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [copied, setCopied]             = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);
  const [prospects, setProspects]       = useState<Prospect[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchProspects = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/gmn/prospects');
      const json = await res.json();
      setProspects(json.data ?? []);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => { fetchProspects(); }, [fetchProspects]);

  async function handleExtract() {
    if (!rawText.trim()) return;
    setExtracting('Analisando com IA...');
    setExtracted(null);
    setProspectId(null);
    setError('');
    setCrmStatus('idle');

    try {
      const res = await fetch('/api/gmn/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText, logoUrl: logoUrl.trim() || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Erro desconhecido');
      setExtracted(json.data);
      setProspectId(json.prospectId ?? null);
      fetchProspects();
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
          nome:     extracted.company_name,
          empresa:  extracted.company_name,
          telefone: extracted.phone || extracted.whatsapp,
          email:    '',
          niche:    extracted.niche || 'outro',
          source:   'prospeccao_gmn',
          stage:    'identificado',
          notes: [
            extracted.description_full && `Descrição: ${extracted.description_full}`,
            extracted.services.length > 0 && `Serviços: ${extracted.services.join(', ')}`,
            extracted.address && `Endereço: ${extracted.address}`,
            extracted.instagram && `Instagram: ${extracted.instagram}`,
            extracted.facebook && `Facebook: ${extracted.facebook}`,
          ].filter(Boolean).join('\n') || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Erro ao cadastrar');

      if (prospectId) {
        await fetch(`/api/gmn/prospects/${prospectId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lead_cadastrado: true, lead_id: json.data?.id ?? null }),
        }).catch(() => {});
      }

      setCrmStatus('saved');
      fetchProspects();
    } catch {
      setCrmStatus('error');
    }
  }

  async function handleDeleteProspect(id: string) {
    setProspects((prev) => prev.filter((p) => p.id !== id));
    if (prospectId === id) { setExtracted(null); setProspectId(null); }
    await fetch(`/api/gmn/prospects/${id}`, { method: 'DELETE' }).catch(() => {});
  }

  function handleLoadProspect(p: Prospect) {
    setExtracted({
      company_name:      p.company_name,
      slogan:            null,
      phone:             p.phone,
      email:             null,
      address:           p.address,
      city:              p.city,
      neighborhood:      null,
      cep:               null,
      state:             null,
      maps_url:          p.maps_url ?? null,
      business_hours:    p.business_hours ?? null,
      is_open_24h:       null,
      instagram:         p.instagram,
      instagram_url:     null,
      facebook:          p.facebook,
      facebook_url:      null,
      whatsapp:          p.whatsapp,
      logo_url:          p.logo_url ?? null,
      website:           null,
      description_short: null,
      description_full:  p.description ?? null,
      niche:             p.niche,
      gmn_category:      null,
      services:              p.services ?? [],
      areas_served:          p.areas_served ?? [],
      differentials:         p.differentials ?? [],
      parking:               null,
      service_options:       [],
      rating:                null,
      total_reviews:         null,
      extra_phones:          [],
      payments:              [],
      accessibility:         [],
      instagram_followers:   null,
      instagram_following:   null,
      instagram_posts:       null,
      color_palette:         [],
      youtube:               null,
      tiktok:                null,
      linkedin:              null,
      catalog_url:           null,
      has_delivery:          null,
    });
    setProspectId(p.id);
    setCrmStatus(p.lead_cadastrado ? 'saved' : 'idle');
    setError('');
  }

  function handleCopyPrompt() {
    if (!extracted) return;
    navigator.clipboard.writeText(JSON.stringify(extracted, null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <>
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
        {/* Coluna esquerda: input + histórico */}
        <div className="flex flex-col gap-4">
          {/* Textarea */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 mb-3">
              Dados do Google Meu Negócio
            </p>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Cole aqui os dados copiados do Google Meu Negócio..."
              rows={14}
              className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 outline-none resize-none focus:border-blue-500/40 transition-colors font-mono leading-relaxed"
            />
            <div className="mt-3 flex flex-col gap-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-600">
                URL da Logo (opcional)
              </label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://i.ibb.co/... (faça upload no ImgBB e cole aqui)"
                className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-700 outline-none focus:border-blue-500/40 transition-colors"
              />
            </div>
            <button
              onClick={handleExtract}
              disabled={!!extracting || !rawText.trim()}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[11px] font-black uppercase tracking-widest px-6 py-3.5 rounded-xl transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              {extracting ? (
                <><Loader2 className="w-4 h-4 animate-spin" />{extracting}</>
              ) : (
                <><Globe className="w-4 h-4" />Extrair e Organizar com IA</>
              )}
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Histórico */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/5">
              <History className="w-3.5 h-3.5 text-gray-600" />
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">
                Prospecções anteriores
              </p>
            </div>
            {loadingHistory ? (
              <div className="flex flex-col gap-2 p-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-10 bg-white/[0.03] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : prospects.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-xs text-gray-700">Nenhuma prospecção ainda</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {prospects.map((p) => (
                  <div
                    key={p.id}
                    className={`flex items-center gap-2 px-4 py-3 transition-colors hover:bg-white/[0.03] ${
                      prospectId === p.id ? 'bg-blue-500/[0.06]' : ''
                    }`}
                  >
                    <button
                      onClick={() => handleLoadProspect(p)}
                      className="flex-1 flex items-center justify-between text-left min-w-0"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {p.company_name || '—'}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {[p.city, formatDate(p.created_at)].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                      {p.lead_cadastrado && (
                        <span className="ml-3 shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          CRM
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteProspect(p.id)}
                      className="shrink-0 w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 flex items-center justify-center text-gray-700 hover:text-red-400 transition-all"
                      title="Remover"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Coluna direita: resultado */}
        <div className="flex flex-col gap-4">
          {!extracted && !extracting && (
            <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-2xl p-10 flex flex-col items-center justify-center text-center min-h-[200px]">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <Globe className="w-5 h-5 text-gray-700" />
              </div>
              <p className="text-sm font-bold text-gray-600">Nenhum dado extraído ainda</p>
              <p className="text-xs text-gray-700 mt-1">Cole os dados e clique em Extrair, ou selecione uma prospecção anterior</p>
            </div>
          )}

          {extracting && (
            <div className="bg-[#0A0A0A] border border-white/[0.06] rounded-2xl p-10 flex flex-col items-center justify-center min-h-[200px]">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin mb-3" />
              <p className="text-sm text-gray-500">{extracting}</p>
            </div>
          )}

          {extracted && !showBriefing && (
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

              <div className="flex flex-col gap-4">
                <InfoRow icon={Phone}        label="Telefone"  value={extracted.phone ?? ''} />
                <InfoRow icon={MapPin}        label="Endereço"  value={extracted.address ?? ''} />
                <InfoRow icon={MapPin}        label="Cidade"    value={extracted.city ?? ''} />
                <InfoRow icon={MessageCircle} label="WhatsApp"  value={extracted.whatsapp ?? ''} />
                <InfoRow icon={Instagram}     label="Instagram" value={extracted.instagram ?? ''} />
                <InfoRow icon={Facebook}      label="Facebook"  value={extracted.facebook ?? ''} />
                <InfoRow icon={FileText}      label="Descrição" value={extracted.description_full ?? ''} />
              </div>

              {extracted.services.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-gray-700" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-700">Serviços</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {extracted.services.map((s) => (
                      <span key={s} className="px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.07] text-xs text-gray-400">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {extracted.color_palette && extracted.color_palette.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-700">Paleta de Cores</p>
                  <div className="flex gap-2 flex-wrap">
                    {extracted.color_palette.map((cor) => (
                      <div key={cor} className="flex flex-col items-center gap-1">
                        <div
                          className="w-10 h-10 rounded-xl border border-white/10 shadow-inner"
                          style={{ backgroundColor: cor }}
                          title={cor}
                        />
                        <span className="text-[9px] text-gray-600 font-mono">{cor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="h-px bg-white/5" />

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={handleCadastrar}
                  disabled={crmStatus === 'saving' || crmStatus === 'saved'}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-60 disabled:cursor-not-allowed bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                >
                  {crmStatus === 'saving' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {crmStatus === 'saved'  && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {crmStatus === 'error'  && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
                  {crmStatus === 'idle'   && <UserPlus className="w-3.5 h-3.5" />}
                  {crmStatus === 'saving' ? 'Cadastrando...'      :
                   crmStatus === 'saved'  ? 'Cadastrado no CRM!'  :
                   crmStatus === 'error'  ? 'Erro — tentar novamente' :
                   'Cadastrar no CRM'}
                </button>

                <button
                  onClick={() => setShowBriefing(true)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all bg-violet-500/20 border border-violet-500/40 text-violet-400 hover:bg-violet-500/30"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Ver Briefing
                </button>

                <button
                  onClick={handleCopyPrompt}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-60 disabled:cursor-not-allowed bg-amber-500 hover:bg-amber-400 text-black hover:-translate-y-0.5 active:translate-y-0"
                >
                  {copied
                    ? <CheckCircle2 className="w-3.5 h-3.5" />
                    : <ClipboardCopy className="w-3.5 h-3.5" />}
                  {copied ? '✓ Copiado!' : 'Copiar JSON para AI Studio'}
                </button>
              </div>

              {crmStatus === 'error' && (
                <p className="text-xs text-red-400 text-center">
                  Erro ao cadastrar. Verifique se o telefone está preenchido e tente novamente.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
    {showBriefing && extracted && (
      <BriefingModal extracted={extracted} onClose={() => setShowBriefing(false)} />
    )}
    </>
  );
}
