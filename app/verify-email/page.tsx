import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserSession } from '@/types';
import { supabase } from '@/lib/supabase';
import FormVerify from './FormVerify';

export default async function VerifyEmailPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_kas');

  // Kalau nggak ada session, balik ke login
  if (!sessionCookie) redirect('/login');

  const user: UserSession = JSON.parse(sessionCookie.value);

  // Tarik data email dari database menggunakan ID dari cookie
  const { data: uData } = await supabase
    .from('users')
    .select('email')
    .eq('id', user.id)
    .single();

  if (!uData) redirect('/login');

  // Lempar datanya ke FormVerify (Client Component)
  return <FormVerify userId={user.id} userEmail={uData.email} />;
}