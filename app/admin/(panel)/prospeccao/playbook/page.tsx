import { createAdminClient } from '@/lib/supabase';
import { BookOpen, Target, MessageSquare, TrendingUp, Lightbulb, Calendar } from 'lucide-react';

const CARD = 'bg-surface border border-border rounded-2xl p-6';

type PlaybookEntry = {
  id: string;
  nicho: string | null;
  estrategia: string | null;
  mensagem: string | null;
  resultado: string | null;
  o_que_funcionou: string | null;
  created_at: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function getPlaybookEntries(): Promise<PlaybookEntry[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('playbook_mensagens')
    .select('id, nicho, estrategia, mensagem, resultado, o_que_funcionou, created_at')
    .order('created_at', { ascending: false });
  return (data ?? []) as PlaybookEntry[];
}

function groupByNicho(entries: PlaybookEntry[]): Map<string, PlaybookEntry[]> {
  const groups = new Map<string, PlaybookEntry[]>();
  for (const entry of entries) {
    const key = entry.nicho || 'Sem nicho definido';
    const group = groups.get(key) ?? [];
    group.push(entry);
    groups.set(key, group);
  }
  return groups;
}

export default async function PlaybookPage() {
  const entries = await getPlaybookEntries();
  const groups = groupByNicho(entries);

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-cyan-400" />
        </div>
        <h1 className="font-outfit text-3xl font-black tracking-tight text-primary">Playbook de Mensagens</h1>
      </div>
      <p className="text-muted text-sm mt-1 ml-12 mb-6">Estratégias e mensagens de outreach por nicho, com resultados observados</p>

      {entries.length === 0 ? (
        <div className={`${CARD} flex flex-col items-center justify-center text-center py-16`}>
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-border flex items-center justify-center mb-3">
            <BookOpen className="w-5 h-5 text-muted" />
          </div>
          <p className="text-sm font-bold text-muted">Nenhuma entrada de playbook registrada</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {[...groups.entries()].map(([nicho, groupEntries]) => (
            <div key={nicho}>
              <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-3">
                {nicho} ({groupEntries.length})
              </p>
              <div className="flex flex-col gap-4">
                {groupEntries.map((entry) => (
                  <div key={entry.id} className={CARD}>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Target className="w-3.5 h-3.5 text-muted shrink-0" />
                        <p className="text-sm font-bold text-primary">{entry.estrategia || 'Sem estratégia definida'}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted shrink-0">
                        <Calendar className="w-3 h-3" />
                        {formatDate(entry.created_at)}
                      </div>
                    </div>

                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-7 h-7 rounded-lg bg-white/5 border border-border flex items-center justify-center shrink-0 mt-0.5">
                        <MessageSquare className="w-3.5 h-3.5 text-muted" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-1">Mensagem</p>
                        <p className="text-sm text-secondary whitespace-pre-wrap break-words">{entry.mensagem || '—'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-7 h-7 rounded-lg bg-white/5 border border-border flex items-center justify-center shrink-0 mt-0.5">
                        <TrendingUp className="w-3.5 h-3.5 text-muted" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-1">Resultado</p>
                        <p className="text-sm text-secondary whitespace-pre-wrap break-words">{entry.resultado || '—'}</p>
                      </div>
                    </div>

                    {entry.o_que_funcionou && (
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-1">O que funcionou</p>
                          <p className="text-sm text-secondary whitespace-pre-wrap break-words">{entry.o_que_funcionou}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
