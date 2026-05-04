"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

// Tambahkan prop qrisUrl
export default function FormSetor({ userId, qrisUrl }: { userId: string, qrisUrl: string | null }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: '',
    payment_method: 'transfer',
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

      // Hanya upload file kalau metode transfer dan file ada
      if (formData.payment_method === 'transfer' && file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('transaction_proofs')
          .upload(fileName, file);

        if (uploadError) throw new Error('Gagal upload gambar bukti');

        const { data } = supabase.storage
          .from('transaction_proofs')
          .getPublicUrl(fileName);

        proofUrl = data.publicUrl;
      }

      const { error: insertError } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: userId,
            type: 'income', 
            amount: parseInt(formData.amount),
            payment_method: formData.payment_method,
            notes: formData.notes,
            proof_image_url: proofUrl,
            status: 'pending' 
          }
        ]);

      if (insertError) throw new Error('Gagal mengirim data setoran');

      router.push('/user');
      router.refresh();

    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Setor Uang Kas</h1>
        <p className="text-gray-500 text-sm mt-1">Isi form di bawah untuk melaporkan setoran kas kamu.</p>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6 text-sm text-blue-800">
        ℹ️ <strong>Catatan:</strong> Data yang kamu kirim akan berstatus <em>Pending</em> hingga Bendahara kelas melakukan verifikasi (Approve).
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Metode Pembayaran */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Metode Setoran</label>
          <select name="payment_method" value={formData.payment_method} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
            <option value="transfer">Transfer (QRIS/Bank)</option>
            <option value="cash">Tunai Langsung ke Bendahara</option>
          </select>
        </div>

        {/* --- AREA DINAMIS KHUSUS TRANSFER --- */}
        {formData.payment_method === 'transfer' && (
          <div className="p-5 bg-gray-50 border border-gray-200 rounded-2xl space-y-4">
            {qrisUrl ? (
              <div className="flex flex-col items-center text-center">
                <p className="text-sm font-semibold text-gray-700 mb-3">Scan QRIS untuk Membayar</p>
                <img src={qrisUrl} alt="QRIS Kelas" className="w-48 h-48 object-contain rounded-xl border border-gray-200 bg-white p-2 shadow-sm" />
              </div>
            ) : (
              <div className="text-center text-sm text-gray-500 p-4 border-2 border-dashed border-gray-300 rounded-xl">
                Belum ada QRIS yang diatur oleh Admin.
              </div>
            )}
            
            <div className="pt-2 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Bukti Transfer</label>
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full border border-gray-300 rounded-lg p-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 bg-white" />
            </div>
          </div>
        )}

        {/* Nominal dengan Datalist Autocomplete */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nominal (Rp)</label>
          <input 
            type="number" 
            name="amount" 
            required 
            min="1" 
            list="preset-nominal" // Menyambungkan input dengan datalist
            placeholder="Pilih atau ketik nominal..." 
            value={formData.amount} 
            onChange={handleChange} 
            className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-emerald-500" 
          />
          {/* Daftar Auto-complete HTML Murni */}
          <datalist id="preset-nominal">
            <option value="1000" />
            <option value="2000" />
            <option value="5000" />
            <option value="10000" />
            <option value="13000" />
            <option value="15000" />
            <option value="20000" />
            <option value="50000" />
            <option value="100000" />
          </datalist>
        </div>

        {/* Keterangan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
          <input type="text" name="notes" placeholder="Misal: Uang kas minggu ke-3" value={formData.notes} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>

        {/* Tombol Action */}
        <div className="flex gap-3 pt-4">
          <Link href="/user" className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium text-center hover:bg-gray-200 transition">
            Batal
          </Link>
          <button type="submit" disabled={isLoading} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 transition disabled:opacity-50">
            {isLoading ? 'Mengirim...' : 'Kirim Setoran'}
          </button>
        </div>

      </form>
    </div>
  );
}