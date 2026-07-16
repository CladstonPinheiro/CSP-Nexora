import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { AdminShell } from './_components/AdminShell';
import { ThemeProvider } from './_components/ThemeProvider';

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="csp-admin-theme">
      <div className="min-h-screen bg-page flex">
        <AdminShell userEmail={user.email ?? ''} />
        <main className="flex-1 md:ml-60 min-h-screen overflow-x-hidden pt-14 md:pt-0">
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}
