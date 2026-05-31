import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { UserSession } from '@/types';

export default async function LaporanAngsuranPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_kas');

  if (!sessionCookie) redirect('/login');
  const user: UserSession = JSON.parse(sessionCookie.value);

  // Proteksi Lapis Ganda khusus Admin
  if (user.role !== 'admin') redirect('/');
  if (!user.group_id) redirect('/onboarding');

  // 1. Fetch Nama Kelompok (Grup)
  const { data: groupData } = await supabase
    .from('groups')
    .select('name')
    .eq('id', user.group_id)
    .single();
  const groupName = groupData?.name || 'Kelompok Tidak Diketahui';

  // 2. Fetch Data Anggota yang memiliki hutang di kelompok ini
  const { data: membersData, error } = await supabase
    .from('users')
    .select('id, full_name, username, role, debt_balance, created_at')
    .eq('group_id', user.group_id)
    .gt('debt_balance', 0)
    .order('full_name', { ascending: true });

  if (error) console.error('Error fetching loans data:', error);
  const members = (membersData as any[]) || [];

  // 3. Kalkulasi Server-Side berdasarkan kolom debt_balance
  const totalRemainingCollectible = members.reduce((acc, curr) => acc + (curr.debt_balance || 0), 0);
  const activeBorrowersCount = members.filter(m => (m.debt_balance || 0) > 0).length;

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1">
              <Link href="/report" className="hover:text-blue-600 transition">Laporan Utama</Link>
              <span>/</span>
              <span className="text-gray-600">Angsuran Admin</span>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Laporan Angsuran Pinjaman</h1>
            <p className="text-xs font-semibold text-blue-600 flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block"></span>
              Khusus Admin — {groupName}
            </p>
          </div>
          
          <Link 
            href="/report" 
            className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-200 transition text-center shrink-0"
          >
            ⬅️ Kembali ke Laporan
          </Link>
        </div>

        {/* Info Ringkasan (Cards Summary) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">Total Sisa Piutang</p>
            <p className="text-2xl font-black text-amber-600 mt-1">
              Rp {totalRemainingCollectible.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Anggota Punya Tanggungan</p>
            <p className="text-2xl font-black text-gray-900 mt-1">
              {activeBorrowersCount} <span className="text-sm font-normal text-gray-500">Orang</span>
            </p>
          </div>
        </div>

        {/* Tabel Utama Laporan Angsuran */}
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">Daftar Tanggungan Pinjaman Anggota</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-semibold">
                  <th className="p-4 border-b">Nama Anggota</th>
                  <th className="p-4 border-b">Username</th>
                  <th className="p-4 border-b">Role</th>
                  <th className="p-4 border-b text-right">Sisa Hutang / Tagihan</th>
                  <th className="p-4 border-b text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-500 italic text-sm">
                      Belum ada yang memiliki tanggungan pinjaman di kelompok.
                    </td>
                  </tr>
                ) : (
                  members.map((member) => {
                    const hasDebt = (member.debt_balance || 0) > 0;
                    return (
                      <tr key={member.id} className="hover:bg-gray-50/50 text-gray-700 text-sm transition-colors">
                        <td className="p-4 border-b">
                          <p className="font-bold text-gray-900">{member.full_name}</p>
                        </td>
                        <td className="p-4 border-b text-gray-500">
                          @{member.username}
                        </td>
                        <td className="p-4 border-b capitalize text-gray-500">
                          {member.role}
                        </td>
                        <td className={`p-4 border-b text-right font-bold ${hasDebt ? 'text-amber-600' : 'text-gray-400'}`}>
                          Rp {(member.debt_balance || 0).toLocaleString('id-ID')}
                        </td>
                        <td className="p-4 border-b text-center whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                            !hasDebt
                              ? 'border-green-200 text-green-700 bg-green-50'
                              : 'border-amber-200 text-amber-700 bg-amber-50'
                          }`}>
                            {!hasDebt ? 'LUNAS' : 'ADA TANGGUNGAN'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </main>
  );
}