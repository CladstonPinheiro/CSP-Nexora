'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import type { LeadProspeccaoStatus } from './_components/types';

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

export async function updateLeadStatus(
  id: string,
  status: LeadProspeccaoStatus
): Promise<{ error?: string }> {
  const user = await getAuthUser();
  if (!user) redirect('/admin/login');

  const supabase = createAdminClient();
  const { error } = await supabase.from('leads_prospeccao').update({ status }).eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/prospeccao');
  return {};
}
