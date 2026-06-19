'use server';

import { createAdminClient } from '@/lib/supabase';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export type LeadPayload = {
  empresa: string;
  nome: string;
  nicho?: string | null;
  cidade?: string | null;
  telefone?: string | null;
  email?: string | null;
  linkedin?: string | null;
  instagram?: string | null;
  website?: string | null;
  origem?: string | null;
  indicado_por?: string | null;
  score?: string | null;
  anotacoes?: string | null;
};

export async function createLead(
  payload: LeadPayload
): Promise<{ data?: Record<string, unknown>; error?: string }> {
  const serverClient = await createSupabaseServerClient();
  const {
    data: { user },
  } = await serverClient.auth.getUser();

  if (!user) redirect('/admin/login');

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('leads')
    .insert([{ ...payload, estagio: 'identificado', created_at: new Date().toISOString() }])
    .select()
    .single();

  if (error) return { error: error.message };
  return { data: data as Record<string, unknown> };
}
