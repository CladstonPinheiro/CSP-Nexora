import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { respostaErro } from './errors.ts';

interface AuthOk {
  ok: true;
  supabase: SupabaseClient;
}

interface AuthFalha {
  ok: false;
  response: Response;
}

// Autentica via SUPABASE_SERVICE_ROLE_KEY (mesma chave já usada em
// lib/supabase.ts / createAdminClient no projeto Next.js). Sem tabela
// de tokens própria — único consumidor esperado é o n8n da Kátia.
export function validarAuth(req: Request): AuthOk | AuthFalha {
  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  if (!serviceRoleKey || !token || token !== serviceRoleKey) {
    return {
      ok: false,
      response: respostaErro(401, 'TOKEN_INVALIDO', 'Token ausente ou inválido.'),
    };
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    serviceRoleKey,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  return { ok: true, supabase };
}
