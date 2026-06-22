import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { AdminShell } from './_components/AdminShell';

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
    <div className="min-h-screen bg-[#050505] flex">
      <AdminShell userEmail={user.email ?? ''} />
      <main className="flex-1 md:ml-60 min-h-screen overflow-x-hidden pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
