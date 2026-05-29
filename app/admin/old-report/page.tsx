import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserSession } from '@/types';
import Link from 'next/link';
import FilterLaporan from './FilterLaporan';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminReportPage({ searchParams }: PageProps) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_kas');

  if (!sessionCookie) redirect('/login');
  const user: UserSession = JSON.parse(sessionCookie.value);
  if (user.role !== 'admin' || !user.group_id) redirect('/');

  const resolvedParams = await searchParams;
  const filter = typeof resolvedParams.filter === 'string' ? resolvedParams.filter : 'bulan_ini';

  // Logika Matematika Tanggal
  const now = new Date();
  let start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  let end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  let applyDateFilter = true;

  switch(filter) {
    case 'semua':
      applyDateFilter = false;
      break;
    case 'kemarin':
      start.setDate(start.getDate() - 1);
      end.setDate(end.getDate() - 1);
      break;
    case 'spesifik_hari':
      if (typeof resolvedParams.date === 'string') {
        start = new Date(resolvedParams.date);
        end = new Date(resolvedParams.date); end.setHours(23,59,59);
      }
      break;
    case 'mingguan':
      start.setDate(start.getDate() - 7);
      break;
    case 'bulan_ini':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      break;
    case 'spesifik_bulan':
      if (typeof resolvedParams.month === 'string' && typeof resolvedParams.year === 'string') {
        const m = parseInt(resolvedParams.month) - 1;
        const y = parseInt(resolvedParams.year);
        start = new Date(y, m, 1);
        end = new Date(y, m + 1, 0, 23, 59, 59);
      }
      break;
    case 'triwulan':
      start.setMonth(start.getMonth() - 3);
      break;
    case 'caturwulan':
      start.setMonth(start.getMonth() - 4);
      break;
    case 'semester_ini':
      start.setMonth(start.getMonth() - 6);
      break;
    case 'spesifik_semester':
      if (typeof resolvedParams.semester === 'string' && typeof resolvedParams.angkatan === 'string') {
        const sem = parseInt(resolvedParams.semester);
        const angkatan = parseInt(resolvedParams.angkatan);
        const yearOffset = Math.floor((sem - 1) / 2); 
        const actualYear = angkatan + yearOffset;
        const isGanjil = sem % 2 !== 0; 
        
        start = new Date(actualYear, isGanjil ? 6 : 0, 1);
        end = new Date(actualYear, isGanjil ? 11 : 5, 31, 23, 59, 59);
      }
      break;
    case 'tahun_ini':
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      break;
    case 'spesifik_tahun':
      if (typeof resolvedParams.year === 'string') {
        const y = parseInt(resolvedParams.year);
        start = new Date(y, 0, 1);
        end = new Date(y, 11, 31, 23, 59, 59);
      }
      break;
  }

  // Bangun Query Dasar
  let query = supabase
    .from('transactions')
    .select('*, users:user_id(full_name)')
    .eq('group_id', user.group_id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false });

  // Terapkan rentang waktu jika bukan "semua"
  if (applyDateFilter) {
    query = query.gte('created_at', start.toISOString()).lte('created_at', end.toISOString());
  }

  const { data: transactionsData, error } = await query;
  if (error) console.error(error);

  const transactions = transactionsData || [];

  const totalPemasukan = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalPengeluaran = transactions.filter(t => t.type === 'outcome').reduce((acc, curr) => acc + curr.amount, 0);
  const saldoAkhir = totalPemasukan - totalPengeluaran;

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12 print:bg-white print:p-0">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center text-sm text-gray-600 print:hidden">
          <Link href="/admin" className="hover:text-amber-600 hover:underline font-medium">← Kembali ke Dashboard</Link>
          <p>Login sebagai: <span className="font-bold">{user.name}</span></p>
        </div>

        <FilterLaporan transactions={transactions} />

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 print:shadow-none print:border-none">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-widest">Laporan Kas Kelas</h1>
            <p className="text-gray-500 mt-1 font-medium">Periode Filter: {filter.replace('_', ' ').toUpperCase()}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-green-50/50 border border-green-100 p-4 rounded-xl text-center">
              <p className="text-xs text-green-600 font-bold uppercase tracking-wider">Total Pemasukan</p>
              <p className="text-xl font-black text-green-700 mt-1">Rp {totalPemasukan.toLocaleString('id-ID')}</p>
            </div>
            <div className="bg-red-50/50 border border-red-100 p-4 rounded-xl text-center">
              <p className="text-xs text-red-600 font-bold uppercase tracking-wider">Total Pengeluaran</p>
              <p className="text-xl font-black text-red-700 mt-1">Rp {totalPengeluaran.toLocaleString('id-ID')}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-center">
              <p className="text-xs text-gray-600 font-bold uppercase tracking-wider">Saldo Akhir Periode</p>
              <p className={`text-xl font-black mt-1 ${saldoAkhir >= 0 ? 'text-gray-900' : 'text-red-600'}`}>Rp {saldoAkhir.toLocaleString('id-ID')}</p>
            </div>
          </div>

          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-gray-900 text-gray-900">
                <th className="py-3 font-bold">Tanggal</th>
                <th className="py-3 font-bold">Keterangan</th>
                <th className="py-3 font-bold">Oleh</th>
                <th className="py-3 font-bold">Tipe</th>
                <th className="py-3 font-bold text-right">Nominal</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr><td colSpan={5} className="py-6 text-center text-gray-500 italic">Tidak ada transaksi pada periode ini.</td></tr>
              ) : (
                transactions.map((trx) => (
                  <tr key={trx.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 text-gray-600 whitespace-nowrap">{new Date(trx.created_at).toLocaleDateString('id-ID')}</td>
                    <td className="py-3 font-medium text-gray-900">{trx.notes}</td>
                    <td className="py-3 text-gray-600">{(trx.users as any)?.full_name || trx.user_snapshot?.full_name || '-'}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${trx.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {trx.type === 'income' ? 'Masuk' : 'Keluar'}
                      </span>
                    </td>
                    <td className={`py-3 text-right font-bold whitespace-nowrap ${trx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {trx.type === 'income' ? '+' : '-'} Rp {trx.amount.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="hidden print:flex justify-end mt-16 pt-8">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-16">Disetujui Oleh,</p>
              <p className="font-bold text-gray-900 underline">{user.name}</p>
              <p className="text-xs text-gray-500 mt-1">Admin / Bendahara Kelompok</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}