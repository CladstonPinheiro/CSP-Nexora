'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Chama as Edge Functions de agendamento a partir do servidor. A
// SUPABASE_SERVICE_ROLE_KEY nunca pode chegar ao client — as functions
// (supabase/functions/_shared/auth.ts) autenticam comparando o Bearer
// token diretamente com essa chave, então toda chamada precisa passar
// por aqui.

type RespostaAgenda = {
  sucesso: boolean;
  situacao: string;
  mensagem: string;
  [key: string]: unknown;
};

async function getAuthUser() {
  const cookieStore = await cookies();
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) =>
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          ),
      },
    }
  );
  const { data: { user } } = await authClient.auth.getUser();
  return user;
}

async function chamarAgendaFunction(path: string, init: RequestInit = {}): Promise<RespostaAgenda> {
  const url = `${process.env.SUPABASE_URL}/functions/v1/${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
    cache: 'no-store',
  });
  return (await res.json().catch(() => ({ sucesso: false, situacao: 'ERRO_INTERNO', mensagem: 'Resposta inválida do servidor.' }))) as RespostaAgenda;
}

export async function buscarHorariosDisponiveis(
  data: string
): Promise<{ slots?: string[]; error?: string }> {
  const user = await getAuthUser();
  if (!user) redirect('/admin/login');

  const resp = await chamarAgendaFunction(`agendamentos-horarios?data=${encodeURIComponent(data)}`);
  if (!resp.sucesso) return { error: resp.mensagem };
  return { slots: (resp.slots_disponiveis as string[] | undefined) ?? [] };
}

export type CriarAgendamentoPayload = {
  lead_id: string;
  assunto?: string | null;
  data: string;
  hora: string;
};

export async function criarAgendamento(
  payload: CriarAgendamentoPayload
): Promise<{ data?: Record<string, unknown>; error?: string; sugestoes?: string[] }> {
  const user = await getAuthUser();
  if (!user) redirect('/admin/login');

  const resp = await chamarAgendaFunction('agendamentos', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!resp.sucesso) {
    return { error: resp.mensagem, sugestoes: resp.sugestoes as string[] | undefined };
  }
  return { data: resp.agendamento as Record<string, unknown> };
}

export type ReagendarPayload = { data: string; hora: string };

export async function reagendarAgendamento(
  id: string,
  payload: ReagendarPayload
): Promise<{ data?: Record<string, unknown>; error?: string; sugestoes?: string[] }> {
  const user = await getAuthUser();
  if (!user) redirect('/admin/login');

  const resp = await chamarAgendaFunction(`agendamentos-id/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  if (!resp.sucesso) {
    return { error: resp.mensagem, sugestoes: resp.sugestoes as string[] | undefined };
  }
  return { data: resp.agendamento as Record<string, unknown> };
}

export async function cancelarAgendamento(
  id: string
): Promise<{ data?: Record<string, unknown>; error?: string }> {
  const user = await getAuthUser();
  if (!user) redirect('/admin/login');

  const resp = await chamarAgendaFunction(`agendamentos-id/${id}`, { method: 'DELETE' });

  if (!resp.sucesso) return { error: resp.mensagem };
  return { data: resp.agendamento as Record<string, unknown> };
}
