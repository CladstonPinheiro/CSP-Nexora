'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';

function AdminLoginForm() {
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!executeRecaptcha) {
      setError('Verificação de segurança ainda carregando. Tente novamente em instantes.');
      setLoading(false);
      return;
    }

    const recaptchaToken = await executeRecaptcha('admin_login');

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, recaptchaToken }),
    });
    const body = await res.json();

    if (!res.ok) {
      setError(body.error ?? 'Erro ao entrar.');
      setLoading(false);
      return;
    }

    router.push('/admin');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-4 relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-1/4 right-1/3 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Link href="/" aria-label="Voltar ao site">
            <Image src="/logo.png" alt="CSP Nexora" width={207} height={113} className="w-[100px] h-auto object-contain" />
          </Link>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8 shadow-2xl">
          <div className="mb-7">
            <h1 className="font-outfit text-2xl font-black tracking-tight text-primary">
              Acesso Restrito
            </h1>
            <p className="text-muted text-sm mt-1">Painel administrativo CSP Nexora</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-primary text-sm placeholder-gray-700 focus:outline-none focus:border-cyan-500/40 focus:bg-white/[0.07] transition-all"
                placeholder="admin@cspnexora.com.br"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 pr-11 text-primary text-sm placeholder-gray-700 focus:outline-none focus:border-cyan-500/40 focus:bg-white/[0.07] transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary transition-colors p-1"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="relative group w-full mt-2"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-40 group-hover:opacity-70 transition duration-300 group-disabled:opacity-20" />
              <div className="relative w-full bg-white text-black py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60">
                {loading ? 'Autenticando...' : 'Entrar'}
              </div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ''}>
      <AdminLoginForm />
    </GoogleReCaptchaProvider>
  );
}
