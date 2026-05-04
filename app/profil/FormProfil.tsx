"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { updateProfile } from '@/app/actions/profile';
import LogoutButton from '@/app/components/LogoutButton';

export default function FormProfil({ userData }: { userData: any }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: userData.name || '',
    title: userData.title || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = new FormData();
    payload.append('id', userData.id);
    payload.append('name', formData.name);
    payload.append('title', formData.title);

    const res = await updateProfile(payload);

    if (res.success) {
      alert('Profil berhasil diperbarui!');
      router.refresh();
    } else {
      alert(res.message);
    }
    
    setIsLoading(false);
  };

  // Nentuin rute kembali berdasarkan role
  const backRoute = userData.role === 'admin' ? '/' : '/user';

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Profil Saya</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola identitas dan akun kamu</p>
        </div>
        <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase ${
          userData.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {userData.role}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 border-b border-gray-100 pb-6 mb-6">
        
        {/* Info Username (Read-Only) */}
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Username Login (Tidak bisa diubah)</label>
          <input type="text" disabled value={userData.username} className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-lg p-3 cursor-not-allowed outline-none" />
        </div>

        {/* Edit Nama */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
          <input 
            type="text" 
            name="name" 
            required 
            value={formData.name} 
            onChange={handleChange} 
            className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" 
          />
        </div>

        {/* Edit Julukan/Jabatan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Julukan / Jabatan Kelas</label>
          <input 
            type="text" 
            name="title" 
            placeholder="Misal: Seksi Kebersihan"
            value={formData.title} 
            onChange={handleChange} 
            className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" 
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Link href={backRoute} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium text-center hover:bg-gray-200 transition">
            Kembali
          </Link>
          <button type="submit" disabled={isLoading} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50">
            {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>

      {/* Area Danger / Logout */}
      <div className="flex flex-col items-center justify-center p-4 bg-red-50 rounded-2xl border border-red-100">
        <p className="text-sm text-red-800 font-medium mb-3">Selesai menggunakan aplikasi?</p>
        {/* Tombol Logout dipanggil di sini */}
        <div className="bg-white px-6 py-2 rounded-lg border border-red-200 shadow-sm hover:bg-red-50 transition">
          <LogoutButton />
        </div>
      </div>

    </div>
  );
}