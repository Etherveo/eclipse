"use client";

import { useState } from "react";
import { approveTransaction, rejectTransaction } from "@/app/actions/transaction";

export default function ActionButtons({ 
  transactionId, 
  status, 
  userRole 
}: { 
  transactionId: string, 
  status: string,
  userRole: string 
}) {
  const [isLoading, setIsLoading] = useState(false);

  // Jika status sudah bukan pending, atau bukan admin, jangan tampilkan tombol aksi
  if (status !== 'pending' || userRole !== 'admin') {
    return null;
  }

  const handleApprove = async () => {
    setIsLoading(true);
    await approveTransaction(transactionId);
    setIsLoading(false);
  };

  const handleReject = async () => {
    if (confirm("Apakah lu yakin ingin menolak dan menghapus transaksi ini?")) {
      setIsLoading(true);
      await rejectTransaction(transactionId);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2 justify-end">
      <button 
        onClick={handleApprove}
        disabled={isLoading}
        className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded-md text-xs font-semibold transition disabled:opacity-50"
      >
        {isLoading ? '...' : 'Approve'}
      </button>
      <button 
        onClick={handleReject}
        disabled={isLoading}
        className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-md text-xs font-semibold transition disabled:opacity-50"
      >
        {isLoading ? '...' : 'Reject'}
      </button>
    </div>
  );
}