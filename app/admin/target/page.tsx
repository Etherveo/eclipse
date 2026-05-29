import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserSession } from '@/types';
import FormTarget from './FormTarget';

export default async function AdminTargetPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_kas');

  if (!sessionCookie) redirect('/login');
  const user: UserSession = JSON.parse(sessionCookie.value);
  if (user.role !== 'admin' || !user.group_id) redirect('/');

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center text-sm text-gray-600">
        <a href="/admin" className="hover:text-purple-600 hover:underline font-medium">← Kembali ke Dashboard</a>
      </div>
      <FormTarget />
    </main>
  );
}