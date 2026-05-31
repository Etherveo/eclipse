import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserSession } from '@/types';
import Link from 'next/link';
import AdminRequestActions from './components/AdminRequestActions';
import DeleteGroupButton from './components/DeleteGroupButton';

export default async function DevDashboard() {
  // 1. Cek Sesi (Hanya Developer)
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_kas');

  if (!sessionCookie) redirect('/login');
  
  const user: UserSession = JSON.parse(sessionCookie.value);
  if (user.role !== 'developer') redirect('/');

  // 2. Fetch Data Paralel
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    { data: allGroups },
    { data: allUsers },
    { data: todayTransactions },
    { data: pendingAdmins }
  ] = await Promise.all([
    supabase.from('groups').select('id, name'),
    supabase.from('users').select('id, group_id, role, approval_status'),
    supabase.from('transactions').select('id, group_id').gte('created_at', today.toISOString()),
    supabase.from('users')
      .select('id, username, full_name, email, created_at')
      .eq('role', 'admin')
      .eq('approval_status', 'pending')
      .order('created_at', { ascending: false })
  ]);

  // 3. Olah Data Statistik Global
  const totalGroups = allGroups?.length || 0;
  const totalUsers = allUsers?.filter(u => u.approval_status === 'approved').length || 0;
  const totalAdmins = allUsers?.filter(u => u.role === 'admin' && u.approval_status === 'approved').length || 0;
  const totalAnggota = allUsers?.filter(u => u.role === 'anggota' && u.approval_status === 'approved').length || 0;
  const globalTodayActivity = todayTransactions?.length || 0;

  // 4. Olah Data Statistik Per Kelompok
  const groupStats = allGroups?.map(group => {
    const usersInGroup = allUsers?.filter(u => u.group_id === group.id && u.approval_status === 'approved') || [];
    const admins = usersInGroup.filter(u => u.role === 'admin').length;
    const anggota = usersInGroup.filter(u => u.role === 'anggota').length;
    const activity = todayTransactions?.filter(t => t.group_id === group.id).length || 0;

    return {
      id: group.id,
      name: group.name,
      totalUsers: usersInGroup.length,
      admins,
      anggota,
      activity
    };
  }) || [];

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* --- BANNER REQUEST ADMIN (Muncul jika ada) --- */}
        {pendingAdmins && pendingAdmins.length > 0 && (
          <section className="bg-amber-50 border border-amber-200 rounded-3xl overflow-hidden shadow-sm">
            {/* Menggunakan flex-col (mobile) dan md:flex-row (desktop) */}
            <div className="p-4 border-b border-amber-200 flex justify-between flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-4 bg-amber-500">
              <h2 className="text-sm font-bold text-black flex items-center gap-2 shrink-0">
                <span>🔔</span> Ada {pendingAdmins.length} Request Admin Baru!
              </h2>
              {/* Ditambahkan text-sm dan warna teks senada agar lebih rapi */}
              <p className="text-sm text-black/90">
                Silakan tinjau kredensial mereka pada tabel otorisasi di bawah.
              </p>
            </div>
          </section>
        )}
        
        {/* --- HEADER BAR --- */}
        <div className="flex justify-between rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-gray-900 leading-tight">{user.name}</p>
              <p className="text-xs font-semibold text-blue-600 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block animate-pulse"></span>
                System Developer
              </p>
            </div>
          </div>
          <Link href="/profil" className="w-20 sm:w-auto text-center flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl hover:bg-gray-100 transition shadow-sm font-medium text-gray-700 text-sm">
            <span>⚙️</span> Profil
          </Link>
        </div>

        {/* KOLOM KIRI: REQUEST ADMIN */}
          <section className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-gray-800 text-center">
              Otorisasi Admin Baru
            </h2>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-semibold">
                      <th className="p-4 border-b">Pendaftar</th>
                      <th className="p-4 border-b">Identitas KTM/KTP</th>
                      <th className="p-4 border-b">Waktu</th>
                      <th className="p-4 border-b text-right">Keputusan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!pendingAdmins || pendingAdmins.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-10 text-center text-gray-500 text-sm">
                          <span className="block text-3xl mb-2 opacity-50">☕</span>
                          Semua request sudah tertangani. Santai dulu!
                        </td>
                      </tr>
                    ) : (
                      pendingAdmins.map((req) => (
                        <tr key={req.id} className="hover:bg-gray-50/50 text-gray-700 text-sm transition-colors">
                          <td className="p-4 border-b align-top">
                            <p className="font-bold text-gray-900">@{req.username}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{req.email}</p>
                          </td>
                          <td className="p-4 border-b align-top">
                            <p className="font-semibold text-gray-800">{req.full_name}</p>
                            <button className="text-xs text-blue-600 hover:text-blue-800 hover:underline mt-1 flex items-center gap-1 font-medium">
                              📄 Buka Dokumen
                            </button>
                          </td>
                          <td className="p-4 border-b align-top whitespace-nowrap text-gray-500 text-xs">
                            {new Date(req.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="p-4 border-b align-top text-right">
                            <AdminRequestActions userId={req.id} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

        {/* --- SECTION 1: GLOBAL STATISTICS --- */}
        <section>
          <h2 className="text-lg text-center font-bold text-gray-800 mb-4">
            Global Metrics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Kelompok</p>
              <p className="text-3xl font-black text-gray-900">{totalGroups}</p>
            </div>
            <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm">
              <p className="text-xs text-blue-500 font-bold uppercase tracking-wider mb-2">Total Users</p>
              <p className="text-3xl font-black text-blue-600">{totalUsers}</p>
            </div>
            <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm">
              <p className="text-xs text-purple-500 font-bold uppercase tracking-wider mb-2">Total Admin</p>
              <p className="text-3xl font-black text-purple-600">{totalAdmins}</p>
            </div>
            <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm">
              <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider mb-2">Total Anggota</p>
              <p className="text-3xl font-black text-emerald-600">{totalAnggota}</p>
            </div>
          </div>
          <div className="w-full text-center bg-white border border-gray-100 p-5 rounded-2xl shadow-sm">
            <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-2">Aktivitas Hari Ini</p>
            <p className="text-3xl font-black text-indigo-700">{globalTodayActivity} <span className="text-sm font-medium text-indigo-400">Trx</span></p>
          </div>
        </section>

        {/* --- LAYOUT 2 KOLOM (KIRI: REQUEST ADMIN | KANAN: LIST KELOMPOK) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* KOLOM KANAN: STATISTIK PER KELOMPOK */}
          <section className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span>📊</span> Statistik Kelompok
            </h2>
            <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2">
              {groupStats.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center text-gray-500 text-sm shadow-sm">
                  Belum ada kelompok yang terdaftar di sistem.
                </div>
              ) : (
                groupStats.map((group) => (
                  <div key={group.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:border-blue-200 transition-colors">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
                      <h3 className="font-bold text-gray-800">{group.name}</h3>
                      <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md">
                        {group.totalUsers} User
                      </span>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-3 gap-2 text-center">
                      <div className="bg-purple-100 rounded-xl p-2 border border-purple-100">
                        <p className="text-[10px] text-purple-600 font-bold uppercase mb-1">Admin</p>
                        <p className="text-lg font-black text-purple-700">{group.admins}</p>
                      </div>
                      <div className="bg-emerald-100 rounded-xl p-2 border border-emerald-100">
                        <p className="text-[10px] text-emerald-600 font-bold uppercase mb-1">Anggota</p>
                        <p className="text-lg font-black text-emerald-700">{group.anggota}</p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-2 border border-blue-100">
                        <p className="text-[10px] text-black font-bold uppercase mb-1">Trx Today</p>
                        <p className="text-lg font-black text-blue-700">{group.activity}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center">
                      <DeleteGroupButton groupId={group.id} groupName={group.name} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}