import { supabase } from '@/lib/supabase';
import { Transaction } from '@/types';

export default async function DashboardStats({ transactions }: { transactions: Transaction[] }) {
  // 1. Ambil jumlah total user/siswa
  const { count: userCount, error } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true }); // Pakai head: true biar irit, cuma ngambil angka count-nya aja

  if (error) console.error('Gagal fetch user count:', error);

  // 2. Kalkulasi Tanggal (Hari ini vs Kemarin)
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

  // Tambahin variabel outcome
  let todayIncome = 0;
  let todayOutcome = 0;
  let yesterdayIncome = 0;
  let yesterdayOutcome = 0;
  let todayTrxCount = 0;

  transactions.forEach((trx) => {
    const trxDate = new Date(trx.created_at);
    
    // Transaksi Hari Ini
    if (trxDate >= startOfToday) {
      todayTrxCount++;
      if (trx.status === 'completed') {
        if (trx.type === 'income') todayIncome += trx.amount;
        if (trx.type === 'outcome') todayOutcome += trx.amount; // Hitung pengeluaran hari ini
      }
    } 
    // Transaksi Kemarin
    else if (trxDate >= startOfYesterday && trxDate < startOfToday) {
      if (trx.status === 'completed') {
        if (trx.type === 'income') yesterdayIncome += trx.amount;
        if (trx.type === 'outcome') yesterdayOutcome += trx.amount; // Hitung pengeluaran kemarin
      }
    }
  });

  // 3. Hitung Persentase Growth (Berdasarkan Arus Kas Bersih)
  const todayNet = todayIncome - todayOutcome;
  const yesterdayNet = yesterdayIncome - yesterdayOutcome;

  let growth = 0;
  if (yesterdayNet === 0) {
    // Kalau kemarin nggak ada arus kas sama sekali
    if (todayNet > 0) growth = 100;
    else if (todayNet < 0) growth = -100;
    else growth = 0;
  } else {
    // Pembagi pakai absolute supaya kalau kemarin saldonya minus, persentasenya tetap logis arahnya
    growth = ((todayNet - yesterdayNet) / Math.abs(yesterdayNet)) * 100;
  }

  const isGrowthPositive = growth >= 0;

  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Card 1: Total Siswa */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">👥</div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Anggota</p>
        </div>
        <p className="text-2xl font-black text-gray-800">{userCount || 0} <span className="text-sm font-medium text-gray-400">Siswa</span></p>
      </div>

      {/* Card 2: Transaksi Hari Ini */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm">⚡</div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Aktivitas</p>
        </div>
        <p className="text-2xl font-black text-gray-800">{todayTrxCount} <span className="text-sm font-medium text-gray-400">Trx Baru</span></p>
      </div>

      {/* Card 3: Pemasukan Hari Ini */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm">💰</div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Masuk (Hari Ini)</p>
        </div>
        <p className="text-xl font-black text-gray-800">Rp {todayIncome.toLocaleString('id-ID')}</p>
      </div>

      {/* Card 4: Growth / Tren */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center relative overflow-hidden">
        {/* Background halus biar beda dari yang lain */}
        <div className={`absolute -right-4 -bottom-4 w-16 h-16 rounded-full opacity-20 ${isGrowthPositive ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
        
        <div className="flex items-center gap-2 mb-2 relative z-10">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${isGrowthPositive ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
            {isGrowthPositive ? '📈' : '📉'}
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tren Harian</p>
        </div>
        
        <div className="flex items-end gap-1 relative z-10">
          <p className={`text-2xl font-black ${isGrowthPositive ? 'text-emerald-600' : 'text-red-600'}`}>
            {isGrowthPositive ? '+' : ''}{growth.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-400 font-medium mb-1">vs Kemarin</p>
        </div>
      </div>
    </section>
  );
}