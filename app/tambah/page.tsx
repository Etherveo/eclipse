import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import FormKas from './FormKas'; // Memanggil Client Component form
import { UserSession } from '@/types';

export default async function TambahPage() {
  // Ambil session dari cookies untuk dapat ID User
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_kas');

  if (!sessionCookie) {
    redirect('/login');
  }

  const user: UserSession = JSON.parse(sessionCookie.value);

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12">
      {/* Melempar ID User ke FormKas */}
      <FormKas userId={user.id} />
    </main>
  );
}