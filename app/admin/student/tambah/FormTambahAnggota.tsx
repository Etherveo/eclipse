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
      router.push('/admin/student'); // Redirect ke route admin yang benar
      router.refresh();
    } else {
      setErrorMsg(res?.message || 'Terjadi kesalahan');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100">
      
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Tambah Anggota Baru</h1>
        <p className="text-gray-500 text-sm mt-1">Buat akun untuk anggota atau pengurus kelompok</p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center font-medium">
          {errorMsg}
        </div>
      )}

      <form action={handleSubmit} className="space-y-5">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
          <input
            type="text"
            name="full_name" // Gunakan key full_name
            required
            placeholder="Sesuai KTM/KTP"
            className="w-full border border-gray-300 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username Login</label>
            <input
              type="text"
              name="username"
              required
              placeholder="Misal: abeloriginal"
              className="w-full border border-gray-300 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password Sementara</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-xl p-3.5 pr-12 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? 'Tutup' : 'Lihat'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role Sistem</label>
            <select
              name="role"
              className="w-full border border-gray-300 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="anggota">Anggota Biasa</option>
              <option value="admin">Admin / Pengurus</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan Kelas</label>
            <input
              type="text"
              name="title"
              placeholder="Misal: Seksi Kebersihan"
              className="w-full border border-gray-300 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 pt-4">
          <Link
            href="/admin/student"
            className="w-full bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold text-center hover:bg-gray-200 transition"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isLoading ? 'Menyimpan...' : 'Simpan Akun'}
          </button>
        </div>

      </form>
    </div>
  );
}