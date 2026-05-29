"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { deleteUser } from '@/app/actions/user';

export default function StudentActionButtons({ 
  userId, 
  targetName, 
  currentUserId 
}: { 
  userId: string, 
  targetName: string,
  currentUserId: string
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  // Sembunyikan tombol untuk diri sendiri (ngeditnya di Profil)
  if (userId === currentUserId) return <span className="text-xs font-semibold text-gray-400 italic">Akun Anda</span>;

  const handleDelete = async () => {
    // Validasi PIN
    const pin = window.prompt(`🔒 Otorisasi Keamanan\nMasukkan 6 Digit PIN Admin Anda untuk menghapus ${targetName}:`);
    if (pin === null) return; 
    if (pin.length !== 6) {
      alert('PIN tidak valid!');
      return;
    }

    // Konfirmasi
    if (confirm(`Tindakan ini permanen!\nData ${targetName} akan dihapus. Lanjutkan?`)) {
      setIsDeleting(true);
      const res = await deleteUser(userId);
      if (res.success) {
        alert('Anggota berhasil dihapus.');
        router.refresh();
      } else {
        alert(res.message);
      }
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex gap-2 justify-end items-center">
      <Link 
        href={`/admin/student/edit/${userId}`} 
        className="px-3 py-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg text-xs font-bold transition"
      >
        Edit
      </Link>
      <button 
        onClick={handleDelete} 
        disabled={isDeleting} 
        className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-bold transition disabled:opacity-40"
      >
        {isDeleting ? '...' : 'Hapus'}
      </button>
    </div>
  );
}