import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserSession } from '@/types';
import Link from 'next/link';
import AdminRequestActions from './components/AdminRequestActions';

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
    <main className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Background Glow Effect */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-10 relative z-10">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-slate-800/60 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold tracking-widest uppercase">System Control</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white">Eclipse<span className="text-indigo-500">.</span>Dev</h1>
          </div>
          <div className="flex items-center gap-4 bg-slate-900/50 border border-slate-800 rounded-2xl p-2 pr-4 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Logged in as</p>
              <p className="text-sm font-bold text-slate-100">{user.username}</p>
            </div>
            <Link href="/profil" className="ml-4 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600 px-4 py-2 rounded-xl transition-all text-sm font-medium shadow-sm">
              ⚙️ Profil
            </Link>
          </div>
        </header>

        {/* --- BANNER REQUEST ADMIN (Muncul jika ada) --- */}
        {pendingAdmins && pendingAdmins.length > 0 && (
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 shadow-lg shadow-amber-500/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-2xl">
                🔔
              </div>
              <div>
                <h3 className="text-amber-400 font-bold text-lg">Ada {pendingAdmins.length} Request Admin Baru!</h3>
                <p className="text-amber-500/70 text-sm mt-0.5">Harap segera tinjau kredensial KTM mereka di tabel bawah.</p>
              </div>
            </div>
            <a href="#request-table" className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition-colors shadow-md text-sm whitespace-nowrap">
              Tinjau Sekarang
            </a>
          </div>
        )}

        {/* --- SECTION 1: GLOBAL STATISTICS --- */}
        <section>
          <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
            <span className="text-indigo-400">🌍</span> Global Metrics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 hover:border-slate-700 p-6 rounded-3xl transition-colors">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-3">Kelompok</p>
              <p className="text-4xl font-black text-white">{totalGroups}</p>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 hover:border-slate-700 p-6 rounded-3xl transition-colors">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-3">Total Users</p>
              <p className="text-4xl font-black text-sky-400">{totalUsers}</p>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 hover:border-slate-700 p-6 rounded-3xl transition-colors">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-3">Total Admin</p>
              <p className="text-4xl font-black text-purple-400">{totalAdmins}</p>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 hover:border-slate-700 p-6 rounded-3xl transition-colors">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-3">Total Anggota</p>
              <p className="text-4xl font-black text-emerald-400">{totalAnggota}</p>
            </div>
            <div className="bg-indigo-500/10 backdrop-blur-sm border border-indigo-500/20 hover:border-indigo-500/40 p-6 rounded-3xl transition-colors relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-indigo-500/20 rounded-full blur-xl"></div>
              <p className="text-xs text-indigo-300 font-semibold uppercase tracking-widest mb-3 relative z-10">Aktivitas Hari Ini</p>
              <p className="text-4xl font-black text-indigo-400 relative z-10">{globalTodayActivity} <span className="text-sm font-medium opacity-60">Trx</span></p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- SECTION 2: PER-GROUP STATISTICS --- */}
          <section className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-purple-400">📊</span> Statistik Per Kelompok
            </h2>
            <div className="flex flex-col gap-4">
              {groupStats.length === 0 ? (
                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 text-center text-slate-500 text-sm">
                  Belum ada kelompok yang terdaftar di sistem.
                </div>
              ) : (
                groupStats.map((group) => (
                  <div key={group.id} className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-5 hover:bg-slate-900/80 transition-colors">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                      <h3 className="font-bold text-slate-200">{group.name}</h3>
                      <span className="text-xs font-semibold bg-slate-800 text-slate-400 px-2.5 py-1 rounded-md">
                        {group.totalUsers} User
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-slate-950/50 rounded-xl p-2 border border-slate-800/50">
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Admin</p>
                        <p className="text-lg font-black text-purple-400">{group.admins}</p>
                      </div>
                      <div className="bg-slate-950/50 rounded-xl p-2 border border-slate-800/50">
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Anggota</p>
                        <p className="text-lg font-black text-emerald-400">{group.anggota}</p>
                      </div>
                      <div className="bg-indigo-950/30 rounded-xl p-2 border border-indigo-500/10">
                        <p className="text-[10px] text-indigo-400/70 font-bold uppercase mb-1">Trx Today</p>
                        <p className="text-lg font-black text-indigo-400">{group.activity}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* --- SECTION 3: REQUEST REGISTRASI ADMIN --- */}
          <section className="lg:col-span-2 space-y-4" id="request-table">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-rose-400">🛡️</span> Otorisasi Admin Baru
            </h2>
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl overflow-hidden shadow-xl shadow-black/20">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/80 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="p-5 font-semibold border-b border-slate-800">Pendaftar</th>
                      <th className="p-5 font-semibold border-b border-slate-800">Identitas KTM</th>
                      <th className="p-5 font-semibold border-b border-slate-800">Waktu</th>
                      <th className="p-5 font-semibold border-b border-slate-800 text-right">Keputusan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!pendingAdmins || pendingAdmins.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-10 text-center text-slate-500">
                          <div className="text-3xl mb-3 opacity-50">☕</div>
                          Semua request sudah tertangani. Santai dulu!
                        </td>
                      </tr>
                    ) : (
                      pendingAdmins.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-800/30 text-slate-300 text-sm transition-colors border-b border-slate-800/50 last:border-0">
                          <td className="p-5 align-top">
                            <p className="font-bold text-slate-200">@{req.username}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{req.email}</p>
                          </td>
                          <td className="p-5 align-top">
                            <p className="font-semibold text-slate-300">{req.full_name}</p>
                            {/* Placeholder untuk tombol view KTM */}
                            <button className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline mt-1.5 flex items-center gap-1">
                              📄 Buka Dokumen KTM
                            </button>
                          </td>
                          <td className="p-5 align-top whitespace-nowrap text-slate-400">
                            {new Date(req.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="p-5 align-top text-right">
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

        </div>
      </div>
    </main>
  );
}