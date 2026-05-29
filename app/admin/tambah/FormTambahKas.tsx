"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { addTransactionAdmin } from '@/app/actions/transaction';

type Member = { id: string; full_name: string; role: string };

export default function FormTambahKas({ members, currentUserId }: { members: Member[], currentUserId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // State form
  const [type, setType] = useState('income');
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    const formData = new FormData(e.currentTarget);
    const res = await addTransactionAdmin(formData);

    if (res.success) {
      alert('Transaksi berhasil dicatat & disetujui!');
      router.push('/admin');
      router.refresh();
    } else {
      setErrorMsg(res.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100">
      <div className="mb-8 border-b border-gray-100 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Catat Transaksi Kelas</h1>
          <p className="text-gray-500 text-sm mt-1">Input kas masuk atau pengeluaran</p>
        </div>
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xl">
          💸
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          {/* Tipe */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tipe Transaksi</label>
            <select name="type" value={type} onChange={(e) => setType(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="income">Uang Masuk (+)</option>
              <option value="outcome">Pengeluaran (-)</option>
            </select>
          </div>
          
          {/* Metode Pembayaran */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Metode Bayar</label>
            <select name="payment_method" className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="cash">Tunai (Cash)</option>
              <option value="transfer">Transfer Bank / QRIS</option>
            </select>
          </div>
        </div>

        {/* Pilihan Anggota (Dinamis) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {type === 'income' ? 'Setoran Atas Nama' : 'Penanggung Jawab Pengeluaran'}
          </label>
          <select name="user_id" required defaultValue={currentUserId} className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer">
            <option value="" disabled>-- Pilih Anggota --</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name} {m.id === currentUserId ? '(Anda)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Nominal */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Nominal (Rp)</label>
          <input type="number" name="amount" required min="1" placeholder="Misal: 20000" className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        {/* Keterangan */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Keterangan / Notes</label>
          <input type="text" name="notes" required placeholder="Misal: Uang kas bulan maret" className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        {/* Bukti (Opsional) */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Bukti (Opsional)</label>
          <input type="file" name="proof_file" accept="image/*" className="w-full border border-gray-300 bg-white rounded-xl p-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition" />
        </div>

        {/* Tombol */}
        <div className="flex flex-col md:flex-row gap-3 pt-4">
          <Link href="/admin" className="w-full bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold text-center hover:bg-gray-200 transition">
            Batal
          </Link>
          <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 shadow-sm shadow-blue-600/20">
            {isLoading ? 'Memproses...' : 'Catat & Setujui'}
          </button>
        </div>
      </form>
    </div>
  );
}