import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { UserSession } from '@/types';

export default async function ManageStudentPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_kas');

  if (!sessionCookie) redirect('/login');
  
  const user: UserSession = JSON.parse(sessionCookie.value);
  
  // Proteksi: Cuma admin yang boleh masuk sini
  if (user.role !== 'admin') redirect('/');

  // Ambil data semua user
  const { data: usersData, error } = await supabase
    .from('users')
    .select('id, name, username, role, title, created_at')
    .order('created_at', { ascending: false });

  if (error) console.error(error);
  const usersList = usersData || [];

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600 hover:underline">← Kembali ke Dashboard</Link>
          <p>Login sebagai: <span className="font-bold">{user.name}</span></p>
        </div>

        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Daftar Anggota Kelas</h2>
              <p className="text-sm text-gray-500 mt-1">Kelola akses login mahasiswa dan pengurus</p>
            </div>
            <Link href="/student/tambah" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
              + Tambah Mahasiswa
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm">
                  <th className="p-4 font-medium border-b">Nama Lengkap</th>
                  <th className="p-4 font-medium border-b">Username</th>
                  <th className="p-4 font-medium border-b">Jabatan</th>
                  <th className="p-4 font-medium border-b">Role Sistem</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 text-gray-700 text-sm">
                    <td className="p-4 border-b font-medium text-gray-900">{u.name}</td>
                    <td className="p-4 border-b">{u.username}</td>
                    <td className="p-4 border-b">{u.title || '-'}</td>
                    <td className="p-4 border-b">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </main>
  );
}