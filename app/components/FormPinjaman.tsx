"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { requestPinjaman } from '@/app/actions/pinjaman';

export default function FormPinjaman({ backRoute, role }: { backRoute: string, role: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    const formData = new FormData(e.currentTarget);
    const res = await requestPinjaman(formData);

    if (res.success) {
      alert('Pengajuan pinjaman berhasil dikirim! Silakan tunggu konfirmasi.');
      router.push(backRoute);
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
          <h1 className="text-2xl font-bold text-gray-800">Pengajuan Pinjaman</h1>
          <p className="text-gray-500 text-sm mt-1">Fasilitas dana darurat kas kelompok</p>
        </div>
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center text-xl">
          💳
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6 text-sm text-blue-800 space-y-2">
        <p className="font-bold">Syarat & Ketentuan Koperasi:</p>
        <ul className="list-disc list-inside pl-2 space-y-1">
          <li>Maksimal pinjaman <strong>Rp 20.000</strong> per pengajuan.</li>
          <li>Hanya diperbolehkan <strong>1x dalam sebulan</strong>.</li>
          <li>Wajib melampirkan <strong>KTM asli</strong> sebagai jaminan.</li>
          {role === 'admin' && <li>Sebagai Admin, pengajuan ini akan diteruskan ke <strong>Ketua</strong> kelompok.</li>}
        </ul>
      </div>

      {errorMsg && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Nominal Pinjaman (Rp)</label>
          <input 
            type="number" 
            name="amount" 
            required 
            min="1" 
            max="20000" 
            placeholder="Maksimal 20000" 
            className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-rose-500" 
          />
        </div>

        <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Jaminan KTM</label>
          <input 
            type="file" 
            name="ktm_file" 
            accept=".jpg,.jpeg,.png,.pdf" 
            required 
            className="w-full border border-gray-300 bg-white rounded-xl p-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-rose-100 file:text-rose-700 hover:file:bg-rose-200 transition" 
          />
        </div>

        <div className="flex flex-col md:flex-row gap-3 pt-4 border-t border-gray-100">
          <Link href={backRoute} className="w-full bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold text-center hover:bg-gray-200 transition">
            Batal
          </Link>
          <button type="submit" disabled={isLoading} className="w-full bg-rose-600 text-white py-3.5 rounded-xl font-bold hover:bg-rose-700 transition disabled:opacity-50 shadow-sm shadow-rose-600/20">
            {isLoading ? 'Mengirim...' : 'Ajukan Pinjaman'}
          </button>
        </div>
      </form>
    </div>
  );
}