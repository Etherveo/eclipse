"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createGroup, joinGroup } from '@/app/actions/group';
import LogoutButton from '@/app/components/LogoutButton';

export default function FormOnboarding({ 
  userId, 
  role, 
  userName, 
  availableGroups 
}: { 
  userId: string, 
  role: string, 
  userName: string,
  availableGroups: any[]
}) {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isAdmin = role === 'admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    let res;
    if (isAdmin) {
      // Admin Bikin Kelas
      res = await createGroup(inputValue, userId);
    } else {
      // Anggota Join Kelas
      res = await joinGroup(inputValue, userId);
    }

    if (res.success) {
      alert(isAdmin ? 'Kelompok berhasil dibuat!' : 'Berhasil bergabung ke kelompok!');
      router.push('/');
      router.refresh();
    } else {
      setErrorMsg(res.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-md border border-gray-100">
      
      <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-3xl mb-6 shadow-inner mx-auto">
        {isAdmin ? '🏛️' : '🤝'}
      </div>
      
      <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
        {isAdmin ? 'Buat Kelompok Baru' : 'Gabung ke Kelompok'}
      </h1>
      
      <p className="text-gray-500 text-sm mb-6 text-center leading-relaxed">
        Selamat datang, <span className="font-black text-gray-900">{userName}</span>! 
        {isAdmin 
          ? ' Silakan beri nama untuk ruang kas kelas/kelompok yang akan kamu pimpin.' 
          : ' Pilih kelas atau kelompok yang tersedia dari daftar di bawah untuk bergabung.'}
      </p>

      {errorMsg && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center font-bold">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            {isAdmin ? 'Nama Kelas / Organisasi' : 'Pilih Kelompok'}
          </label>
          
          {isAdmin ? (
            <input 
              type="text" 
              required
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Misal: Kelas XII IPA 1"
              className="w-full border border-gray-300 bg-white text-gray-900 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-sm transition-all"
            />
          ) : (
            <div className="relative">
              <select 
                required
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full border border-gray-300 bg-white text-gray-900 rounded-xl p-3.5 appearance-none outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-sm cursor-pointer transition-all"
              >
                <option value="" disabled className="text-gray-400">-- Pilih Kelompok Tersedia --</option>
                {availableGroups.length > 0 ? (
                  availableGroups.map((group) => (
                    <option key={group.id} value={group.id} className="text-gray-900 font-medium">
                      {group.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Belum ada kelompok terdaftar</option>
                )}
              </select>
              {/* Ikon panah bawah kustom supaya lebih elegan */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          )}
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading || !inputValue} 
          className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50 disabled:bg-indigo-300 shadow-md mt-2"
        >
          {isLoading ? 'Memproses...' : (isAdmin ? 'Buat Kelompok Sekarang' : 'Gabung Sekarang')}
        </button>
      </form>

      <div className="pt-6 border-t border-gray-100 mt-8 text-center">
        <p className="text-xs text-gray-400 mb-3 font-medium">Login dengan akun lain?</p>
        <div className="flex justify-center">
          {/* Tombol Logout sekarang dibungkus UI yang jelas dan kontras */}
          <div className="bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-800 px-6 py-2 rounded-xl transition text-sm font-bold cursor-pointer">
            <LogoutButton />
          </div>
        </div>
      </div>

    </div>
  );
}