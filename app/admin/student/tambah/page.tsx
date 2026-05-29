import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserSession } from '@/types';
import FormTambahAnggota from './FormTambahAnggota';

export default async function TambahAnggotaPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_kas');

  if (!sessionCookie) redirect('/login');
  
  const user: UserSession = JSON.parse(sessionCookie.value);
  
  if (user.role !== 'admin' || !user.group_id) redirect('/');

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-10">
      <FormTambahAnggota />
    </main>
  );
}