"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function FormTarget() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    period_type: 'mingguan',
    target_amount: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('targets')
        .insert([
          {
            period_type: formData.period_type,
            target_amount: parseInt(formData.target_amount),
            description: formData.description || null,
          }
        ]);

      if (error) throw new Error('Gagal menyimpan target iuran');

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
        <h1 className="text-2xl font-bold text-gray-800">Atur Target Iuran</h1>
        <p className="text-gray-500 text-sm mt-1">Set nominal kewajiban kas kelas</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Periode</label>
          <select 
            name="period_type" 
            value={formData.period_type} 
            onChange={handleChange} 
            className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="harian">Harian</option>
            <option value="mingguan">Mingguan</option>
            <option value="bulanan">Bulanan</option>
            <option value="semester">Semester</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nominal Target (Rp)</label>
          <input 
            type="number" 
            name="target_amount" 
            required min="1" 
            placeholder="Misal: 20000" 
            value={formData.target_amount} 
            onChange={handleChange} 
            className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan (Opsional)</label>
          <input 
            type="text" 
            name="description" 
            placeholder="Misal: Iuran mingguan wajib buat beli spidol" 
            value={formData.description} 
            onChange={handleChange} 
            className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" 
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Link href="/" className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium text-center hover:bg-gray-200 transition">
            Batal
          </Link>
          <button type="submit" disabled={isLoading} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50">
            {isLoading ? 'Menyimpan...' : 'Simpan Target'}
          </button>
        </div>
      </form>
    </div>
  );
}