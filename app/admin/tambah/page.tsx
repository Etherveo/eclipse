import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserSession } from '@/types';
import FormTambahKas from './FormTambahKas';

export default async function AdminTambahKasPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_kas');

  if (!sessionCookie) redirect('/login');
  
  const user: UserSession = JSON.parse(sessionCookie.value);
  
  // Proteksi: Hanya admin yang punya grup yang boleh mengakses
  if (user.role !== 'admin' || !user.group_id) redirect('/');

  // Ambil daftar anggota yang berada di kelompok yang sama dan statusnya sudah di-acc
  const { data: members, error } = await supabase
    .from('users')
    .select('id, full_name, role')
    .eq('group_id', user.group_id)
    .eq('approval_status', 'approved')
    .order('full_name', { ascending: true });

  if (error) console.error('Error fetching members:', error);

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center text-sm text-gray-600">
        <a href="/admin" className="hover:text-blue-600 hover:underline font-medium">← Kembali ke Dashboard</a>
      </div>
      <FormTambahKas members={members || []} currentUserId={user.id} />
    </main>
  );
}