import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const supabaseAdmin = createAdminClient();

  const { data, error } = await supabaseAdmin
    .from('gmn_prospects')
    .select('id, company_name, city, niche, phone, lead_cadastrado, lead_id, created_at, services, address, instagram, facebook, whatsapp, description')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('[gmn/prospects] erro ao buscar:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [] });
}
