import LogoutButton from '@/app/components/LogoutButton';
import CheckStatusButton from './CheckStatusButton';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserSession } from '@/types';

export default async function PendingPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_kas');

  if (!sessionCookie) redirect('/login');
  
  const user: UserSession = JSON.parse(sessionCookie.value);

  // Jika ternyata sudah di-approve, kembalikan ke root biar diarahkan ke dashboard
  if (user.approval_status === 'approved') redirect('/');
  if (user.approval_status === 'rejected') redirect('/rejected');

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
        
        <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">
          ⏳
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Menunggu Persetujuan</h1>
        
        <div className="bg-amber-50 text-amber-800 text-sm p-4 rounded-xl mb-6 border border-amber-100">
          Halo <strong>{user.name}</strong>, akun kamu berhasil didaftarkan sebagai <strong>{user.role.toUpperCase()}</strong>, namun saat ini masih dalam antrean peninjauan.
        </div>
        
        <p className="text-gray-500 text-sm mb-8">
          Silakan hubungi {user.role === 'admin' ? 'Developer' : 'Ketua Kelas / Admin'} untuk mempercepat proses persetujuan. Kamu bisa mengecek status secara berkala dengan login kembali nanti.
        </p>

        <CheckStatusButton />

        <div className="pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-3">Keluar untuk mengganti akun</p>
          <div className="flex justify-center">
            <LogoutButton />
          </div>
        </div>

      </div>
    </main>
  );
}