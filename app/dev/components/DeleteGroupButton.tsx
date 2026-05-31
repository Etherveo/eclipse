"use client";

import { useState } from 'react';
import { deleteGroupAction } from '@/app/actions/group';

export default function DeleteGroupButton({ groupId, groupName }: { groupId: string, groupName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteGroupAction(groupId);
    setIsOpen(false);
    setIsDeleting(false);
  };

  return (
    <>
      {/* Tombol Hapus (Kecil & Tersamar agar tidak gampang kepencet) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="text-xs font-semibold bg-red-500 text-blackrounded-2xl p-2 w-full transition-colors text-center gap-1 cursor-pointer"
      >
        <span>🗑️</span> Hapus Kelas
      </button>

      {/* Modal Confirmation Custom */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-gray-100 flex flex-col items-center rounded-3xl p-6 md:p-8 max-w-sm w-half shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-xl mb-4">
              ⚠️
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Hapus Kelompok?</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Yakin mau menghapus kelas <span className="font-bold text-gray-800">"{groupName}"</span>? Semua data anggota dan transaksi di dalamnya mungkin akan ikut terhapus permanen.
            </p>
            
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setIsOpen(false)}
                disabled={isDeleting}
                className="flex-1 bg-white text-gray-700 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 transition disabled:opacity-50 cursor-pointer"
              >
                Batal
              </button>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold text-sm active:scale-95 transition disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}