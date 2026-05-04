"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { addUser } from '@/app/actions/user';

export default function ManageStudentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setErrorMsg('');

    const res = await addUser(formData);

    if (res?.success) {
      router.push('/student');
      router.refresh();
    } else {
      setErrorMsg(res?.message || 'Terjadi kesalahan');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-10">
      <div className="max-w-2xl mx-auto bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100">
        
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Tambah Anggota Baru
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Buat akun untuk mahasiswa atau pengurus kelas
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
            {errorMsg}
          </div>
        )}

        <form action={handleSubmit} className="space-y-5">
          
          {/* Nama */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="Misal: Syabila"
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Username & Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username Login
              </label>
              <input
                type="text"
                name="username"
                required
                placeholder="Misal: abeloriginal"
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-lg p-3 pr-12 outline-none focus:ring-2 focus:ring-emerald-500"
                />

                {/* Icon Mata */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    // Mata terbuka
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeWidth={2} d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    // Mata tertutup
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeWidth={2} d="M3 3l18 18" />
                      <path strokeWidth={2} d="M10.58 10.58A3 3 0 0113.42 13.42" />
                      <path strokeWidth={2} d="M9.88 5.09A9.77 9.77 0 0112 4c7 0 11 8 11 8a17.6 17.6 0 01-2.5 3.5" />
                      <path strokeWidth={2} d="M6.1 6.1A17.6 17.6 0 001 12s4 8 11 8a9.77 9.77 0 005.91-2.1" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Role & Jabatan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role Sistem
              </label>
              <select
                name="role"
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="user">Mahasiswa (User)</option>
                <option value="admin">Pengurus (Admin)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jabatan Kelas
              </label>
              <input
                type="text"
                name="title"
                placeholder="Misal: Seksi Kebersihan"
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Button */}
          <div className="flex flex-col md:flex-row gap-3 pt-4">
            <Link
              href="/student"
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium text-center hover:bg-gray-200 transition"
            >
              Batal
            </Link>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {isLoading ? 'Menyimpan...' : 'Simpan Akun'}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}