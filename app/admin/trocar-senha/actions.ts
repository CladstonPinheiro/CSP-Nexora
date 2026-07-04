'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { validarSenhaForte } from '@/lib/passwordValidation';

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

export async function trocarSenha(
  novaSenha: string
): Promise<{ error?: string }> {
  const user = await getAuthUser();
  if (!user) redirect('/admin/login');

  const erroForca = validarSenhaForte(novaSenha);
  if (erroForca) return { error: erroForca };

  const supabase = createAdminClient();

  const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
    password: novaSenha,
  });
  if (updateError) return { error: updateError.message };

  const { error: perfilError } = await supabase
    .from('perfis')
    .update({ deve_trocar_senha: false })
    .eq('id', user.id);
  if (perfilError) return { error: perfilError.message };

  return {};
}
