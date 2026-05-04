"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/app/actions/auth';

export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAction = async (formData: FormData) => {
    setIsLoading(true);
    setErrorMsg('');

    const res = await loginUser(formData);

    if (res?.success) {
      // Kalau berhasil login, lempar ke halaman utama
      router.push('/');
      router.refresh(); // Refresh biar state di root update
    } else {
      setErrorMsg(res?.message || 'Gagal login');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Login Admin Kas</h1>
          <p className="text-gray-500 text-sm mt-1">Silakan masuk untuk mengelola kas kelas</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
            {errorMsg}
          </div>
        )}

        {/* Form menggunakan Server Actions bawaan Next.js */}
        <form action={handleAction} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input 
              type="text" 
              name="username"
              required
              placeholder="Masukkan username"
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              name="password"
              required
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 mt-4"
          >
            {isLoading ? 'Memeriksa...' : 'Masuk'}
          </button>
        </form>
        
      </div>
    </main>
  );
}