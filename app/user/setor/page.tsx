import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserSession } from '@/types';
import FormSetor from './FormSetor';

export default async function SetorKasUserPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_kas');

  if (!sessionCookie) redirect('/login');
  
  const user: UserSession = JSON.parse(sessionCookie.value);

  if (user.role === 'admin') redirect('/');

  // Ambil Data QRIS untuk dilempar ke form
  const { data: settingsData } = await supabase
    .from('class_settings')
    .select('qris_url')
    .eq('id', 1)
    .single();
    
  const qrisUrl = settingsData?.qris_url || null;

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-xl mx-auto mb-4">
        <p className="text-sm text-gray-600">Login sebagai: <span className="font-bold">{user.name}</span></p>
      </div>
      {/* Lempar qrisUrl ke komponen form */}
      <FormSetor userId={user.id} qrisUrl={qrisUrl} />
    </main>
  );
}