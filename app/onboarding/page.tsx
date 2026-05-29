import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserSession } from '@/types';
import { supabase } from '@/lib/supabase';
import FormOnboarding from './FormOnboarding';

export default async function OnboardingPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_kas');

  if (!sessionCookie) redirect('/login');
  
  const user: UserSession = JSON.parse(sessionCookie.value);

  // Jika ternyata sudah punya grup, kembalikan ke Root
  if (user.group_id) redirect('/');

  // Tarik daftar kelompok yang ada untuk dropdown Anggota
  const { data: groups } = await supabase
    .from('groups')
    .select('id, name')
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6 py-12">
      <FormOnboarding 
        userId={user.id} 
        role={user.role} 
        userName={user.name} 
        availableGroups={groups || []} 
      />
    </main>
  );
}