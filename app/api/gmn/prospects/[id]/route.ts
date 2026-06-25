import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const { id } = await params;
  const supabaseAdmin = createAdminClient();

  const { error } = await supabaseAdmin
    .from('gmn_prospects')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[gmn/prospects/delete] erro:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const supabaseAdmin = createAdminClient();

  const { error } = await supabaseAdmin
    .from('gmn_prospects')
    .update(body)
    .eq('id', id);

  if (error) {
    console.error('[gmn/prospects/patch] erro:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
