"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { refreshSessionStatus } from '@/app/actions/auth';

export default function CheckStatusButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCheck = async () => {
    setIsLoading(true);
    const res = await refreshSessionStatus();

    if (res.changed) {
      // Cookie sudah di-update! Lempar ke Root biar diproses oleh sistem redirector
      router.push('/');
      router.refresh();
    } else {
      alert('Status kamu saat ini masih Pending. Coba cek lagi nanti ya!');
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheck}
      disabled={isLoading}
      className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-xl transition shadow-sm disabled:opacity-50 mb-2"
    >
      {isLoading ? 'Mengecek Database...' : 'Cek Status Persetujuan'}
    </button>
  );
}