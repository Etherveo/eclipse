import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Transaction, UserSession, Target } from '@/types';
import Link from 'next/link';
import DashboardStats from '@/app/components/DashboardStats';
import QrisViewer from '@/app/components/QrisViewer';

export default async function UserDashboard() {
  // 1. Cek Sesi
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_kas');

  if (!sessionCookie) redirect('/login');
  const user: UserSession = JSON.parse(sessionCookie.value);

  // Proteksi tambahan: Harus anggota dan wajib punya group_id
  if (user.role === 'admin') redirect('/');
  if (!user.group_id) redirect('/onboarding');

  // 2. Fetch Nama Kelompok (Grup)
  const { data: groupData } = await supabase
    .from('groups')
    .select('name')
    .eq('id', user.group_id)
    .single();
  const groupName = groupData?.name || 'Kelompok Tidak Diketahui';

  // 3. Fetch Data Transaksi (Difilter sesuai group_id)
  const { data, error } = await supabase
    .from('transactions')
    .select(`*, users:user_id (full_name)`) // Sesuaikan kolom V2
    .eq('group_id', user.group_id)
    .order('created_at', { ascending: false });

  if (error) console.error('Error fetching data:', error);
  const transactions = (data as unknown) as Transaction[] || [];

  // 4. Fetch Data Target (Difilter sesuai group_id)
  const { data: targetData } = await supabase
    .from('targets')
    .select('*')
    .eq('group_id', user.group_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single(); 
  const currentTarget = targetData as Target | null;

  // 5. Fetch Data QRIS (Difilter sesuai group_id)
  const { data: settingsData } = await supabase
    .from('class_settings')
    .select('qris_url')
    .eq('group_id', user.group_id)
    .single();
  const qrisUrl = settingsData?.qris_url || null;

  // FETCH REQUEST PINJAMAN (Khusus jika User ini menjabat sebagai Ketua)
  let activeLoanRequest = null;
  // Cek apakah jabatannya ada unsur kata "ketua" (case-insensitive)
  if (user.title?.toLowerCase().includes('ketua')) {
    const { data: loanRequests } = await supabase
      .from('system_requests')
      .select('*')
      .eq('group_id', user.group_id)
      .eq('type', 'loan')
      .eq('target_role', 'ketua')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(1);
    
    activeLoanRequest = loanRequests?.[0] || null;
  }

  // 6. Kalkulasi Saldo
  const totalBalance = transactions.reduce((acc, curr) => {
    if (curr.status !== 'completed') return acc;
    return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
  }, 0);

  let progressPercent = 0;
  if (currentTarget && currentTarget.target_amount > 0) {
    progressPercent = (totalBalance / currentTarget.target_amount) * 100;
    if (progressPercent > 100) progressPercent = 100;
    if (progressPercent < 0) progressPercent = 0;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* --- HEADER BAR BARU --- */}
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-gray-900 leading-tight">{user.name}</p>
              <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block"></span>
                {groupName}
              </p>
            </div>
          </div>
          
          <Link href="/profil" className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-100 transition shadow-sm font-medium text-gray-700 text-sm">
            <span>⚙️</span> Profil
          </Link>
        </div>

        {/* --- SECTION 1: KARTU SALDO --- */}
        <header className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-emerald-50 opacity-50 pointer-events-none"></div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Total Kas</h1>
              <p className="text-gray-500 text-sm mt-1">Saldo aktif kelas saat ini</p>
            </div>
            <div className="mt-2 md:mt-0 md:text-right">
              <p className={`text-4xl font-black ${totalBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                Rp {totalBalance.toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          {currentTarget && (
            <div className="mt-6 bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl relative z-10">
              <div className="flex justify-between items-end mb-3">
                <div>
                  <p className="text-sm text-emerald-800 font-bold">Target {currentTarget.period_type}</p>
                  <p className="text-xs text-emerald-600/80 mt-0.5">{currentTarget.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-900">Rp {currentTarget.target_amount.toLocaleString('id-ID')}</p>
                  <p className="text-xs text-emerald-700 font-semibold mt-0.5">{progressPercent.toFixed(1)}% Tercapai</p>
                </div>
              </div>
              <div className="w-full bg-emerald-100 rounded-full h-3 overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>
          )}
        </header>

        {/* --- SECTION 2: MENU GRID 3 KOLOM --- */}
        <section className="grid grid-cols-2 gap-4">
          <Link href="/user/setor" className="bg-white hover:bg-emerald-50 border border-gray-100 p-5 rounded-3xl shadow-sm flex flex-col items-center justify-center gap-3 transition group">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">💸</div>
            <span className="font-semibold text-gray-700 text-sm">Setor Kas</span>
          </Link>

          <Link href="../report" className="bg-white hover:bg-amber-50 border border-gray-100 p-5 rounded-3xl shadow-sm flex flex-col items-center justify-center gap-3 transition group">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">📊</div>
            <span className="font-semibold text-gray-700 text-sm">Lihat Laporan</span>
          </Link>

          <Link href="/user/pinjam" className="bg-white hover:bg-rose-50 border border-gray-100 p-5 rounded-3xl shadow-sm flex flex-col items-center justify-center gap-3 transition group">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">💳</div>
            <span className="font-semibold text-gray-700 text-sm">Ajukan Pinjaman</span>
          </Link>
        </section>

        {/* --- SECTION 3: WIDGET STATISTIK --- */}
        <DashboardStats transactions={transactions} />

        {/* --- SECTION 4: QRIS VIEWER (READ-ONLY) --- */}
        <QrisViewer initialUrl={qrisUrl} role={user.role} />

        {/* --- SECTION 5: TABEL RIWAYAT TRANSAKSI --- */}
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">Riwayat Transaksi</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm">
                  <th className="p-4 font-medium border-b">Tanggal</th>
                  <th className="p-4 font-medium border-b">Keterangan</th>
                  <th className="p-4 font-medium border-b">Status</th>
                  <th className="p-4 font-medium border-b text-right">Nominal</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-gray-500 italic">Belum ada data kas.</td>
                  </tr>
                ) : (
                  transactions.map((trx) => (
                    <tr key={trx.id} className="hover:bg-gray-50/50 text-gray-700 text-sm">
                      <td className="p-4 border-b whitespace-nowrap">{new Date(trx.created_at).toLocaleDateString('id-ID')}</td>
                      <td className="p-4 border-b">
                        <p className="font-medium text-gray-900">{trx.notes || '-'}</p>
                        <p className="text-xs text-gray-500">Oleh: {(trx.users as any)?.full_name || trx.user_snapshot?.full_name || '-'}</p>
                        {trx.proof_image_url && <a href={trx.proof_image_url} target="_blank" className="text-xs text-emerald-500 hover:text-emerald-700 hover:underline mt-1 block font-medium">Lihat Bukti</a>}
                      </td>
                      <td className="p-4 border-b">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                          trx.status === 'completed' ? 'border-green-200 text-green-700 bg-green-50' :
                          trx.status === 'pending' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' :
                          'border-red-200 text-red-700 bg-red-50'
                        }`}>
                          {trx.status.toUpperCase()}
                        </span>
                      </td>
                      <td className={`p-4 border-b text-right font-bold whitespace-nowrap ${trx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {trx.type === 'income' ? '+' : '-'} Rp {trx.amount.toLocaleString('id-ID')}
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