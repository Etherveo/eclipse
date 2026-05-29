"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { addTransactionUser } from '@/app/actions/transaction';

export default function FormSetor({ qrisUrl }: { qrisUrl: string | null }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [paymentMethod, setPaymentMethod] = useState('transfer');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    const formData = new FormData(e.currentTarget);
    const res = await addTransactionUser(formData);

    if (res.success) {
      alert('Setoran berhasil dikirim dan menunggu konfirmasi Bendahara!');
      router.push('/user');
      router.refresh();
    } else {
      setErrorMsg(res.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Setor Uang Kas</h1>
        <p className="text-gray-500 text-sm mt-1">Isi form di bawah untuk melaporkan setoran kas kamu.</p>
      </div>

      <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl mb-6 text-sm text-amber-800">
        ℹ️ <strong>Catatan:</strong> Data yang kamu kirim akan berstatus <em>Pending</em> hingga Bendahara kelas melakukan verifikasi (Approve).
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Metode Pembayaran */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Metode Setoran</label>
          <select name="payment_method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500 bg-white cursor-pointer">
            <option value="transfer">Transfer (QRIS / Bank)</option>
            <option value="cash">Tunai Langsung ke Bendahara</option>
          </select>
        </div>

        {/* --- AREA DINAMIS KHUSUS TRANSFER --- */}
        {paymentMethod === 'transfer' && (
          <div className="p-5 bg-gray-50 border border-gray-200 rounded-2xl space-y-4 transition-all">
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
              <input type="file" name="proof_file" accept="image/*" required={paymentMethod === 'transfer'} className="w-full border border-gray-300 rounded-xl p-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 bg-white transition" />
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
            list="preset-nominal" 
            placeholder="Pilih atau ketik nominal..." 
            className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500" 
          />
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan Singkat</label>
          <input type="text" name="notes" required placeholder="Misal: Uang kas minggu ke-3" className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>

        {/* Tombol Action */}
        <div className="flex flex-col md:flex-row gap-3 pt-4">
          <Link href="/user" className="w-full bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold text-center hover:bg-gray-200 transition">
            Batal
          </Link>
          <button type="submit" disabled={isLoading} className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700 transition disabled:opacity-50 shadow-sm">
            {isLoading ? 'Mengirim...' : 'Kirim Setoran'}
          </button>
        </div>

      </form>
    </div>
  );
}