import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserSession } from '@/types';
import Link from 'next/link';
import FormSetor from './FormSetor';

export default async function SetorKasUserPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_kas');

  if (!sessionCookie) redirect('/login');
  
  const user: UserSession = JSON.parse(sessionCookie.value);

  // Lempar admin dan user yang belum punya grup
  if (user.role === 'admin' || !user.group_id) redirect('/');

  // Ambil Data QRIS berdasarkan group_id
  const { data: settingsData } = await supabase
    .from('class_settings')
    .select('qris_url')
    .eq('group_id', user.group_id)
    .single();
    
  const qrisUrl = settingsData?.qris_url || null;

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-xl mx-auto mb-4">
        <Link href="/user" className="text-gray-500 hover:text-emerald-600 hover:underline text-sm font-medium mb-2 block">← Kembali ke Dashboard</Link>
        <p className="text-sm text-gray-600">Login sebagai: <span className="font-bold">{user.name}</span></p>
      </div>
      <FormSetor qrisUrl={qrisUrl} />
    </main>
  );
}