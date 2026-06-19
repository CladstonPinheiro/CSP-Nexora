'use server';

import { createAdminClient } from '@/lib/supabase';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export type LeadPayload = {
  company_name: string;
  contact_name: string;
  niche?: string | null;
  city?: string | null;
  phone?: string | null;
  email?: string | null;
  linkedin?: string | null;
  instagram?: string | null;
  website?: string | null;
  source?: string | null;
  referred_by?: string | null;
  score?: string | null;
  notes?: string | null;
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
    .insert([{ ...payload, stage: 'identificado', created_at: new Date().toISOString() }])
    .select()
    .single();

  if (error) return { error: error.message };
  return { data: data as Record<string, unknown> };
}
