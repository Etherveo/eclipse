"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { updateProfile, updatePin } from '@/app/actions/profile';
import LogoutButton from '@/app/components/LogoutButton';

export default function FormProfil({ userData }: { userData: any }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fileError, setFileError] = useState('');
  const [isEditingPin, setIsEditingPin] = useState(false);
  const [pinValue, setPinValue] = useState('');
  const [showPin, setShowPin] = useState(false);
  const hasPin = !!userData.pin_hash; // Cek apakah user sudah punya PIN sebelumnya
  
  // Mengurai data social_links dari objek JSONB database V2
  const links = userData.social_links || {};

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size > 500 * 1024) {
      setFileError('Ukuran file melebihi batas 500KB!');
      e.target.value = ''; // Reset input
    } else {
      setFileError('');
    }
  };

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

    // 🔥 FIX BUG: Tangkap file dari input dan masukkan ke payload!
    const fileInput = document.querySelector('input[name="profile_picture"]') as HTMLInputElement;
    if (fileInput && fileInput.files && fileInput.files[0]) {
      payload.append('profile_picture', fileInput.files[0]);
    }

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

      <form onSubmit={handleSubmit} suppressHydrationWarning className="space-y-5 border-b border-gray-200/20 pb-6 mb-6">
        
        {/* FOTO PROFIL */}
        <div className={`p-5 rounded-2xl border ${isDev ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center gap-4">
            {userData.profile_picture_url ? (
              <img 
                // Parsing string JSON ke array. Default ke elemen pertama.
                src={(() => {
                  try {
                    const urls = JSON.parse(userData.profile_picture_url);
                    return Array.isArray(urls) ? urls[0] : userData.profile_picture_url;
                  } catch {
                    return userData.profile_picture_url; // Fallback jika bukan JSON
                  }
                })()} 
                alt="Profile" 
                onError={(e) => {
                  // Fallback Mechanism: Jika gambar rusak, coba index selanjutnya
                  try {
                    const urls = JSON.parse(userData.profile_picture_url);
                    const currentSrc = (e.target as HTMLImageElement).src;
                    const currentIndex = urls.indexOf(currentSrc);
                    if (currentIndex > -1 && currentIndex < urls.length - 1) {
                      (e.target as HTMLImageElement).src = urls[currentIndex + 1];
                    } else {
                      (e.target as HTMLImageElement).style.display = 'none'; // Sembunyikan jika semua gagal
                    }
                  } catch (err) {}
                }}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-300 bg-white" 
              />
            ) : (
               <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-2xl">👤</div>
            )}
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-1">Ubah Foto Profil (Max 500KB)</label>
              <input 
                type="file" 
                name="profile_picture" 
                accept=".jpg,.jpeg,.png"
                onChange={handleFileChange}
                className={`w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold transition ${isDev ? 'text-gray-400 file:bg-gray-700 file:text-gray-200' : 'text-gray-500 file:bg-blue-50 file:text-blue-700'}`} 
              />
              {fileError && <p className="text-xs text-red-500 mt-1">{fileError}</p>}
            </div>
          </div>
        </div>
        
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

        {/* ================= PANEL KEAMANAN PIN KOPERASI ================= */}
        <div className={`p-5 rounded-2xl border ${isDev ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                🔒 PIN Koperasi Sistem
              </h2>
              <p className={`text-xs mt-1 ${isDev ? 'text-gray-400' : 'text-gray-500'}`}>
                {hasPin 
                  ? 'PIN Anda sudah aktif. Gunakan untuk otorisasi penarikan dan pemulihan akun.' 
                  : 'Anda belum membuat PIN. Segera buat PIN 6-digit demi keamanan koperasi Anda.'}
              </p>
            </div>
            
            {!isEditingPin ? (
              <button
                type="button"
                onClick={() => setIsEditingPin(true)}
                className={`w-full md:w-auto px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                  hasPin 
                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                    : 'bg-green-600 text-black hover:bg-green-700'
                }`}
              >
                {hasPin ? '⚙️ Ubah PIN' : '➕ Buat PIN Baru'}
              </button>
            ) : (
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex items-center" suppressHydrationWarning>
                  <input
                    type={showPin ? "text" : "password"}
                    maxLength={6}
                    placeholder="6 Digit"
                    value={pinValue}
                    onChange={(e) => setPinValue(e.target.value.replace(/\D/g, ''))}
                    className={`border rounded-xl p-2 text-center tracking-[0.3em] font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 w-32 pr-10 ${
                      isDev ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    suppressHydrationWarning
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 z-10 p-1 text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center"
                    aria-label={showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
                    suppressHydrationWarning
                  >
                    {showPin ? (
                      // Ikon Mata Dicoret (Sembunyikan)
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      // Ikon Mata (Tampilkan)
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (pinValue.length !== 6) {
                      alert('PIN wajib 6 digit!');
                      return;
                    }
                    const pinData = new FormData();
                    pinData.append('pin', pinValue);
                    const res = await updatePin(pinData);
                    if (res.success) {
                      alert('PIN Koperasi berhasil diperbarui!');
                      setIsEditingPin(false);
                      setPinValue('');
                      router.refresh();
                    } else {
                      alert(res.message);
                    }
                  }}
                  className="px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => { setIsEditingPin(false); setPinValue(''); }}
                  className="px-3 py-2 bg-gray-300 text-gray-700 hover:bg-gray-400 rounded-xl text-xs font-bold transition"
                >
                  Batal
                </button>
              </div>
            )}
          </div>
        </div>
        {/* =============================================================== */}

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