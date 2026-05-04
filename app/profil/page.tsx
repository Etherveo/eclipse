import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserSession } from '@/types';
import FormProfil from './FormProfil';

export default async function ProfilPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_kas');

  if (!sessionCookie) redirect('/login');
  const session: UserSession = JSON.parse(sessionCookie.value);

  // Fetch full data user dari database
  const { data: userData, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.id)
    .single();

  if (error || !userData) {
    console.error('Gagal fetch user:', error);
    redirect('/');
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12">
      <FormProfil userData={userData} />
    </main>
  );
}