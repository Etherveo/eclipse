import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { UserSession } from '@/types';
import StudentActionButtons from './components/StudentActionButtons';

export default async function ManageStudentPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_kas');

  if (!sessionCookie) redirect('/login');
  
  const user: UserSession = JSON.parse(sessionCookie.value);
  
  // Proteksi: Cuma admin yang boleh masuk sini dan harus punya grup
  if (user.role !== 'admin' || !user.group_id) redirect('/');

  // Ambil data user HANYA yang ada di kelompok Admin ini
  const { data: usersData, error } = await supabase
    .from('users')
    .select('id, full_name, username, role, title, approval_status, created_at')
    .eq('group_id', user.group_id)
    .neq('role', 'developer') // Developer disembunyikan dari list
    .order('created_at', { ascending: false });

  if (error) console.error(error);
  const usersList = usersData || [];

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center text-sm text-gray-600">
          <Link href="/admin" className="hover:text-blue-600 hover:underline font-medium">← Kembali ke Dashboard</Link>
          <p>Login sebagai: <span className="font-bold">{user.name}</span></p>
        </div>

        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Daftar Anggota Kelompok</h2>
              <p className="text-sm text-gray-500 mt-1">Kelola akses login dan peran anggota kelas</p>
            </div>
            <Link href="/admin/student/tambah" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-sm">
              + Tambah Anggota
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm">
                  <th className="p-4 font-medium border-b">Nama Lengkap</th>
                  <th className="p-4 font-medium border-b">Username</th>
                  <th className="p-4 font-medium border-b">Jabatan</th>
                  <th className="p-4 font-medium border-b">Role</th>
                  <th className="p-4 font-medium border-b">Status</th>
                  <th className="p-4 font-medium border-b text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {usersList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500 italic">Belum ada anggota di kelas ini.</td>
                  </tr>
                ) : (
                  usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 text-gray-700 text-sm">
                      <td className="p-4 border-b font-bold text-gray-900">{u.full_name}</td>
                      <td className="p-4 border-b">@{u.username}</td>
                      <td className="p-4 border-b">{u.title || '-'}</td>
                      <td className="p-4 border-b">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 border-b">
                         <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                          u.approval_status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                          u.approval_status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {u.approval_status}
                        </span>
                      </td>
                      <td className="p-4 border-b text-right">
                        <StudentActionButtons 
                          userId={u.id} 
                          targetName={u.full_name} 
                          currentUserId={user.id} 
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </main>
  );
}