"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { requestOTP, verifyOTP } from '@/app/actions/otp';
import LogoutButton from '@/app/components/LogoutButton';

export default function FormVerify({ userId, userEmail }: { userId: string, userEmail: string }) {
  const router = useRouter();
  
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // PENTING: Kita tidak butuh useEffect lagi karena data userId dan userEmail
  // sudah dilempar langsung dan pasti ada nilainya dari Server.

  const handleRequestOTP = async () => {
    setIsSending(true);
    setMsg({ text: '', type: '' });
    
    // Perhatikan terminal saat lu mencet ini nanti!
    console.log(`Mengirim OTP ke: ${userEmail}...`); 
    
    const res = await requestOTP(userId, userEmail);
    if (res.success) {
      setMsg({ text: 'OTP berhasil dikirim ke email kamu!', type: 'success' });
    } else {
      setMsg({ text: res.message, type: 'error' });
    }
    setIsSending(false);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg({ text: '', type: '' });
    
    const res = await verifyOTP(userId, otp);
    if (res.success) {
      alert('Email berhasil diverifikasi! Mengalihkan ke Dashboard...');
      router.push('/');
      router.refresh();
    } else {
      setMsg({ text: res.message, type: 'error' });
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
        
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
          📧
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifikasi Email Anda</h1>
        <p className="text-gray-500 text-sm mb-6">
          Sebagai Admin, keamanan adalah prioritas. Kami perlu memverifikasi kepemilikan email <strong className="text-gray-900">{userEmail}</strong> sebelum Anda masuk.
        </p>

        {msg.text && (
          <div className={`p-3 rounded-lg text-sm mb-6 font-medium ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <input 
            type="text" 
            maxLength={6} 
            placeholder="Masukkan 6 Digit OTP" 
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full border border-gray-300 rounded-xl p-4 text-center tracking-[0.5em] font-bold text-xl outline-none focus:ring-2 focus:ring-blue-500 uppercase"
            required
          />
          
          <button type="submit" disabled={isLoading || !otp} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 shadow-sm">
            {isLoading ? 'Memverifikasi...' : 'Verifikasi & Masuk'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col gap-4">
          {/* Tombol Kirim Ulang OTP */}
          <button onClick={handleRequestOTP} disabled={isSending} className="text-sm font-semibold text-blue-600 hover:underline disabled:opacity-50">
            {isSending ? 'Mengirim Ulang...' : 'Kirim (Ulang) Kode OTP'}
          </button>
          
          <div className="flex justify-center mt-2">
            <LogoutButton />
          </div>
        </div>

      </div>
    </main>
  );
}