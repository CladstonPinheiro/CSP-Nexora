'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase';
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
