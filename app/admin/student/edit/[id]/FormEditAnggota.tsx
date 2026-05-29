"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { updateUser } from '@/app/actions/user';

export default function FormEditAnggota({ targetUser }: { targetUser: any }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const links = targetUser.social_links || {};

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    // Validasi PIN Sementara Admin
    const pin = window.prompt(`🔒 Otorisasi Keamanan\nMasukkan 6 Digit PIN Admin Anda untuk mengubah data ${targetUser.full_name}:`);
    if (pin === null) {
      setIsLoading(false);
      return; 
    }
    if (pin.length !== 6) {
      setErrorMsg('PIN Otorisasi tidak valid!');
      setIsLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const res = await updateUser(targetUser.id, formData);

    if (res?.success) {
      alert('Data anggota berhasil diperbarui!');
      router.push('/admin/student');
      router.refresh();
    } else {
      setErrorMsg(res?.message || 'Terjadi kesalahan saat mengupdate');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100">
      <div className="mb-6 border-b border-gray-100 pb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Full Access: Edit Anggota</h1>
        <p className="text-gray-500 text-sm mt-1">Mengubah identitas, data sensitif, dan peran akun <span className="font-bold text-gray-700">@{targetUser.username}</span></p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* IDENTITAS UTAMA */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider">A. Identitas Utama</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input type="text" name="full_name" defaultValue={targetUser.full_name} required className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username Login</label>
              <input type="text" name="username" defaultValue={targetUser.username} required className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* DATA SENSITIF */}
        <div className="space-y-4 bg-gray-50 p-5 rounded-2xl border border-gray-200">
          <h2 className="text-sm font-bold text-amber-600 uppercase tracking-wider">B. Data Sensitif & Kontak</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Sistem</label>
              <input type="email" name="email" defaultValue={targetUser.email} required className="w-full border border-gray-300 bg-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomor WhatsApp</label>
              <input type="text" name="phone_number" defaultValue={targetUser.phone_number || ''} placeholder="0812xxxxxxxx" className="w-full border border-gray-300 bg-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
              <input type="text" name="ig" defaultValue={links.ig || ''} placeholder="@username" className="w-full border border-gray-300 bg-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">TikTok</label>
              <input type="text" name="tiktok" defaultValue={links.tiktok || ''} placeholder="@username" className="w-full border border-gray-300 bg-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* OTORITAS SISTEM */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-purple-600 uppercase tracking-wider">C. Otoritas Sistem</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role Sistem</label>
              <select name="role" defaultValue={targetUser.role} className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="anggota">Anggota Biasa</option>
                <option value="admin">Admin / Pengurus</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status Persetujuan</label>
              <select name="approval_status" defaultValue={targetUser.approval_status} className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan Kelas</label>
              <input type="text" name="title" defaultValue={targetUser.title || ''} placeholder="Misal: Bendahara 2" className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 pt-6 border-t border-gray-100">
          <Link href="/admin/student" className="w-full bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold text-center hover:bg-gray-200 transition">
            Kembali
          </Link>
          <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50">
            {isLoading ? 'Memproses...' : 'Simpan Semua Perubahan'}
          </button>
        </div>
      </form>
    </div>
  );
}