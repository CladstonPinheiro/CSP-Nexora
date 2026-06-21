'use client';

import { useEffect, useState } from 'react';

interface DiagnosticInfo {
  url: string;
  userAgent: string;
  viewport: string;
  timestamp: string;
}

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [info, setInfo] = useState<DiagnosticInfo>({
    url: '',
    userAgent: '',
    viewport: '',
    timestamp: '',
  });

  useEffect(() => {
    const diagnostics: DiagnosticInfo = {
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight} (tela: ${screen.width}x${screen.height})`,
      timestamp: new Date().toISOString(),
    };
    setInfo(diagnostics);

    console.error('=== [CSP NEXORA] ERROR BOUNDARY ===');
    console.error('Tipo:      ', error.name);
    console.error('Mensagem:  ', error.message);
    console.error('Digest:    ', error.digest ?? '(client-side)');
    console.error('URL:       ', diagnostics.url);
    console.error('Viewport:  ', diagnostics.viewport);
    console.error('UserAgent: ', diagnostics.userAgent);
    console.error('Timestamp: ', diagnostics.timestamp);
    console.error('Stack:\n', error.stack);
    console.error('====================================');
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 font-mono">
      <div className="max-w-2xl mx-auto py-8 space-y-4">

        {/* Header */}
        <div className="border border-red-500/40 rounded-2xl p-4 bg-red-500/5">
          <p className="text-red-400 text-[10px] font-black uppercase tracking-widest mb-1">
            CSP Nexora — Error Boundary (Diagnóstico)
          </p>
          <p className="text-white text-lg font-black">Erro capturado</p>
          <p className="text-gray-500 text-xs mt-1">
            Tire um print desta tela inteira e envie para diagnóstico.
          </p>
        </div>

        {/* Tipo + Mensagem */}
        <div className="border border-white/10 rounded-2xl p-4 bg-[#111] space-y-3">
          <Row label="Tipo" value={error.name} highlight />
          <Row label="Mensagem" value={error.message} highlight />
          {error.digest && <Row label="Digest (Server ID)" value={error.digest} />}
        </div>

        {/* Ambiente */}
        <div className="border border-white/10 rounded-2xl p-4 bg-[#111] space-y-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-cyan-400 mb-2">Ambiente</p>
          <Row label="Timestamp" value={info.timestamp || 'Carregando...'} />
          <Row label="URL" value={info.url || 'Carregando...'} />
          <Row label="Viewport" value={info.viewport || 'Carregando...'} />
          <Row label="User Agent" value={info.userAgent || 'Carregando...'} wrap />
        </div>

        {/* Stack trace */}
        {error.stack && (
          <div className="border border-white/10 rounded-2xl p-4 bg-[#111]">
            <p className="text-[9px] font-black uppercase tracking-widest text-cyan-400 mb-3">Stack Trace</p>
            <pre className="text-[11px] text-gray-400 whitespace-pre-wrap break-words leading-relaxed">
              {error.stack}
            </pre>
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={reset}
            className="flex-1 py-3 px-4 rounded-xl bg-white text-black text-[11px] font-black uppercase tracking-widest"
          >
            Tentar novamente
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 py-3 px-4 rounded-xl border border-white/10 bg-white/5 text-white text-[11px] font-black uppercase tracking-widest"
          >
            Recarregar
          </button>
        </div>

      </div>
    </div>
  );
}

function Row({ label, value, highlight, wrap }: { label: string; value: string; highlight?: boolean; wrap?: boolean }) {
  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 mb-0.5">{label}</p>
      <p className={`text-xs leading-relaxed ${highlight ? 'text-white font-bold' : 'text-gray-400'} ${wrap ? 'break-all' : 'break-words'}`}>
        {value}
      </p>
    </div>
  );
}
