"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function FormKas({ userId }: { userId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // State form disesuaikan dengan kolom SQL baru
  const [formData, setFormData] = useState({
    type: 'income',
    amount: '',
    payment_method: 'cash',
    notes: '',
  });
  const [file, setFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let proofUrl = null;

      // 1. Upload Bukti jika ada
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('transaction_proofs')
          .upload(fileName, file);

        if (uploadError) {
          console.error(uploadError);
          throw new Error('Gagal upload gambar bukti');
        }

        const { data } = supabase.storage
          .from('transaction_proofs')
          .getPublicUrl(fileName);

        proofUrl = data.publicUrl;
      }

      // 2. Insert ke tabel transactions
      const { error: insertError } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: userId, // Diambil dari props session
            type: formData.type,
            amount: parseInt(formData.amount),
            payment_method: formData.payment_method,
            notes: formData.notes,
            proof_image_url: proofUrl,
            status: 'pending' // Default status
          }
        ]);

      if (insertError) {
        console.error(insertError);
        throw new Error('Gagal menyimpan ke database');
      }

      // 3. Berhasil -> Balik ke Dashboard
      router.push('/');
      router.refresh();

    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Catat Transaksi Baru</h1>
        <p className="text-gray-500 text-sm mt-1">Sistem pencatatan kas otomatis</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          {/* Tipe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
            <select name="type" value={formData.type} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="income">Pemasukan (+)</option>
              <option value="outcome">Pengeluaran (-)</option>
            </select>
          </div>
          
          {/* Metode Pembayaran */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Metode</label>
            <select name="payment_method" value={formData.payment_method} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="cash">Tunai (Cash)</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>
        </div>

        {/* Nominal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nominal (Rp)</label>
          <input type="number" name="amount" required min="1" placeholder="Misal: 15000" value={formData.amount} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        {/* Keterangan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan / Notes</label>
          <input type="text" name="notes" required placeholder="Misal: Uang kas Lea bulan Maret" value={formData.notes} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        {/* Bukti */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bukti Transaksi (Opsional)</label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full border border-gray-300 rounded-lg p-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
        </div>

        {/* Tombol */}
        <div className="flex gap-3 pt-4">
          <Link href="/" className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium text-center hover:bg-gray-200 transition">
            Batal
          </Link>
          <button type="submit" disabled={isLoading} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50">
            {isLoading ? 'Menyimpan...' : 'Simpan Data'}
          </button>
        </div>
      </form>
    </div>
  );
}