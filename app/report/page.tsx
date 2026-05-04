import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Transaction, UserSession } from '@/types';
import ReportFilter from './ReportFilter';

export default async function ReportPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_kas');
  if (!sessionCookie) redirect('/login');
  const user: UserSession = JSON.parse(sessionCookie.value);

  // 1. Ambil & Await Search Params
  const searchParams = await props.searchParams;
  const mode = searchParams.mode || 'bulan_ini';
  
  // 2. Logika Matematika Tanggal untuk Filter
  const now = new Date();
  let start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  let end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  switch(mode) {
    case 'kemarin':
      start.setDate(start.getDate() - 1);
      end.setDate(end.getDate() - 1);
      break;
    case 'spesifik_hari':
      if (searchParams.date) {
        start = new Date(searchParams.date);
        end = new Date(searchParams.date); end.setHours(23,59,59);
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
      if (searchParams.month && searchParams.year) {
        const m = parseInt(searchParams.month) - 1;
        const y = parseInt(searchParams.year);
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
      // Logika Universitas Indo: Semester Ganjil (Jul-Des), Genap (Jan-Jun)
      if (searchParams.semester && searchParams.angkatan) {
        const sem = parseInt(searchParams.semester);
        const angkatan = parseInt(searchParams.angkatan);
        const yearOffset = Math.floor(sem / 2); // sem 1=0, sem 2=1, sem 3=1, sem 4=2
        const actualYear = angkatan + yearOffset;
        const isGanjil = sem % 2 !== 0; // Ganjil = 7(Jul)-12(Des). Genap = 1(Jan)-6(Jun)
        
        start = new Date(actualYear, isGanjil ? 6 : 0, 1);
        end = new Date(actualYear, isGanjil ? 12 : 6, 0, 23, 59, 59);
      }
      break;
    case 'tahun_ini':
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      break;
    case 'spesifik_tahun':
      if (searchParams.year) {
        const y = parseInt(searchParams.year);
        start = new Date(y, 0, 1);
        end = new Date(y, 11, 31, 23, 59, 59);
      }
      break;
    // default (hari_ini) tetep pakai nilai awal start & end
  }

  // 3. Query Supabase dengan Filter Tanggal
  const { data, error } = await supabase
    .from('transactions')
    .select('*, users:user_id(name)')
    .eq('status', 'completed')
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())
    .order('created_at', { ascending: true });

  if (error) console.error(error);
  const transactions = (data as unknown) as Transaction[] || [];

  // 4. Kalkulasi Total Laporan Aktif
  let totalIncome = 0; let totalOutcome = 0;
  transactions.forEach(trx => {
    if (trx.type === 'income') totalIncome += trx.amount;
    if (trx.type === 'outcome') totalOutcome += trx.amount;
  });
  const finalBalance = totalIncome - totalOutcome;

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12 print:p-0 print:bg-white">
      <div className="max-w-5xl mx-auto space-y-6 print:space-y-4">
        
        <div className="print:hidden mb-4">
          <Link href="/" className="text-gray-500 hover:text-blue-600 hover:underline font-medium">← Kembali ke Dashboard</Link>
        </div>

        {/* Panggil Komponen Filter Client & Lempar Data yang Sudah Difilter */}
        <ReportFilter transactions={transactions} totalIncome={totalIncome} totalOutcome={totalOutcome} />

        {/* Area Print Dokumen */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 print:shadow-none print:border-none print:p-0">
          <div className="text-center mb-8 border-b-2 border-gray-800 pb-6">
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-wide">Laporan Keuangan Kas Kelas</h1>
            <p className="text-gray-600 mt-2">Periode Filter: {mode.replace('_', ' ').toUpperCase()}</p>
            <p className="text-gray-500 text-sm">Dicetak oleh: {user.name} | Tanggal Cetak: {new Date().toLocaleDateString('id-ID')}</p>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-green-50/50 border border-green-100 p-5 rounded-2xl print:border-gray-300 print:bg-transparent">
              <p className="text-sm text-green-700 font-bold mb-1">Total Pemasukan</p>
              <p className="text-2xl font-black text-green-600">Rp {totalIncome.toLocaleString('id-ID')}</p>
            </div>
            <div className="bg-red-50/50 border border-red-100 p-5 rounded-2xl print:border-gray-300 print:bg-transparent">
              <p className="text-sm text-red-700 font-bold mb-1">Total Pengeluaran</p>
              <p className="text-2xl font-black text-red-600">Rp {totalOutcome.toLocaleString('id-ID')}</p>
            </div>
            <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl print:border-gray-300 print:bg-transparent">
              <p className="text-sm text-blue-800 font-bold mb-1">Saldo Akhir Periode</p>
              <p className="text-2xl font-black text-blue-600">Rp {finalBalance.toLocaleString('id-ID')}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse print:text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-800 print:bg-gray-200">
                  <th className="p-3 border font-bold">No</th>
                  <th className="p-3 border font-bold">Tanggal</th>
                  <th className="p-3 border font-bold">Keterangan</th>
                  <th className="p-3 border font-bold text-right">Masuk (Debit)</th>
                  <th className="p-3 border font-bold text-right">Keluar (Kredit)</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-500 italic border">
                      Tidak ada transaksi kas pada periode ini.
                    </td>
                  </tr>
                ) : (
                  transactions.map((trx, index) => (
                    <tr key={trx.id} className="text-gray-700">
                      <td className="p-3 border text-center">{index + 1}</td>
                      <td className="p-3 border whitespace-nowrap">{new Date(trx.created_at).toLocaleDateString('id-ID')}</td>
                      <td className="p-3 border">
                        <span className="font-medium">{trx.notes || '-'}</span>
                      </td>
                      <td className="p-3 border text-right font-medium text-green-600 print:text-black">
                        {trx.type === 'income' ? `Rp ${trx.amount.toLocaleString('id-ID')}` : '-'}
                      </td>
                      <td className="p-3 border text-right font-medium text-red-600 print:text-black">
                        {trx.type === 'outcome' ? `Rp ${trx.amount.toLocaleString('id-ID')}` : '-'}
                      </td>
                    </tr>
                  ))
                )}
                <tr className="bg-gray-50 font-bold text-gray-900 print:bg-gray-100">
                  <td colSpan={3} className="p-3 border text-right uppercase">Total Seluruhnya</td>
                  <td className="p-3 border text-right text-green-600 print:text-black">Rp {totalIncome.toLocaleString('id-ID')}</td>
                  <td className="p-3 border text-right text-red-600 print:text-black">Rp {totalOutcome.toLocaleString('id-ID')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="hidden print:flex justify-end mt-16 pr-8">
            <div className="text-center">
              <p className="mb-16">Gorontalo, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-bold underline">{user.name}</p>
              <p>{user.title || user.role}</p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}