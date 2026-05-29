import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserSession } from '@/types';
import FormPinjaman from '@/app/components/FormPinjaman';
import Link from 'next/link';

export default async function UserPinjamPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_kas');

  if (!sessionCookie) redirect('/login');
  const user: UserSession = JSON.parse(sessionCookie.value);

  // Proteksi role
  if (user.role === 'admin' || !user.group_id) redirect('/');

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center text-sm text-gray-600">
        <Link href="/user" className="hover:text-rose-600 hover:underline font-medium">← Kembali ke Dashboard</Link>
        <p>Login sebagai: <span className="font-bold">{user.name}</span></p>
      </div>
      <FormPinjaman backRoute="/user" role={user.role} />
    </main>
  );
}