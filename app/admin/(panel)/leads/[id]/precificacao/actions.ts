'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import type { Precificacao } from './_components/types';

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

export async function getPrecificacao(
  leadId: string
): Promise<{ data?: Precificacao | null; error?: string }> {
  const user = await getAuthUser();
  if (!user) redirect('/admin/login');

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('precificacoes')
    .select('*')
    .eq('lead_id', leadId)
    .maybeSingle();

  if (error) return { error: error.message };
  return { data: data as Precificacao | null };
}

export async function savePrecificacao(
  leadId: string,
  payload: Partial<Precificacao>
): Promise<{ data?: Precificacao; error?: string }> {
  const user = await getAuthUser();
  if (!user) redirect('/admin/login');

  const supabase = createAdminClient();
  const { data: existing, error: findError } = await supabase
    .from('precificacoes')
    .select('id')
    .eq('lead_id', leadId)
    .maybeSingle();

  if (findError) return { error: findError.message };

  if (existing) {
    const { data, error } = await supabase
      .from('precificacoes')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) return { error: error.message };
    return { data: data as Precificacao };
  }

  const { data, error } = await supabase
    .from('precificacoes')
    .insert([{ lead_id: leadId, ...payload }])
    .select()
    .single();

  if (error) return { error: error.message };
  return { data: data as Precificacao };
}
