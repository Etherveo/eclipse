"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { updateProfile } from '@/app/actions/profile';
import LogoutButton from '@/app/components/LogoutButton';

export default function FormProfil({ userData }: { userData: any }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Mengurai data social_links dari objek JSONB database V2
  const links = userData.social_links || {};

  const [formData, setFormData] = useState({
    full_name: userData.full_name || '',
    title: userData.title || '',
    phone_number: userData.phone_number || '',
    ig: links.ig || '',
    fb: links.fb || '',
    tiktok: links.tiktok || '',
    x: links.x || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = new FormData();
    payload.append('id', userData.id);
    payload.append('full_name', formData.full_name);
    payload.append('title', formData.title);
    payload.append('phone_number', formData.phone_number);
    payload.append('ig', formData.ig);
    payload.append('fb', formData.fb);
    payload.append('tiktok', formData.tiktok);
    payload.append('x', formData.x);

    const res = await updateProfile(payload);

    if (res.success) {
      alert('Profil berhasil diperbarui!');
      router.refresh();
    } else {
      alert(res.message);
    }
    
    setIsLoading(false);
  };

  // 🔥 SOLUSI BUG: Penentuan rute kembali secara presisi berdasarkan otoritas role aktor
  const backRoute = userData.role === 'developer' 
    ? '/dev' 
    : userData.role === 'admin' 
      ? '/admin' 
      : '/user';

  // Efek kosmetik agar tampilan beradaptasi jika diakses oleh Developer (Tema Gelap)
  const isDev = userData.role === 'developer';

  return (
    <div className={`max-w-xl mx-auto p-8 rounded-3xl shadow-sm border transition-all duration-300 ${
      isDev ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-gray-100 text-gray-800'
    }`}>
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${isDev ? 'text-white' : 'text-gray-900'}`}>Profil Saya</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola identitas diri dan akun kelompok kamu</p>
        </div>
        <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide border ${
          isDev ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
          userData.role === 'admin' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-gray-100 text-gray-700 border-gray-200'
        }`}>
          {userData.role}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 border-b border-gray-200/20 pb-6 mb-6">
        
        {/* Grid Informasi Akun Dasar (Read-Only) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Username</label>
            <input type="text" disabled value={userData.username} className={`w-full border rounded-xl p-3 text-sm cursor-not-allowed outline-none ${isDev ? 'bg-slate-950 border-slate-800 text-slate-500' : 'bg-gray-50 border-gray-200 text-gray-500'}`} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Email Sistem</label>
            <input type="text" disabled value={userData.email} className={`w-full border rounded-xl p-3 text-sm cursor-not-allowed outline-none ${isDev ? 'bg-slate-950 border-slate-800 text-slate-500' : 'bg-gray-50 border-gray-200 text-gray-500'}`} />
          </div>
        </div>

        {/* Nama Lengkap */}
        <div>
          <label className="block text-sm font-semibold mb-1">Nama Lengkap</label>
          <input 
            type="text" 
            name="full_name" 
            required 
            value={formData.full_name} 
            onChange={handleChange} 
            className={`w-full border rounded-xl p-3 text-sm Regal-input outline-none focus:ring-2 ${isDev ? 'bg-slate-950 border-slate-800 focus:ring-indigo-500 text-white' : 'border-gray-300 focus:ring-blue-500 text-gray-900'}`} 
          />
        </div>

        {/* Jabatan & Nomor WhatsApp */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Jabatan / Julukan Kelompok</label>
            <input 
              type="text" 
              name="title" 
              placeholder="Misal: Anggota Kelas"
              value={formData.title} 
              onChange={handleChange} 
              className={`w-full border rounded-xl p-3 text-sm outline-none focus:ring-2 ${isDev ? 'bg-slate-950 border-slate-800 focus:ring-indigo-500 text-white' : 'border-gray-300 focus:ring-blue-500 text-gray-900'}`} 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Nomor WhatsApp (Opsional)</label>
            <input 
              type="text" 
              name="phone_number" 
              placeholder="0812xxxxxxxx"
              value={formData.phone_number} 
              onChange={handleChange} 
              className={`w-full border rounded-xl p-3 text-sm outline-none focus:ring-2 ${isDev ? 'bg-slate-950 border-slate-800 focus:ring-indigo-500 text-white' : 'border-gray-300 focus:ring-blue-500 text-gray-900'}`} 
            />
          </div>
        </div>

        {/* --- EXPANDABLE MEDIA SOSIAL BOX (JSONB) --- */}
        <div className={`p-5 rounded-2xl border ${isDev ? 'bg-slate-950/40 border-slate-800/80' : 'bg-gray-50 border-gray-200'} space-y-4`}>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Media Sosial Pengguna</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Instagram</label>
              <input type="text" name="ig" placeholder="@username" value={formData.ig} onChange={handleChange} className={`w-full border rounded-xl p-2.5 text-sm outline-none focus:ring-2 ${isDev ? 'bg-slate-950 border-slate-800 focus:ring-indigo-500 text-white' : 'bg-white border-gray-300 focus:ring-blue-500'}`} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">TikTok</label>
              <input type="text" name="tiktok" placeholder="@username" value={formData.tiktok} onChange={handleChange} className={`w-full border rounded-xl p-2.5 text-sm outline-none focus:ring-2 ${isDev ? 'bg-slate-950 border-slate-800 focus:ring-indigo-500 text-white' : 'bg-white border-gray-300 focus:ring-blue-500'}`} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Facebook</label>
              <input type="text" name="fb" placeholder="Nama Akun" value={formData.fb} onChange={handleChange} className={`w-full border rounded-xl p-2.5 text-sm outline-none focus:ring-2 ${isDev ? 'bg-slate-950 border-slate-800 focus:ring-indigo-500 text-white' : 'bg-white border-gray-300 focus:ring-blue-500'}`} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">X (Twitter)</label>
              <input type="text" name="x" placeholder="@username" value={formData.x} onChange={handleChange} className={`w-full border rounded-xl p-2.5 text-sm outline-none focus:ring-2 ${isDev ? 'bg-slate-950 border-slate-800 focus:ring-indigo-500 text-white' : 'bg-white border-gray-300 focus:ring-blue-500'}`} />
            </div>
          </div>
        </div>

        {/* Navigasi Simpan */}
        <div className="flex gap-3 pt-2">
          <Link href={backRoute} className={`flex-1 py-3 rounded-xl font-semibold text-sm text-center transition ${isDev ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            Kembali
          </Link>
          <button type="submit" disabled={isLoading} className={`flex-1 py-3 rounded-xl font-semibold text-sm transition disabled:opacity-50 ${isDev ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/10' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
            {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>

      {/* Danger Zone: Pemicu Token Keluar */}
      <div className={`flex flex-col items-center justify-center p-4 rounded-2xl border ${isDev ? 'bg-rose-950/10 border-rose-900/20' : 'bg-red-50 border-red-100'}`}>
        <p className={`text-sm font-medium mb-3 ${isDev ? 'text-rose-400' : 'text-red-800'}`}>Selesai menggunakan aplikasi?</p>
        <div className={`px-6 py-2 rounded-xl border shadow-sm transition ${isDev ? 'bg-slate-950 border-slate-800 hover:bg-slate-900' : 'bg-white border-red-200 hover:bg-red-50'}`}>
          <LogoutButton />
        </div>
      </div>

    </div>
  );
}