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
  if (userId === currentUserId) return <Link href="../../profil" className="items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-100 transition shadow-sm font-medium text-gray-700 text-sm">
    Edit Akun</Link>;

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