"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { setTargetAdmin } from '@/app/actions/target';

export default function FormTarget() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    const formData = new FormData(e.currentTarget);
    const res = await setTargetAdmin(formData);

    if (res.success) {
      alert('Target baru berhasil ditetapkan!');
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
          <h1 className="text-2xl font-bold text-gray-800">Atur Target Kas</h1>
          <p className="text-gray-500 text-sm mt-1">Tentukan target iuran untuk kelompok ini</p>
        </div>
        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center text-xl">🎯</div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Periode Target</label>
          <select name="period_type" className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500 bg-white">
            <option value="harian">Harian</option>
            <option value="mingguan">Mingguan</option>
            <option value="bulanan">Bulanan</option>
            <option value="semester">Semester</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Nominal Target (Rp)</label>
          <input type="number" name="target_amount" required min="1" placeholder="Misal: 500000" className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi / Keterangan Singkat</label>
          <input type="text" name="description" placeholder="Misal: Uang kas untuk acara makrab" className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500" />
        </div>

        <div className="flex flex-col md:flex-row gap-3 pt-4">
          <Link href="/admin" className="w-full bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold text-center hover:bg-gray-200 transition">Batal</Link>
          <button type="submit" disabled={isLoading} className="w-full bg-purple-600 text-white py-3.5 rounded-xl font-bold hover:bg-purple-700 transition disabled:opacity-50 shadow-sm">
            {isLoading ? 'Memproses...' : 'Simpan Target'}
          </button>
        </div>
      </form>
    </div>
  );
}