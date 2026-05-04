"use client";

import { useRouter } from 'next/navigation';
import { logoutUser } from '@/app/actions/auth';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    // Panggil server action untuk hapus cookie
    await logoutUser();
    
    // Arahkan kembali ke halaman login dan refresh state
    router.push('/login');
    router.refresh();
  };

  return (
    <button 
      onClick={handleLogout} 
      className="text-red-500 font-medium cursor-pointer hover:text-red-700 hover:underline transition bg-transparent border-none p-0"
    >
      Logout
    </button>
  );
}