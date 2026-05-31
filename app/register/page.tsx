"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '@/app/actions/register';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState('anggota');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // State Input
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const handleAction = async (formData: FormData) => {
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Validasi Front-end
    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok!');
      setIsLoading(false);
      return;
    }

    if (role === 'admin' && pin !== confirmPin) {
      setErrorMsg('Konfirmasi PIN tidak cocok!');
      setIsLoading(false);
      return;
    }

    // Tambahkan role secara eksplisit ke formData
    formData.append('role', role);

    const res = await registerUser(formData);

    if (res.success) {
      setSuccessMsg('Registrasi berhasil! Mengalihkan ke halaman login...');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } else {
      setErrorMsg(res.message);
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 py-12">
      <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
        
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Buat Akun Baru</h1>
          <p className="text-gray-500 text-sm mt-1">Daftarkan diri Anda ke Koeklips</p>
        </div>

        {/* Tab Pemilihan Role */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
          <button 
            type="button" 
            onClick={() => setRole('anggota')} 
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${role === 'anggota' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Anggota Biasa
          </button>
          <button 
            type="button" 
            onClick={() => setRole('admin')} 
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${role === 'admin' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Admin / Ketua
          </button>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center font-medium">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm text-center font-medium">
            {successMsg}
          </div>
        )}

        <form action={handleAction} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input type="text" name="username" required placeholder="Misal: budi123" className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input type="text" name="full_name" required placeholder="Sesuai KTP/KTM" className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Aktif</label>
            <input type="email" name="email" required placeholder="nama@gmail.com" className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 text-sm" />
          </div>

          {/* Grid Password dengan Tombol Toggle Bersama */}
          <div className="space-y-2">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition focus:outline-none flex items-center gap-1 cursor-pointer"
              >
                {showPassword ? "👁️ Sembunyikan" : "👁️ Lihat Password"}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 text-sm" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 text-sm" 
                />
              </div>
            </div>
          </div>

          {/* KHUSUS ADMIN: Upload KTM & PIN */}
          {role === 'admin' && (
            <div className="p-4 sm:p-5 bg-blue-50 border border-blue-100 rounded-2xl space-y-4 mt-2">
              <p className="text-xs text-blue-800 font-bold tracking-wider">VERIFIKASI KHUSUS ADMIN</p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Foto KTM/KTP</label>
                <input type="file" name="ktm_file" required accept="image/*,.pdf" className="w-full border border-gray-300 bg-white rounded-xl p-2 text-sm text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-700" />
              </div>

              {/* Grid PIN: Stack vertikal di mobile, sejajar di desktop */}
              <div className="space-y-2">
                <div className="flex justify-end md:justify-start">
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition focus:outline-none flex items-center gap-1 cursor-pointer"
                  >
                    {showPin ? "👁️ Sembunyikan" : "👁️ Lihat PIN"}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PIN (6 Digit)</label>
                    <input type={showPin ? "text" : "password"} name="pin" required maxLength={6} minLength={6} value={pin} onChange={(e) => setPin(e.target.value)} placeholder="123456" className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-[0.3em] bg-white text-gray-900 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ulangi PIN</label>
                    <input type={showPin ? "text" : "password"} name="confirmPin" required maxLength={6} minLength={6} value={confirmPin} onChange={(e) => setConfirmPin(e.target.value)} placeholder="123456" className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-[0.3em] bg-white text-gray-900 text-sm" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full block bg-blue-600 text-white text-center py-3.5 px-4 rounded-xl font-bold hover:bg-slate-800 active:bg-slate-950 transition-all disabled:opacity-50 mt-6 shadow-md border border-transparent text-sm cursor-pointer"
          >
            {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Sudah punya akun? <Link href="/login" className="text-blue-600 font-semibold hover:underline">Masuk di sini</Link>
        </p>

      </div>
    </main>
  );
}