"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser } from '@/app/actions/auth';
import { initiateRecovery, verifyAndResetPassword } from '@/app/actions/recovery';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // State State Mesin Kontrol Mode UI
  const [mode, setMode] = useState<'login' | 'forgot' | 'reset'>('login');
  const [recoveryMethod, setRecoveryMethod] = useState<'pin' | 'otp'>('otp');
  
  // Data State Pemulihan
  const [identifier, setIdentifier] = useState('');
  const [userId, setUserId] = useState('');
  const [tokenValue, setTokenValue] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // 1. Eksekusi Login Biasa
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    const formData = new FormData(e.currentTarget);
    const res = await loginUser(formData);

    if (res?.success) {
      router.push('/');
      router.refresh();
    } else {
      setErrorMsg(res?.message || 'Gagal masuk, periksa kredensial Anda.');
      setIsLoading(false);
    }
  };

  // 2. Eksekusi Cek User & Kirim Gerbang Pengaman
  const handleInitiateRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return;

    setIsLoading(true);
    setErrorMsg('');

    const res = await initiateRecovery(identifier, recoveryMethod);
    if (res.success && res.userId) {
      setUserId(res.userId);
      setMode('reset'); // Pindah ke screen ganti password baru
    } else {
      setErrorMsg(res.message);
    }
    setIsLoading(false);
  };

  // 3. Eksekusi Eksekusi Simpan Password Baru
  const handleFinalReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenValue || !newPassword) return;

    setIsLoading(true);
    setErrorMsg('');

    const res = await verifyAndResetPassword({
      userId,
      method: recoveryMethod,
      token: tokenValue,
      newPassword
    });

    if (res.success) {
      alert('Kata sandi berhasil diubah! Silakan login dengan sandi baru.');
      // Bersihkan state & kembalikan ke form login awal
      setIdentifier('');
      setTokenValue('');
      setNewPassword('');
      setMode('login');
    } else {
      setErrorMsg(res.message);
    }
    setIsLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6" suppressHydrationWarning>
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        
        {/* ===================== MODE 1: SCREEN LOGIN ===================== */}
        {mode === 'login' && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Selamat Datang Kembali</h1>
            </div>

            {errorMsg && <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-semibold text-center">{errorMsg}</div>}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
                <input type="text" name="username" required placeholder="Masukkan username..." className="w-full border border-gray-300 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-semibold text-gray-700">Kata Sandi</label>
                  <button type="button" onClick={() => setMode('forgot')} className="text-xs font-bold text-blue-600 hover:underline">Lupa Sandi?</button>
                </div>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} name="password" required placeholder="••••••••" className="w-full border border-gray-300 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold hover:text-gray-600">
                    {showPassword ? 'Sembunyikan' : 'Lihat'}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 shadow-sm mt-2">
                {isLoading ? 'Memproses...' : 'Masuk'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 pt-2">
              Belum punya kelompok? <Link href="/register" className="font-bold text-blue-600 hover:underline">Daftar di sini</Link>
            </p>
          </div>
        )}

        {/* ===================== MODE 2: SCREEN PILIH METODE LUPA SANDI ===================== */}
        {mode === 'forgot' && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Pemulihan Akun</h1>
              <p className="text-gray-500 text-sm mt-1">Pilih metode otorisasi untuk reset kata sandi</p>
            </div>

            {errorMsg && <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-semibold text-center">{errorMsg}</div>}

            <form onSubmit={handleInitiateRecovery} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email Akun</label>
                <input type="text" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Masukkan email akun..." className="w-full border border-gray-300 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Metode Verifikasi</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setRecoveryMethod('otp')} className={`p-3 border rounded-xl font-bold text-sm text-center flex flex-col items-center justify-center gap-1 transition ${recoveryMethod === 'otp' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    <span>📧</span> <span className="text-xs">OTP ke Email</span>
                  </button>
                  <button type="button" onClick={() => setRecoveryMethod('pin')} className={`p-3 border rounded-xl font-bold text-sm text-center flex flex-col items-center justify-center gap-1 transition ${recoveryMethod === 'pin' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    <span>🔒</span> <span className="text-xs">Gunakan PIN</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => { setMode('login'); setErrorMsg(''); }} className="w-1/3 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold text-sm hover:bg-gray-200 transition">Batal</button>
                <button type="submit" disabled={isLoading || !identifier} className="w-2/3 bg-blue-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition disabled:opacity-50 shadow-sm">
                  {isLoading ? 'Mengirim...' : 'Lanjutkan'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ===================== MODE 3: SCREEN INPUT VERIFIKASI & INPUT PASSWORD BARU ===================== */}
        {mode === 'reset' && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Buat Sandi Baru</h1>
              <p className="text-gray-500 text-sm mt-1">
                {recoveryMethod === 'pin' ? 'Masukkan PIN Koperasi untuk konfirmasi' : 'Masukkan 6 digit angka OTP dari email Anda'}
              </p>
            </div>

            {errorMsg && <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-semibold text-center">{errorMsg}</div>}

            <form onSubmit={handleFinalReset} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {recoveryMethod === 'pin' ? '6 Digit PIN Koperasi' : '6 Digit Kode OTP Email'}
                </label>
                <input type="text" maxLength={6} required value={tokenValue} onChange={(e) => setTokenValue(e.target.value)} placeholder={recoveryMethod === 'pin' ? 'PIN Anda' : 'Contoh: 482019'} className="w-full border border-gray-300 rounded-xl p-3 text-center tracking-[0.2em] text-lg font-bold outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Kata Sandi Baru</label>
                <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimal 6 karakter..." className="w-full border border-gray-300 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => { setMode('forgot'); setErrorMsg(''); setTokenValue(''); }} className="w-1/3 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold text-sm hover:bg-gray-200 transition">Kembali</button>
                <button type="submit" disabled={isLoading || !tokenValue || !newPassword} className="w-2/3 bg-green-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-green-700 transition disabled:opacity-50 shadow-sm">
                  {isLoading ? 'Menyimpan...' : 'Perbarui Sandi'}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </main>
  );
}