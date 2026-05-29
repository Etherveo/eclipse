import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserSession } from '@/types';
import FormEditAnggota from './FormEditAnggota';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAnggotaPage({ params }: PageProps) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_kas');
  if (!sessionCookie) redirect('/login');
  
  const user: UserSession = JSON.parse(sessionCookie.value);
  if (user.role !== 'admin' || !user.group_id) redirect('/');

  // Await parameter karena Next.js 15
  const resolvedParams = await params;
  const targetId = resolvedParams.id;

  // Fetch data user yang akan diedit
  const { data: targetUser } = await supabase
    .from('users')
    .select('id, full_name, username, email, phone_number, role, title, approval_status, social_links')
    .eq('id', targetId)
    .eq('group_id', user.group_id)
    .single();

  // Jika user tidak ditemukan, kembali ke halaman sebelumnya
  if (!targetUser) redirect('/admin/student');

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-10">
      <FormEditAnggota targetUser={targetUser} />
    </main>
  );
}