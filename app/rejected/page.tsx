import LogoutButton from '@/app/components/LogoutButton';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserSession } from '@/types';

export default async function RejectedPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_kas');

  if (!sessionCookie) redirect('/login');
  
  const user: UserSession = JSON.parse(sessionCookie.value);

  // Jika ternyata statusnya bukan rejected, kembalikan ke root
  if (user.approval_status === 'approved') redirect('/');
  if (user.approval_status === 'pending') redirect('/pending');

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
        
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">
          🚫
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pendaftaran Ditolak</h1>
        
        <div className="bg-red-50 text-red-800 text-sm p-4 rounded-xl mb-6 border border-red-100">
          Mohon maaf <strong>{user.name}</strong>, pengajuan akun kamu sebagai <strong>{user.role.toUpperCase()}</strong> tidak dapat disetujui oleh pengurus sistem.
        </div>
        
        <p className="text-gray-500 text-sm mb-8">
          Pastikan data yang kamu masukkan (seperti Foto KTM atau identitas diri) valid dan sesuai. Silakan hubungi {user.role === 'admin' ? 'Developer' : 'Ketua Kelas / Admin'} untuk informasi lebih lanjut.
        </p>

        <div className="pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-3">Selesai?</p>
          <div className="flex justify-center">
            <LogoutButton />
          </div>
        </div>

      </div>
    </main>
  );
}