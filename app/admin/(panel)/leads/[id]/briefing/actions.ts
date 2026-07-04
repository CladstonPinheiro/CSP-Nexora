'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import type { Briefing, BriefingField, IntegracaoDesejada } from './_components/types';

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

export async function getBriefing(
  leadId: string
): Promise<{ data?: Briefing | null; error?: string }> {
  const user = await getAuthUser();
  if (!user) redirect('/admin/login');

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('briefings')
    .select('*')
    .eq('lead_id', leadId)
    .maybeSingle();

  if (error) return { error: error.message };
  return { data: data as Briefing | null };
}

async function upsertBriefingPatch(
  leadId: string,
  patch: Record<string, unknown>
): Promise<{ data?: Briefing; error?: string }> {
  const supabase = createAdminClient();
  const { data: existing, error: findError } = await supabase
    .from('briefings')
    .select('id')
    .eq('lead_id', leadId)
    .maybeSingle();

  if (findError) return { error: findError.message };

  if (existing) {
    const { data, error } = await supabase
      .from('briefings')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) return { error: error.message };
    return { data: data as Briefing };
  }

  const { data, error } = await supabase
    .from('briefings')
    .insert([{ lead_id: leadId, ...patch }])
    .select()
    .single();

  if (error) return { error: error.message };
  return { data: data as Briefing };
}

export async function upsertBriefingField(
  leadId: string,
  field: BriefingField,
  value: string
): Promise<{ data?: Briefing; error?: string }> {
  const user = await getAuthUser();
  if (!user) redirect('/admin/login');

  return upsertBriefingPatch(leadId, { [field]: value || null });
}

export async function upsertBriefingNumberField(
  leadId: string,
  field: 'numero_agendas' | 'numero_fluxos_automacao',
  value: number | null
): Promise<{ data?: Briefing; error?: string }> {
  const user = await getAuthUser();
  if (!user) redirect('/admin/login');

  return upsertBriefingPatch(leadId, { [field]: value });
}

export async function upsertBriefingIntegracoes(
  leadId: string,
  value: IntegracaoDesejada[]
): Promise<{ data?: Briefing; error?: string }> {
  const user = await getAuthUser();
  if (!user) redirect('/admin/login');

  return upsertBriefingPatch(leadId, { integracoes_desejadas: value });
}

export async function completeBriefing(
  leadId: string
): Promise<{ data?: Briefing; error?: string }> {
  const user = await getAuthUser();
  if (!user) redirect('/admin/login');

  return upsertBriefingPatch(leadId, { status: 'concluido' });
}
