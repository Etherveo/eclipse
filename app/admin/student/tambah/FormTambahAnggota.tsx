"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { addUser } from '@/app/actions/user';

export default function FormTambahAnggota() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setErrorMsg('');

    const res = await addUser(formData);

    if (res?.success) {
      router.push('/admin/student');
      router.refresh();
    } else {
      setErrorMsg(res?.message || 'Terjadi kesalahan');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 md:p-10 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100">
      
      {/* Header Diperbagus */}
      <div className="text-center gap-4 mb-8 pb-6 border-b border-gray-100">
        {/* <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-2xl shadow-inner shrink-0">
          ✨
        </div> */}
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Tambah Anggota</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">Buat akun untuk anggota atau pengurus kelas baru</p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-semibold flex items-center gap-2">
          <span>⚠️</span> {errorMsg}
        </div>
      )}

      <form action={handleSubmit} className="space-y-6">
        
        {/* Input Nama Lengkap */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700 ml-1">Nama Lengkap</label>
          <input
            type="text"
            name="full_name"
            required
            placeholder="Sesuai KTM/KTP"
            className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-2xl p-4 text-sm outline-none transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Username */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 ml-1">Username Login</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium"></span>
              <input
                type="text"
                name="username"
                required
                placeholder="Misal: budimannn"
                className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-2xl p-4 pl-9 text-sm outline-none transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Input Password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 ml-1">Password Sementara</label>
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                placeholder="••••••••"
                className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-2xl p-4 pr-16 text-sm outline-none transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 font-medium text-xs bg-white px-2.5 py-1.5 rounded-lg border border-gray-200 shadow-sm transition-colors"
              >
                {showPassword ? 'Tutup' : 'Lihat'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Role */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 ml-1">Role Sistem</label>
            <select
              name="role"
              className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-2xl p-4 text-sm outline-none transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="anggota">Anggota Biasa</option>
              <option value="admin">Admin / Pengurus</option>
            </select>
          </div>

          {/* Input Jabatan */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700 ml-1">Jabatan</label>
            <input
              type="text"
              name="title"
              placeholder="Misal: Wakil Ketua"
              className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-2xl p-4 text-sm outline-none transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Tombol Action Dirombak */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-4 border-t border-gray-100">
          <Link
            href="/admin/student"
            className="w-full sm:w-1/3 bg-white border-2 border-gray-200 text-gray-700 py-3.5 rounded-2xl font-bold text-center hover:bg-gray-50 hover:border-gray-300 transition-all text-sm flex items-center justify-center"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-2/3 bg-blue-600 text-white py-3.5 rounded-2xl font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 active:scale-[0.98] transition-all disabled:opacity-50 text-sm flex justify-center items-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <span className="animate-spin text-xl">⏳</span> Menyimpan...
              </>
            ) : 'Simpan Akun Anggota'}
          </button>
        </div>

      </form>
    </div>
  );
}