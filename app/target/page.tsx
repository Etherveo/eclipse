import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserSession } from '@/types';
import FormTarget from './FormTarget';

export default async function TargetPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_kas');

  if (!sessionCookie) {
    redirect('/login');
  }

  const user: UserSession = JSON.parse(sessionCookie.value);

  // Proteksi: Cek kalau bukan admin, tendang balik ke beranda
  if (user.role !== 'admin') {
    redirect('/');
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12">
      <FormTarget />
    </main>
  );
}